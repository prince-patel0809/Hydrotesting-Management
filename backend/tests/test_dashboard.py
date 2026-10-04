import pytest
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_dashboard_summary_metrics(client):
    today = date.today()

    # 1. Asset 1: Valid (due in 180 days)
    await client.post("/api/hydrotests/assets", json={
        "asset_id": "FF-DASH-01",
        "station": "Station Alpha",
        "asset_type": "Storage Tank",
        "serial_number": "SN-D-01",
        "test_date": (today - timedelta(days=100)).isoformat(),
        "next_due_date": (today + timedelta(days=180)).isoformat(),
        "status": "Active"
    })

    # 2. Asset 2: Due Soon (due in 15 days)
    await client.post("/api/hydrotests/assets", json={
        "asset_id": "FF-DASH-02",
        "station": "Station Alpha",
        "asset_type": "Fuel Pipeline",
        "serial_number": "SN-D-02",
        "test_date": (today - timedelta(days=350)).isoformat(),
        "next_due_date": (today + timedelta(days=15)).isoformat(),
        "status": "Active"
    })

    # 3. Asset 3: Overdue (due 10 days ago)
    await client.post("/api/hydrotests/assets", json={
        "asset_id": "FF-DASH-03",
        "station": "Station Beta",
        "asset_type": "Pressure Vessel",
        "serial_number": "SN-D-03",
        "test_date": (today - timedelta(days=375)).isoformat(),
        "next_due_date": (today - timedelta(days=10)).isoformat(),
        "status": "Maintenance"
    })

    # Records:
    # 1 Pass record on FF-DASH-01
    await client.post("/api/hydrotests/records", json={
        "asset_id": "FF-DASH-01",
        "test_date": (today - timedelta(days=100)).isoformat(),
        "performed_by": "Provider A",
        "result": "Pass",
    })

    # 1 Fail record on FF-DASH-03
    await client.post("/api/hydrotests/records", json={
        "asset_id": "FF-DASH-03",
        "test_date": (today - timedelta(days=10)).isoformat(),
        "performed_by": "Provider B",
        "result": "Fail",
    })

    # 1 Pending record on FF-DASH-02
    await client.post("/api/hydrotests/records", json={
        "asset_id": "FF-DASH-02",
        "test_date": today.isoformat(),
        "performed_by": "Provider C",
        "result": "Pending",
    })

    # Call summary endpoint
    res = await client.get("/api/hydrotests/summary")
    assert res.status_code == 200
    data = res.json()
    stats = data["stats"]

    # Total assets: 3
    assert stats["total_assets"] == 3

    # Tests due in 30 days: 1 (FF-DASH-02)
    assert stats["tests_due_30_days"] == 1
    assert any(a["asset_id"] == "FF-DASH-02" for a in data["upcoming_tests"])

    # Overdue tests: 1 (FF-DASH-03)
    assert stats["overdue_tests"] == 1
    assert any(a["asset_id"] == "FF-DASH-03" for a in data["overdue_tests"])

    # Valid tests: assets where next_due_date >= today and latest test != Fail.
    # FF-DASH-01 is unexpired and passed.
    # FF-DASH-02 is unexpired and pending.
    # (FF-DASH-03 is expired and failed).
    assert stats["valid_tests"] == 2

    # Failed records: 1
    assert stats["failed_records"] == 1
    assert len(data["failed_records"]) == 1

    # Pending records: 1
    assert stats["pending_records"] == 1
    assert len(data["pending_records"]) == 1
