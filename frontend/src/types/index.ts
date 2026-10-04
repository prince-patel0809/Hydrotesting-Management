export type ValidityCategory = 'Valid' | 'Due Soon' | 'Overdue'
export type TestResultType = 'Pass' | 'Fail' | 'Pending'

export interface Asset {
  id?: string
  asset_id: string
  station: string
  asset_type: string
  serial_number: string
  test_date: string
  next_due_date: string
  status: string
  created_at: string
  updated_at: string
  days_until_due: number
  validity_category: ValidityCategory
  latest_test_result?: TestResultType | null
  hydrotest_count: number
}

export interface AssetCreatePayload {
  asset_id: string
  station: string
  asset_type: string
  serial_number: string
  test_date: string
  next_due_date: string
  status: string
}

export interface AssetUpdatePayload {
  station?: string
  asset_type?: string
  serial_number?: string
  test_date?: string
  next_due_date?: string
  status?: string
}

export interface HydrotestRecord {
  id?: string
  record_id: string
  asset_id: string
  test_date: string
  performed_by: string
  result: TestResultType
  notes?: string
  report_filename?: string | null
  created_at: string
  updated_at: string
}

export interface RecordCreatePayload {
  record_id?: string
  asset_id: string
  test_date: string
  performed_by: string
  result: TestResultType
  notes?: string
  report_filename?: string
}

export interface RecordUpdatePayload {
  test_date?: string
  performed_by?: string
  result?: TestResultType
  notes?: string
  report_filename?: string
}

export interface SummaryStats {
  total_assets: number
  valid_tests: number
  tests_due_30_days: number
  overdue_tests: number
  failed_records: number
  pending_records: number
}

export interface SummaryResponse {
  stats: SummaryStats
  upcoming_tests: Asset[]
  overdue_tests: Asset[]
  failed_records: HydrotestRecord[]
  pending_records: HydrotestRecord[]
  reference_date: string
  generated_at: string
}

export interface AssetFilterParams {
  search?: string
  station?: string
  asset_type?: string
  status?: string
  validity?: string
  due_from?: string
  due_to?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
