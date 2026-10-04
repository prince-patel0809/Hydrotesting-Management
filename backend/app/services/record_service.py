import uuid
from datetime import date, datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.record import RecordCreate, RecordUpdate


def format_record_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc

    t_date = doc["test_date"]
    if isinstance(t_date, str):
        t_date = date.fromisoformat(t_date)
    elif isinstance(t_date, datetime):
        t_date = t_date.date()

    created_at = doc.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)

    updated_at = doc.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)

    return {
        "id": str(doc.get("_id", "")),
        "record_id": doc["record_id"],
        "asset_id": doc["asset_id"],
        "test_date": t_date,
        "performed_by": doc["performed_by"],
        "result": doc["result"],
        "notes": doc.get("notes", ""),
        "report_filename": doc.get("report_filename"),
        "created_at": created_at,
        "updated_at": updated_at,
    }


class RecordService:
    @staticmethod
    async def create_record(data: RecordCreate) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        clean_asset_id = data.asset_id.strip().upper()

        # 1. Verify referenced asset exists
        asset = await db.assets.find_one({"asset_id": clean_asset_id})
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cannot create hydrotest record: Referenced asset '{clean_asset_id}' does not exist."
            )

        # 2. Determine record_id
        if data.record_id:
            clean_rec_id = data.record_id.strip().upper()
            existing_rec = await db.records.find_one({"record_id": clean_rec_id})
            if existing_rec:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Hydrotest record with ID '{clean_rec_id}' already exists."
                )
        else:
            # Generate sequential/unique identifier
            count = await db.records.count_documents({})
            clean_rec_id = f"HTR-{data.test_date.year}-{count + 1:04d}"
            # Ensure unique even if count collided
            while await db.records.find_one({"record_id": clean_rec_id}):
                clean_rec_id = f"HTR-{data.test_date.year}-{uuid.uuid4().hex[:6].upper()}"

        now = datetime.now(timezone.utc)
        doc = {
            "record_id": clean_rec_id,
            "asset_id": clean_asset_id,
            "test_date": data.test_date.isoformat(),
            "performed_by": data.performed_by.strip(),
            "result": data.result.value,
            "notes": data.notes or "",
            "report_filename": data.report_filename,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        result = await db.records.insert_one(doc)
        doc["_id"] = result.inserted_id

        # Update asset test count and status if appropriate
        rec_count = await db.records.count_documents({"asset_id": clean_asset_id})
        asset_updates: Dict[str, Any] = {
            "hydrotest_count": rec_count,
            "updated_at": now.isoformat()
        }

        # If this is the latest test date for this asset, update asset test_date
        asset_test_date = date.fromisoformat(asset["test_date"]) if isinstance(asset["test_date"], str) else asset["test_date"]
        if data.test_date >= asset_test_date:
            asset_updates["test_date"] = data.test_date.isoformat()
            if data.result.value == "Fail":
                asset_updates["status"] = "Maintenance"
            elif data.result.value == "Pass" and asset.get("status") == "Maintenance":
                asset_updates["status"] = "Active"

        await db.assets.update_one({"asset_id": clean_asset_id}, {"$set": asset_updates})

        return format_record_doc(doc)

    @staticmethod
    async def get_record(record_id: str) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        clean_id = record_id.strip().upper()
        doc = await db.records.find_one({"record_id": clean_id})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hydrotest record '{clean_id}' was not found."
            )
        return format_record_doc(doc)

    @staticmethod
    async def update_record(record_id: str, data: RecordUpdate) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        clean_id = record_id.strip().upper()
        existing = await db.records.find_one({"record_id": clean_id})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hydrotest record '{clean_id}' was not found."
            )

        update_fields: Dict[str, Any] = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if data.test_date is not None:
            update_fields["test_date"] = data.test_date.isoformat()
        if data.performed_by is not None:
            update_fields["performed_by"] = data.performed_by.strip()
        if data.result is not None:
            update_fields["result"] = data.result.value
        if data.notes is not None:
            update_fields["notes"] = data.notes
        if data.report_filename is not None:
            update_fields["report_filename"] = data.report_filename

        await db.records.update_one({"record_id": clean_id}, {"$set": update_fields})
        updated = await db.records.find_one({"record_id": clean_id})
        return format_record_doc(updated)

    @staticmethod
    async def list_records(
        asset_id: Optional[str] = None,
        result: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        sort_order: str = "desc"
    ) -> List[Dict[str, Any]]:
        db: AsyncIOMotorDatabase = await get_database()
        query: Dict[str, Any] = {}

        if asset_id:
            query["asset_id"] = asset_id.strip().upper()
        if result:
            query["result"] = result.strip().capitalize()
        if date_from or date_to:
            date_filter: Dict[str, Any] = {}
            if date_from:
                date_filter["$gte"] = date_from.isoformat()
            if date_to:
                date_filter["$lte"] = date_to.isoformat()
            query["test_date"] = date_filter

        direction = -1 if sort_order.lower() == "desc" else 1
        cursor = db.records.find(query).sort("test_date", direction)
        docs = await cursor.to_list(length=1000)
        return [format_record_doc(d) for d in docs]
