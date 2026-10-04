import pytest
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_create_and_retrieve_record_success(client):
    today = date.today()
    # 1. Create asset first
    asset_payload = {
        "asset_id": "FF-REC-ASSET",
        "station": "Station Gamma",
        "asset_type": "Filter Separator",
        "serial_number": "SN-REC-01",
        "test_date": today.isoformat(),
        "next_due_date": (today + timedelta(days=365)).isoformat(),
        "status": "Active"
    }
    await client.post("/api/hydrotests/assets", json=asset_payload)

    # 2. Create hydrotest record
    rec_payload = {
        "record_id": "HTR-TEST-9999",
        "asset_id": "FF-REC-ASSET",
        "test_date": today.isoformat(),
        "performed_by": "Certified Testing Agency",
        "result": "Pass",
        "notes": "Passed all pressure hold criteria.",
        "report_filename": "HT-TEST-9999.pdf"
    }
    create_res = await client.post("/api/hydrotests/records", json=rec_payload)
    assert create_res.status_code == 201
    rec_data = create_res.json()
    assert rec_data["record_id"] == "HTR-TEST-9999"
    assert rec_data["result"] == "Pass"
    assert rec_data["report_filename"] == "HT-TEST-9999.pdf"

    # 3. Retrieve record by id
    get_res = await client.get("/api/hydrotests/records/HTR-TEST-9999")
    assert get_res.status_code == 200
    assert get_res.json()["record_id"] == "HTR-TEST-9999"


@pytest.mark.asyncio
async def test_create_record_invalid_asset_reference_rejected(client):
    today = date.today()
    rec_payload = {
        "record_id": "HTR-NONEXIST-01",
        "asset_id": "FF-DOES-NOT-EXIST",
        "test_date": today.isoformat(),
        "performed_by": "Agency X",
        "result": "Pass",
    }
    res = await client.post("/api/hydrotests/records", json=rec_payload)
    assert res.status_code == 404
    assert "Referenced asset 'FF-DOES-NOT-EXIST' does not exist" in res.json()["detail"]


@pytest.mark.asyncio
async def test_create_record_invalid_result_enum_rejected(client):
    today = date.today()
    asset_payload = {
        "asset_id": "FF-ENUM-ASSET",
        "station": "Station Delta",
        "asset_type": "Storage Tank",
        "serial_number": "SN-ENUM-01",
        "test_date": today.isoformat(),
        "next_due_date": (today + timedelta(days=365)).isoformat(),
        "status": "Active"
    }
    await client.post("/api/hydrotests/assets", json=asset_payload)

    rec_payload = {
        "asset_id": "FF-ENUM-ASSET",
        "test_date": today.isoformat(),
        "performed_by": "Agency Y",
        "result": "UnknownStatus",  # Invalid!
    }
    res = await client.post("/api/hydrotests/records", json=rec_payload)
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_unsafe_report_filename_rejected(client):
    today = date.today()
    asset_payload = {
        "asset_id": "FF-SAFE-ASSET",
        "station": "Station Delta",
        "asset_type": "Storage Tank",
        "serial_number": "SN-SAFE-01",
        "test_date": today.isoformat(),
        "next_due_date": (today + timedelta(days=365)).isoformat(),
        "status": "Active"
    }
    await client.post("/api/hydrotests/assets", json=asset_payload)

    # Path traversal attack
    traversal_payload = {
        "asset_id": "FF-SAFE-ASSET",
        "test_date": today.isoformat(),
        "performed_by": "Agency Z",
        "result": "Pass",
        "report_filename": "../../etc/passwd"
    }
    res = await client.post("/api/hydrotests/records", json=traversal_payload)
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_update_record_and_preserve_created_at(client):
    today = date.today()
    asset_payload = {
        "asset_id": "FF-UPD-REC-ASSET",
        "station": "Station Delta",
        "asset_type": "Storage Tank",
        "serial_number": "SN-UPD-REC",
        "test_date": today.isoformat(),
        "next_due_date": (today + timedelta(days=365)).isoformat(),
        "status": "Active"
    }
    await client.post("/api/hydrotests/assets", json=asset_payload)

    rec_payload = {
        "record_id": "HTR-UPD-001",
        "asset_id": "FF-UPD-REC-ASSET",
        "test_date": today.isoformat(),
        "performed_by": "Initial Inspector",
        "result": "Pending",
        "notes": "Awaiting approval."
    }
    create_res = await client.post("/api/hydrotests/records", json=rec_payload)
    created = create_res.json()
    orig_created_at = created["created_at"]

    # Update result from Pending to Pass
    patch_payload = {
        "result": "Pass",
        "notes": "Chief engineer approved."
    }
    patch_res = await client.patch("/api/hydrotests/records/HTR-UPD-001", json=patch_payload)
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["result"] == "Pass"
    assert updated["notes"] == "Chief engineer approved."
    assert updated["created_at"] == orig_created_at
