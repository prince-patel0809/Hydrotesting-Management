# Automated Testing & Quality Assurance

Comprehensive automated testing documentation for the **FuelFlux Hydrotesting Management System**.

---

## 🧪 Test Suite Summary

- **Backend Pytest Suite:** **13/13 passing** (Execution time: ~0.15s)
- **Frontend Vitest Suite:** **11/11 passing** (Execution time: ~0.60s)
- **Frontend Production Build:** **0 errors**

---

## 🐍 Backend Pytest Test Matrix

Run backend tests:
```bash
# Windows
.\backend\venv\Scripts\pytest.exe backend/tests -v

# Linux / macOS
pytest backend/tests -v
```

### Test Case Breakdown:

| Test File | Test Name | Purpose / What Is Verified |
|---|---|---|
| `test_assets.py` | `test_create_asset_success` | Validates asset creation (201 Created), field mapping, and response schema. |
| `test_assets.py` | `test_duplicate_asset_id_rejected` | Ensures duplicate Asset IDs are rejected with HTTP 409 Conflict. |
| `test_assets.py` | `test_missing_required_fields_validation` | Validates that missing required fields return HTTP 422 Unprocessable Entity. |
| `test_assets.py` | `test_invalid_dates_next_due_before_test_date` | Rejects assets where `next_due_date < test_date` with HTTP 422. |
| `test_assets.py` | `test_update_asset_and_preserve_created_at` | Verifies partial updates, preserving `created_at` and refreshing `updated_at`. |
| `test_assets.py` | `test_update_asset_invalid_dates_rejected` | Prevents patch updates that would set next-due date earlier than test date. |
| `test_dashboard.py` | `test_dashboard_summary_metrics` | Verifies dynamic calculation of all 6 KPI counts and due items lists. |
| `test_records.py` | `test_create_and_retrieve_record_success` | Validates hydrotest record creation (201) and lookup by ID (200). |
| `test_records.py` | `test_create_record_invalid_asset_reference_rejected` | Rejects records linked to non-existent assets with HTTP 404. |
| `test_records.py` | `test_create_record_invalid_result_enum_rejected` | Rejects results other than Pass, Fail, or Pending with HTTP 422. |
| `test_records.py` | `test_unsafe_report_filename_rejected` | Rejects path traversal attacks (`../../etc/passwd`) in report filenames. |
| `test_records.py` | `test_update_record_and_preserve_created_at` | Verifies record partial update and timestamp preservation. |
| `test_search_filter_sort.py` | `test_search_and_filters` | Tests text search, station filter, type filter, status filter, date range, and asc/desc sorting. |

---

## ⚛️ Frontend Vitest Test Matrix

Run frontend tests:
```bash
cd frontend
npm test
```

### Test Case Breakdown:

| Test File | Tests | Purpose |
|---|---|---|
| `Badges.test.tsx` | 5 tests | Tests rendering of `ResultBadge` (Pass, Fail, Pending), `ValidityBadge` (Valid, Due Soon, Overdue with day countdowns), and `StatusBadge`. |
| `DashboardView.test.tsx` | 3 tests | Tests rendering of all 6 summary KPI cards, upcoming/overdue lists, and card click navigation callbacks. |
| `AssetManagementView.test.tsx` | 3 tests | Tests asset table rows, dynamic search filtering, and Register Asset modal opening. |

---

## 🔒 Test Database Isolation

All backend tests utilize the `test_db` pytest fixture defined in `backend/tests/conftest.py`:
- Each test runs against an isolated mock MongoDB database (`fuelflux_test_db`).
- Collections are cleared before and after each test.
- Automated tests **never touch or mutate production or seeded demo data**.
