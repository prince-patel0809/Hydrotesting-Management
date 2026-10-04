from datetime import date, datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse


def calculate_validity_metadata(
    test_date: date,
    next_due_date: date,
    reference_date: Optional[date] = None,
    latest_result: Optional[str] = None
) -> Tuple[int, str]:
    """
    Computes days until next due date and validity category:
    - Overdue: next_due_date < today
    - Due Soon: today <= next_due_date <= today + 30 days
    - Valid: next_due_date > today + 30 days (or next_due_date >= today without failure)
    """
    ref_date = reference_date or date.today()
    days = (next_due_date - ref_date).days

    if days < 0:
        category = "Overdue"
    elif 0 <= days <= 30:
        category = "Due Soon"
    else:
        category = "Valid"

    return days, category


def format_asset_doc(doc: Dict[str, Any], ref_date: Optional[date] = None) -> Dict[str, Any]:
    """Helper to convert MongoDB document to AssetResponse-ready dictionary."""
    if not doc:
        return doc
    ref_date = ref_date or date.today()
    
    # Extract dates
    t_date = doc["test_date"]
    if isinstance(t_date, str):
        t_date = date.fromisoformat(t_date)
    elif isinstance(t_date, datetime):
        t_date = t_date.date()

    nd_date = doc["next_due_date"]
    if isinstance(nd_date, str):
        nd_date = date.fromisoformat(nd_date)
    elif isinstance(nd_date, datetime):
        nd_date = nd_date.date()

    created_at = doc.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)

    updated_at = doc.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)

    days, validity = calculate_validity_metadata(t_date, nd_date, ref_date)

    return {
        "id": str(doc.get("_id", "")),
        "asset_id": doc["asset_id"],
        "station": doc["station"],
        "asset_type": doc["asset_type"],
        "serial_number": doc["serial_number"],
        "test_date": t_date,
        "next_due_date": nd_date,
        "status": doc.get("status", "Active"),
        "created_at": created_at,
        "updated_at": updated_at,
        "days_until_due": days,
        "validity_category": validity,
        "latest_test_result": doc.get("latest_test_result"),
        "hydrotest_count": doc.get("hydrotest_count", 0),
    }


class AssetService:
    @staticmethod
    async def create_asset(data: AssetCreate) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        
        # Check uniqueness of asset_id
        existing = await db.assets.find_one({"asset_id": data.asset_id})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Asset with ID '{data.asset_id}' already exists."
            )

        now = datetime.now(timezone.utc)
        doc = {
            "asset_id": data.asset_id,
            "station": data.station,
            "asset_type": data.asset_type,
            "serial_number": data.serial_number,
            "test_date": data.test_date.isoformat(),
            "next_due_date": data.next_due_date.isoformat(),
            "status": data.status,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "hydrotest_count": 0,
            "latest_test_result": None
        }

        result = await db.assets.insert_one(doc)
        doc["_id"] = result.inserted_id
        return format_asset_doc(doc)

    @staticmethod
    async def get_asset(asset_id: str) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        clean_id = asset_id.strip().upper()
        doc = await db.assets.find_one({"asset_id": clean_id})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset '{clean_id}' was not found."
            )

        # Count records and get latest test result
        records_count = await db.records.count_documents({"asset_id": clean_id})
        latest_record = await db.records.find_one({"asset_id": clean_id}, sort=[("test_date", -1), ("created_at", -1)])
        doc["hydrotest_count"] = records_count
        doc["latest_test_result"] = latest_record["result"] if latest_record else None

        return format_asset_doc(doc)

    @staticmethod
    async def list_assets(
        search: Optional[str] = None,
        station: Optional[str] = None,
        asset_type: Optional[str] = None,
        status_val: Optional[str] = None,
        validity: Optional[str] = None,
        due_from: Optional[date] = None,
        due_to: Optional[date] = None,
        sort_by: str = "next_due_date",
        sort_order: str = "asc"
    ) -> List[Dict[str, Any]]:
        db: AsyncIOMotorDatabase = await get_database()
        query: Dict[str, Any] = {}

        if station:
            query["station"] = {"$regex": f"^{station.strip()}$", "$options": "i"}

        if asset_type:
            query["asset_type"] = {"$regex": f"^{asset_type.strip()}$", "$options": "i"}

        if status_val:
            query["status"] = {"$regex": f"^{status_val.strip()}$", "$options": "i"}

        if due_from or due_to:
            date_filter: Dict[str, Any] = {}
            if due_from:
                date_filter["$gte"] = due_from.isoformat()
            if due_to:
                date_filter["$lte"] = due_to.isoformat()
            query["next_due_date"] = date_filter

        if search:
            s = search.strip()
            query["$or"] = [
                {"asset_id": {"$regex": s, "$options": "i"}},
                {"serial_number": {"$regex": s, "$options": "i"}},
                {"station": {"$regex": s, "$options": "i"}},
                {"asset_type": {"$regex": s, "$options": "i"}},
            ]

        # Determine sort direction
        direction = 1 if sort_order.lower() == "asc" else -1
        valid_sort_fields = {"next_due_date", "test_date", "asset_id", "station", "asset_type", "status", "created_at"}
        sort_field = sort_by if sort_by in valid_sort_fields else "next_due_date"

        cursor = db.assets.find(query).sort(sort_field, direction)
        docs = await cursor.to_list(length=1000)

        # Enrich docs with counts and validity
        enriched = []
        today = date.today()
        for doc in docs:
            # Check latest record
            latest_rec = await db.records.find_one({"asset_id": doc["asset_id"]}, sort=[("test_date", -1), ("created_at", -1)])
            rec_count = await db.records.count_documents({"asset_id": doc["asset_id"]})
            doc["hydrotest_count"] = rec_count
            doc["latest_test_result"] = latest_rec["result"] if latest_rec else None
            formatted = format_asset_doc(doc, today)

            # Filter by validity category if requested
            if validity and formatted["validity_category"].lower() != validity.lower():
                continue
            enriched.append(formatted)

        return enriched

    @staticmethod
    async def update_asset(asset_id: str, data: AssetUpdate) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        clean_id = asset_id.strip().upper()
        existing = await db.assets.find_one({"asset_id": clean_id})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset '{clean_id}' was not found."
            )

        # Validate date logic against current or updated values
        current_test_date = date.fromisoformat(existing["test_date"]) if isinstance(existing["test_date"], str) else existing["test_date"]
        current_next_due = date.fromisoformat(existing["next_due_date"]) if isinstance(existing["next_due_date"], str) else existing["next_due_date"]

        effective_test_date = data.test_date if data.test_date is not None else current_test_date
        effective_next_due = data.next_due_date if data.next_due_date is not None else current_next_due

        if effective_next_due < effective_test_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Next-due date cannot be earlier than test date."
            )

        update_fields: Dict[str, Any] = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if data.station is not None:
            update_fields["station"] = data.station
        if data.asset_type is not None:
            update_fields["asset_type"] = data.asset_type
        if data.serial_number is not None:
            update_fields["serial_number"] = data.serial_number
        if data.test_date is not None:
            update_fields["test_date"] = data.test_date.isoformat()
        if data.next_due_date is not None:
            update_fields["next_due_date"] = data.next_due_date.isoformat()
        if data.status is not None:
            update_fields["status"] = data.status

        # Preserve created_at: we only $set the modified fields and updated_at
        await db.assets.update_one({"asset_id": clean_id}, {"$set": update_fields})
        updated_doc = await db.assets.find_one({"asset_id": clean_id})
        
        # Enrich
        latest_rec = await db.records.find_one({"asset_id": clean_id}, sort=[("test_date", -1), ("created_at", -1)])
        rec_count = await db.records.count_documents({"asset_id": clean_id})
        updated_doc["hydrotest_count"] = rec_count
        updated_doc["latest_test_result"] = latest_rec["result"] if latest_rec else None

        return format_asset_doc(updated_doc)
