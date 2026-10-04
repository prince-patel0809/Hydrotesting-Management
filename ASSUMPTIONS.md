# Documented Assumptions, Business Rules & Future Improvements

Documentation of core engineering assumptions, edge-case decisions, and proposed enhancements for the FuelFlux Hydrotesting System.

---

## 📋 Documented Assumptions & Decisions

### 1. Duplicate Asset Identifiers
- **Rule:** Asset IDs (e.g. `FF-TK-101`) represent physical equipment identifiers and must be globally unique across all stations.
- **Handling:** Attempting to create an asset with an existing `asset_id` is immediately rejected with HTTP `409 Conflict` and a clear error message: `"Asset with ID '...' already exists."`
- **Immutability:** Once registered, `asset_id` is treated as immutable to preserve foreign-key relational integrity across test records.

### 2. Chronological Date Constraint
- **Rule:** An asset's next-due validity date cannot be earlier than its last test date (`next_due_date >= test_date`).
- **Handling:** Both `POST` and `PATCH` endpoints enforce this rule via Pydantic model validators and service-level cross-field checks. Violations return HTTP `422 Unprocessable Content`.

### 3. Asset Validity & Failed Test Interaction
- **Rule:** An asset's certification is only considered valid if:
  1. `next_due_date >= today`
  2. The most recent hydrotest record for the asset is **not** `Fail`.
- **Handling:** If an asset undergoes a test that results in `Fail` (e.g. weld rupture or pressure loss), the asset's operational status changes to `Maintenance`. It is excluded from the `Valid Tests` count on the dashboard until a subsequent passing re-test is conducted.

### 4. Foreign Key Relational Integrity
- **Rule:** Every hydrotest record must be linked to a valid, existing equipment asset.
- **Handling:** When creating a hydrotest record, the backend verifies that `asset_id` exists in the `assets` collection. If not found, it returns HTTP `404 Not Found`.

### 5. Safe Report Document References
- **Rule:** Real file uploads are not required for this assessment. However, the system must securely handle document reference strings without exposing filesystem vulnerabilities.
- **Handling:** Report filename references (e.g. `HT-REP-2026-TK101.pdf`) are sanitized against directory traversal attacks. Any string containing `/`, `\`, `..`, or leading dots is rejected with HTTP `422`.

### 6. Audit Timestamps
- **Rule:** All records maintain audit timestamps.
- **Handling:** When updating an asset or test record, `created_at` is preserved unchanged, while `updated_at` is refreshed to the current UTC datetime.

---

## 🔮 Limitations & Future Improvements

1. **Role-Based Access Control (RBAC):** In a full production rollout, role permissions (e.g., `Viewer`, `Inspector`, `Plant Manager`, `Compliance Auditor`) could be enforced with JWT auth.
2. **Real Document Attachment Storage:** Integrate cloud object storage (e.g. AWS S3 or MinIO) with pre-signed upload URLs for attaching actual PDF inspection certificates.
3. **Automated Recertification Notifications:** Background email or webhook alerts sent to plant managers 30, 15, and 7 days prior to next-due inspection dates.
4. **Offline Mobile Inspection Sync:** PWA / service-worker support for inspectors logging tests offline in remote terminal locations with background sync upon reconnection.
