from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.services.asset_service import format_asset_doc
from app.services.record_service import format_record_doc


class SummaryService:
    @staticmethod
    async def get_dashboard_summary(reference_date: date = None) -> Dict[str, Any]:
        db: AsyncIOMotorDatabase = await get_database()
        ref_date = reference_date or date.today()
        ref_date_iso = ref_date.isoformat()
        thirty_days_later = (ref_date + timedelta(days=30)).isoformat()

        # 1. Total Assets
        total_assets = await db.assets.count_documents({})

        # 2. Overdue Tests query: next_due_date < ref_date
        overdue_cursor = db.assets.find({
            "next_due_date": {"$lt": ref_date_iso}
        }).sort("next_due_date", 1)
        overdue_docs = await overdue_cursor.to_list(length=500)
        overdue_tests = [format_asset_doc(d, ref_date) for d in overdue_docs]
        overdue_count = len(overdue_tests)

        # 3. Tests Due in 30 Days query: ref_date <= next_due_date <= 30 days
        upcoming_cursor = db.assets.find({
            "next_due_date": {"$gte": ref_date_iso, "$lte": thirty_days_later}
        }).sort("next_due_date", 1)
        upcoming_docs = await upcoming_cursor.to_list(length=500)
        upcoming_tests = [format_asset_doc(d, ref_date) for d in upcoming_docs]
        tests_due_30_days = len(upcoming_tests)

        # 4. Valid Tests: assets with next_due_date >= ref_date AND latest test is not Fail
        # Retrieve all assets where next_due_date >= ref_date
        unexpired_cursor = db.assets.find({
            "next_due_date": {"$gte": ref_date_iso}
        })
        unexpired_docs = await unexpired_cursor.to_list(length=1000)
        valid_count = 0
        for doc in unexpired_docs:
            latest_rec = await db.records.find_one(
                {"asset_id": doc["asset_id"]},
                sort=[("test_date", -1), ("created_at", -1)]
            )
            # If no fail on the latest test, it's counted as a valid test
            if not latest_rec or latest_rec.get("result") != "Fail":
                valid_count += 1

        # 5. Failed Records
        failed_cursor = db.records.find({"result": "Fail"}).sort("test_date", -1)
        failed_docs = await failed_cursor.to_list(length=500)
        failed_records = [format_record_doc(d) for d in failed_docs]
        failed_count = len(failed_records)

        # 6. Pending Records
        pending_cursor = db.records.find({"result": "Pending"}).sort("test_date", -1)
        pending_docs = await pending_cursor.to_list(length=500)
        pending_records = [format_record_doc(d) for d in pending_docs]
        pending_count = len(pending_records)

        return {
            "stats": {
                "total_assets": total_assets,
                "valid_tests": valid_count,
                "tests_due_30_days": tests_due_30_days,
                "overdue_tests": overdue_count,
                "failed_records": failed_count,
                "pending_records": pending_count,
            },
            "upcoming_tests": upcoming_tests,
            "overdue_tests": overdue_tests,
            "failed_records": failed_records,
            "pending_records": pending_records,
            "reference_date": ref_date,
            "generated_at": datetime.now(timezone.utc),
        }
