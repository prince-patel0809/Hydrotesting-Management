import pytest
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_create_asset_success(client):
    today = date.today()
    payload = {
        "asset_id": "FF-TEST-001",
        "station": "Station Alpha",
        "asset_type": "Storage Tank",
        "serial_number": "SN-001-A",
        "test_date": (today - timedelta(days=60)).isoformat(),
        "next_due_date": (today + timedelta(days=305)).isoformat(),
        "status": "Active"
    }
    response = await client.post("/api/hydrotests/assets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["asset_id"] == "FF-TEST-001"
    assert data["station"] == "Station Alpha"
    assert data["validity_category"] == "Valid"
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_duplicate_asset_id_rejected(client):
    today = date.today()
    payload = {
        "asset_id": "FF-DUP-001",
        "station": "Station Alpha",
        "asset_type": "Pressure Vessel",
        "serial_number": "SN-DUP-1",
        "test_date": today.isoformat(),
        "next_due_date": (today + timedelta(days=365)).isoformat(),
        "status": "Active"
    }
    # First create
    res1 = await client.post("/api/hydrotests/assets", json=payload)
    assert res1.status_code == 201

    # Second create with same asset_id
    res2 = await client.post("/api/hydrotests/assets", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_missing_required_fields_validation(client):
    payload = {
        "asset_id": "FF-INVALID",
        # missing station, asset_type, serial_number, test_date, next_due_date
    }
    response = await client.post("/api/hydrotests/assets", json=payload)
    assert response.status_code == 422
    assert "errors" in response.json()


@pytest.mark.asyncio
async def test_invalid_dates_next_due_before_test_date(client):
    today = date.today()
    payload = {
        "asset_id": "FF-DATE-ERR",
        "station": "Station Beta",
        "asset_type": "Fuel Pipeline",
        "serial_number": "SN-ERR-01",
        "test_date": today.isoformat(),
        "next_due_date": (today - timedelta(days=1)).isoformat(),  # Earlier than test date!
        "status": "Active"
    }
    response = await client.post("/api/hydrotests/assets", json=payload)
    assert response.status_code == 422
    errors_str = str(response.json())
    assert "Next-due date cannot be earlier than test date" in errors_str


@pytest.mark.asyncio
async def test_update_asset_and_preserve_created_at(client):
    today = date.today()
    payload = {
        "asset_id": "FF-UPD-001",
        "station": "Station Beta",
        "asset_type": "Transfer Manifold",
        "serial_number": "SN-UPD-99",
        "test_date": (today - timedelta(days=100)).isoformat(),
        "next_due_date": (today + timedelta(days=265)).isoformat(),
        "status": "Active"
    }
    create_res = await client.post("/api/hydrotests/assets", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    orig_created_at = created_data["created_at"]
    orig_updated_at = created_data["updated_at"]

    # Perform partial update
    update_payload = {
        "station": "Station Beta - Upgraded Terminal",
        "status": "Maintenance"
    }
    update_res = await client.patch("/api/hydrotests/assets/FF-UPD-001", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["station"] == "Station Beta - Upgraded Terminal"
    assert updated_data["status"] == "Maintenance"
    # Preserves created_at
    assert updated_data["created_at"] == orig_created_at
    # Refreshes updated_at
    assert updated_data["updated_at"] >= orig_updated_at


@pytest.mark.asyncio
async def test_update_asset_invalid_dates_rejected(client):
    today = date.today()
    payload = {
        "asset_id": "FF-UPD-DATE",
        "station": "Station Beta",
        "asset_type": "Transfer Manifold",
        "serial_number": "SN-UPD-77",
        "test_date": today.isoformat(),
        "next_due_date": (today + timedelta(days=100)).isoformat(),
        "status": "Active"
    }
    await client.post("/api/hydrotests/assets", json=payload)

    # Try updating next_due_date to earlier than existing test_date
    invalid_patch = {
        "next_due_date": (today - timedelta(days=10)).isoformat()
    }
    res = await client.patch("/api/hydrotests/assets/FF-UPD-DATE", json=invalid_patch)
    assert res.status_code == 422
    assert "Next-due date cannot be earlier than test date" in res.json()["detail"]
