# API Specification & Contract

Complete REST API documentation for the **FuelFlux Hydrotesting Management System**.

Interactive Swagger UI documentation is available at `http://127.0.0.1:8000/docs`.

---

## 📌 Endpoint Summary

| Method | Endpoint | Purpose | Status Code |
|---|---|---|---|
| `POST` | `/api/hydrotests/assets` | Create a new asset | `201 Created` |
| `GET` | `/api/hydrotests/assets` | List, search, filter, and sort assets | `200 OK` |
| `GET` | `/api/hydrotests/assets/{id}` | Retrieve one asset | `200 OK` |
| `PATCH` | `/api/hydrotests/assets/{id}` | Partially update an asset | `200 OK` |
| `POST` | `/api/hydrotests/records` | Create a hydrotest record | `201 Created` |
| `GET` | `/api/hydrotests/records/{id}` | Retrieve one hydrotest record | `200 OK` |
| `PATCH` | `/api/hydrotests/records/{id}` | Partially update a hydrotest record | `200 OK` |
| `GET` | `/api/hydrotests/records` | List and filter records | `200 OK` |
| `GET` | `/api/hydrotests/summary` | Dashboard KPI counts and due items | `200 OK` |

---

## 1. Asset Endpoints

### Create Asset
`POST /api/hydrotests/assets`

**Request:**
```bash
curl -X POST http://127.0.0.1:8000/api/hydrotests/assets \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": "FF-TK-105",
    "station": "Station Alpha - Bulk Fuel Terminal",
    "asset_type": "Storage Tank",
    "serial_number": "SN-TK-99201",
    "test_date": "2026-01-10",
    "next_due_date": "2027-01-10",
    "status": "Active"
  }'
```

**Response (`201 Created`):**
```json
{
  "id": "67000102...",
  "asset_id": "FF-TK-105",
  "station": "Station Alpha - Bulk Fuel Terminal",
  "asset_type": "Storage Tank",
  "serial_number": "SN-TK-99201",
  "test_date": "2026-01-10",
  "next_due_date": "2027-01-10",
  "status": "Active",
  "created_at": "2026-10-04T05:00:00Z",
  "updated_at": "2026-10-04T05:00:00Z",
  "days_until_due": 98,
  "validity_category": "Valid",
  "latest_test_result": null,
  "hydrotest_count": 0
}
```

---

### List & Filter Assets
`GET /api/hydrotests/assets`

**Query Parameters:**
- `search` (string): Text search across Asset ID, Serial, Station, or Type.
- `station` (string): Filter by station.
- `asset_type` (string): Filter by asset type.
- `status` (string): Filter by status (`Active`, `Maintenance`, etc.).
- `validity` (string): Filter by `Valid`, `Due Soon`, `Overdue`.
- `due_from` / `due_to` (date): Date range for `next_due_date` (`YYYY-MM-DD`).
- `sort_by` (string): Sort field (default `next_due_date`).
- `sort_order` (string): `asc` or `desc`.

**Example Request:**
```bash
curl -X GET "http://127.0.0.1:8000/api/hydrotests/assets?station=Station%20Alpha%20-%20Bulk%20Fuel%20Terminal&sort_by=next_due_date&sort_order=asc"
```

---

### Partially Update Asset
`PATCH /api/hydrotests/assets/{asset_id}`

**Request:**
```bash
curl -X PATCH http://127.0.0.1:8000/api/hydrotests/assets/FF-TK-105 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Maintenance",
    "station": "Station Alpha - Sector 2"
  }'
```
*Preserves `created_at` timestamp and refreshes `updated_at`.*

---

## 2. Hydrotest Record Endpoints

### Create Hydrotest Record
`POST /api/hydrotests/records`

**Request:**
```bash
curl -X POST http://127.0.0.1:8000/api/hydrotests/records \
  -H "Content-Type: application/json" \
  -d '{
    "asset_id": "FF-TK-105",
    "test_date": "2026-10-01",
    "performed_by": "Apex Hydro-Testing Ltd",
    "result": "Pass",
    "notes": "Full hydrostatic pressure test at 150 PSI for 4 hours. Passed.",
    "report_filename": "HT-REP-2026-TK105.pdf"
  }'
```

**Response (`201 Created`):**
```json
{
  "id": "67000201...",
  "record_id": "HTR-2026-0015",
  "asset_id": "FF-TK-105",
  "test_date": "2026-10-01",
  "performed_by": "Apex Hydro-Testing Ltd",
  "result": "Pass",
  "notes": "Full hydrostatic pressure test at 150 PSI for 4 hours. Passed.",
  "report_filename": "HT-REP-2026-TK105.pdf",
  "created_at": "2026-10-04T05:00:00Z",
  "updated_at": "2026-10-04T05:00:00Z"
}
```

---

### Retrieve One Record
`GET /api/hydrotests/records/{record_id}`

```bash
curl -X GET http://127.0.0.1:8000/api/hydrotests/records/HTR-2025-0001
```

---

### Partially Update Record
`PATCH /api/hydrotests/records/{record_id}`

```bash
curl -X PATCH http://127.0.0.1:8000/api/hydrotests/records/HTR-2025-0001 \
  -H "Content-Type: application/json" \
  -d '{
    "result": "Pass",
    "notes": "Signed off by Lead QA Engineer."
  }'
```

---

## 3. Dashboard Summary Endpoint

### Get Dashboard Counts & Due Lists
`GET /api/hydrotests/summary`

```bash
curl -X GET http://127.0.0.1:8000/api/hydrotests/summary
```

**Response:**
```json
{
  "stats": {
    "total_assets": 10,
    "valid_tests": 7,
    "tests_due_30_days": 3,
    "overdue_tests": 3,
    "failed_records": 2,
    "pending_records": 2
  },
  "upcoming_tests": [ ... ],
  "overdue_tests": [ ... ],
  "failed_records": [ ... ],
  "pending_records": [ ... ],
  "reference_date": "2026-10-04",
  "generated_at": "2026-10-04T05:00:00Z"
}
```
