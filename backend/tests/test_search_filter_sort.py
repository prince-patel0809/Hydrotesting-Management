import pytest
from datetime import date, timedelta


@pytest.mark.asyncio
async def test_search_and_filters(client):
    today = date.today()

    # Asset A: Terminal Alpha, Storage Tank
    await client.post("/api/hydrotests/assets", json={
        "asset_id": "FF-ALPHA-TANK",
        "station": "Terminal Alpha",
        "asset_type": "Storage Tank",
        "serial_number": "SN-A-100",
        "test_date": (today - timedelta(days=200)).isoformat(),
        "next_due_date": (today + timedelta(days=165)).isoformat(),
        "status": "Active"
    })

    # Asset B: Terminal Beta, Fuel Pipeline
    await client.post("/api/hydrotests/assets", json={
        "asset_id": "FF-BETA-PIPE",
        "station": "Terminal Beta",
        "asset_type": "Fuel Pipeline",
        "serial_number": "SN-B-200",
        "test_date": (today - timedelta(days=360)).isoformat(),
        "next_due_date": (today + timedelta(days=5)).isoformat(),
        "status": "Active"
    })

    # Asset C: Terminal Gamma, Valve Station
    await client.post("/api/hydrotests/assets", json={
        "asset_id": "FF-GAMMA-VALVE",
        "station": "Terminal Gamma",
        "asset_type": "Valve Station",
        "serial_number": "SN-G-300",
        "test_date": (today - timedelta(days=400)).isoformat(),
        "next_due_date": (today - timedelta(days=35)).isoformat(),
        "status": "Maintenance"
    })

    # Test 1: Search by text "PIPE"
    res1 = await client.get("/api/hydrotests/assets?search=PIPE")
    data1 = res1.json()
    assert len(data1) == 1
    assert data1[0]["asset_id"] == "FF-BETA-PIPE"

    # Test 2: Filter by station "Terminal Alpha"
    res2 = await client.get("/api/hydrotests/assets?station=Terminal Alpha")
    data2 = res2.json()
    assert len(data2) == 1
    assert data2[0]["asset_id"] == "FF-ALPHA-TANK"

    # Test 3: Filter by asset_type "Valve Station"
    res3 = await client.get("/api/hydrotests/assets?asset_type=Valve Station")
    data3 = res3.json()
    assert len(data3) == 1
    assert data3[0]["asset_id"] == "FF-GAMMA-VALVE"

    # Test 4: Filter by status "Maintenance"
    res4 = await client.get("/api/hydrotests/assets?status=Maintenance")
    data4 = res4.json()
    assert len(data4) == 1
    assert data4[0]["asset_id"] == "FF-GAMMA-VALVE"

    # Test 5: Due date range filter
    due_from = today.isoformat()
    due_to = (today + timedelta(days=30)).isoformat()
    res5 = await client.get(f"/api/hydrotests/assets?due_from={due_from}&due_to={due_to}")
    data5 = res5.json()
    assert len(data5) == 1
    assert data5[0]["asset_id"] == "FF-BETA-PIPE"

    # Test 6: Sort by next_due_date asc
    res6_asc = await client.get("/api/hydrotests/assets?sort_by=next_due_date&sort_order=asc")
    data6_asc = res6_asc.json()
    assert data6_asc[0]["asset_id"] == "FF-GAMMA-VALVE"  # Due in past
    assert data6_asc[-1]["asset_id"] == "FF-ALPHA-TANK"  # Due furthest in future

    # Test 7: Sort by next_due_date desc
    res6_desc = await client.get("/api/hydrotests/assets?sort_by=next_due_date&sort_order=desc")
    data6_desc = res6_desc.json()
    assert data6_desc[0]["asset_id"] == "FF-ALPHA-TANK"
    assert data6_desc[-1]["asset_id"] == "FF-GAMMA-VALVE"
