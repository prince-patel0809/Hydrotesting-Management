import asyncio
import os
import sys
from datetime import date, timedelta, datetime, timezone

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import get_database, connect_to_database, close_database_connection


async def seed_initial_data(db):
    """Seed data into the provided database instance without closing connections."""
    await db.assets.delete_many({})
    await db.records.delete_many({})

    today = date.today()
    now_iso = datetime.now(timezone.utc).isoformat()

    assets = [
        {
            "asset_id": "FF-TK-101",
            "station": "Station Alpha - Bulk Fuel Terminal",
            "asset_type": "Storage Tank",
            "serial_number": "SN-TK-88210",
            "test_date": (today - timedelta(days=345)).isoformat(),
            "next_due_date": (today + timedelta(days=20)).isoformat(),  # Due Soon
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-TK-102",
            "station": "Station Alpha - Bulk Fuel Terminal",
            "asset_type": "Storage Tank",
            "serial_number": "SN-TK-88211",
            "test_date": (today - timedelta(days=120)).isoformat(),
            "next_due_date": (today + timedelta(days=245)).isoformat(),  # Valid
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-PL-201",
            "station": "Station Beta - Refinery Intake",
            "asset_type": "Fuel Pipeline",
            "serial_number": "SN-PL-55401",
            "test_date": (today - timedelta(days=380)).isoformat(),
            "next_due_date": (today - timedelta(days=15)).isoformat(),  # Overdue
            "status": "Maintenance",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-PL-202",
            "station": "Station Beta - Refinery Intake",
            "asset_type": "Fuel Pipeline",
            "serial_number": "SN-PL-55402",
            "test_date": (today - timedelta(days=355)).isoformat(),
            "next_due_date": (today + timedelta(days=10)).isoformat(),  # Due Soon
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-PV-301",
            "station": "Station Gamma - Aviation Depot",
            "asset_type": "Pressure Vessel",
            "serial_number": "SN-PV-11982",
            "test_date": (today - timedelta(days=90)).isoformat(),
            "next_due_date": (today + timedelta(days=275)).isoformat(),  # Valid
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-PV-302",
            "station": "Station Gamma - Aviation Depot",
            "asset_type": "Pressure Vessel",
            "serial_number": "SN-PV-11985",
            "test_date": (today - timedelta(days=400)).isoformat(),
            "next_due_date": (today - timedelta(days=35)).isoformat(),  # Overdue
            "status": "Maintenance",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-DU-401",
            "station": "Station Delta - Retail Terminal West",
            "asset_type": "Dispenser Unit",
            "serial_number": "SN-DU-33010",
            "test_date": (today - timedelta(days=45)).isoformat(),
            "next_due_date": (today + timedelta(days=320)).isoformat(),  # Valid
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-TM-501",
            "station": "Station Epsilon - Harbor Bunker Dock",
            "asset_type": "Transfer Manifold",
            "serial_number": "SN-TM-77120",
            "test_date": (today - timedelta(days=360)).isoformat(),
            "next_due_date": (today + timedelta(days=5)).isoformat(),  # Due Soon
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-FS-601",
            "station": "Station Zeta - Offshore Transfer Station",
            "asset_type": "Filter Separator",
            "serial_number": "SN-FS-99014",
            "test_date": (today - timedelta(days=60)).isoformat(),
            "next_due_date": (today + timedelta(days=305)).isoformat(),  # Valid
            "status": "Active",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "asset_id": "FF-VS-701",
            "station": "Station Eta - Distribution Hub North",
            "asset_type": "Valve Station",
            "serial_number": "SN-VS-44211",
            "test_date": (today - timedelta(days=370)).isoformat(),
            "next_due_date": (today - timedelta(days=5)).isoformat(),  # Overdue
            "status": "Maintenance",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
    ]

    await db.assets.insert_many(assets)

    records = [
        {
            "record_id": "HTR-2025-0001",
            "asset_id": "FF-TK-101",
            "test_date": (today - timedelta(days=710)).isoformat(),
            "performed_by": "Apex Hydro-Testing Ltd",
            "result": "Pass",
            "notes": "Full hydrostatic pressure test at 150 PSI for 4 hours. No pressure drops or seepage detected.",
            "report_filename": "HT-REP-2024-TK101.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2025-0002",
            "asset_id": "FF-TK-101",
            "test_date": (today - timedelta(days=345)).isoformat(),
            "performed_by": "Apex Hydro-Testing Ltd",
            "result": "Pass",
            "notes": "Annual regulatory recertification. Held 150 PSI. Shell wall ultrasonic thickness verified.",
            "report_filename": "HT-REP-2025-TK101.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2025-0003",
            "asset_id": "FF-TK-102",
            "test_date": (today - timedelta(days=120)).isoformat(),
            "performed_by": "Vanguard Pressure Inspections",
            "result": "Pass",
            "notes": "Hydrostatic test conducted in accordance with API-653 standards. Passed with zero defects.",
            "report_filename": "HT-REP-2026-TK102.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2025-0004",
            "asset_id": "FF-PL-201",
            "test_date": (today - timedelta(days=380)).isoformat(),
            "performed_by": "Nordic Pipeline Testing Group",
            "result": "Pass",
            "notes": "Sectional hydrotest completed successfully.",
            "report_filename": "HT-REP-2025-PL201.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0005",
            "asset_id": "FF-PL-201",
            "test_date": (today - timedelta(days=10)).isoformat(),
            "performed_by": "Nordic Pipeline Testing Group",
            "result": "Fail",
            "notes": "Hydrostatic test failed at weld joint 14B under 220 PSI. Pressure loss of 18 PSI in 25 mins. Repair order issued.",
            "report_filename": "HT-FAIL-2026-PL201.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2025-0006",
            "asset_id": "FF-PL-202",
            "test_date": (today - timedelta(days=355)).isoformat(),
            "performed_by": "Nordic Pipeline Testing Group",
            "result": "Pass",
            "notes": "Hydrotest hold duration 8 hours at 250 PSI. Integrity fully intact.",
            "report_filename": "HT-REP-2025-PL202.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0007",
            "asset_id": "FF-PV-301",
            "test_date": (today - timedelta(days=90)).isoformat(),
            "performed_by": "Certified Vessel Engineers Inc",
            "result": "Pass",
            "notes": "ASME Section VIII hydrotest. Maximum allowable working pressure 300 PSI confirmed.",
            "report_filename": "HT-REP-2026-PV301.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2025-0008",
            "asset_id": "FF-PV-302",
            "test_date": (today - timedelta(days=400)).isoformat(),
            "performed_by": "Certified Vessel Engineers Inc",
            "result": "Pass",
            "notes": "Routine annual recertification completed.",
            "report_filename": "HT-REP-2025-PV302.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0009",
            "asset_id": "FF-PV-302",
            "test_date": (today - timedelta(days=30)).isoformat(),
            "performed_by": "Certified Vessel Engineers Inc",
            "result": "Fail",
            "notes": "Pressure flange gasket leak detected during 30-minute hold. Gasket replacement required.",
            "report_filename": "HT-FAIL-2026-PV302.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0010",
            "asset_id": "FF-DU-401",
            "test_date": (today - timedelta(days=45)).isoformat(),
            "performed_by": "Metro Fuel Equipment Tech",
            "result": "Pass",
            "notes": "Meter calibration and internal pipe hydro-leak test passed satisfactorily.",
            "report_filename": "HT-REP-2026-DU401.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2025-0011",
            "asset_id": "FF-TM-501",
            "test_date": (today - timedelta(days=360)).isoformat(),
            "performed_by": "Maritime Dock Integrity Services",
            "result": "Pass",
            "notes": "Manifold pressure hold verified across all 6 distribution valves.",
            "report_filename": "HT-REP-2025-TM501.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0012",
            "asset_id": "FF-TM-501",
            "test_date": (today - timedelta(days=2)).isoformat(),
            "performed_by": "Maritime Dock Integrity Services",
            "result": "Pending",
            "notes": "Hydrotest performed at 200 PSI; awaiting digital logger data verification and chief inspector signature.",
            "report_filename": "HT-PEND-2026-TM501.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0013",
            "asset_id": "FF-FS-601",
            "test_date": (today - timedelta(days=60)).isoformat(),
            "performed_by": "Offshore Safety & QA Ltd",
            "result": "Pass",
            "notes": "Internal cartridge chamber pressure tested. Seals intact.",
            "report_filename": "HT-REP-2026-FS601.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
        {
            "record_id": "HTR-2026-0014",
            "asset_id": "FF-VS-701",
            "test_date": (today - timedelta(days=3)).isoformat(),
            "performed_by": "Vanguard Pressure Inspections",
            "result": "Pending",
            "notes": "Hydraulic integrity cycle completed. Fluid sample lab analysis pending confirmation.",
            "report_filename": "HT-PEND-2026-VS701.pdf",
            "created_at": now_iso,
            "updated_at": now_iso,
        },
    ]

    await db.records.insert_many(records)

    for a in assets:
        cnt = await db.records.count_documents({"asset_id": a["asset_id"]})
        await db.assets.update_one({"asset_id": a["asset_id"]}, {"$set": {"hydrotest_count": cnt}})


async def seed_data():
    print("Connecting to database for seeding...")
    await connect_to_database()
    db = await get_database()
    print("Clearing existing assets and records collections...")
    await seed_initial_data(db)
    print("Successfully seeded 10 assets and 14 hydrotest records.")
    await close_database_connection()


if __name__ == "__main__":
    asyncio.run(seed_data())
