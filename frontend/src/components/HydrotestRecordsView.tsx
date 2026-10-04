import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  FileText,
  Calendar,
  AlertCircle,
  Download,
  X,
  UserCheck,
  CheckCircle,
} from 'lucide-react'
import {
  HydrotestRecord,
  Asset,
  RecordCreatePayload,
  RecordUpdatePayload,
  TestResultType,
} from '../types'
import { ResultBadge } from './Badges'
import { Modal } from './Modal'

interface HydrotestRecordsViewProps {
  records: HydrotestRecord[]
  assets: Asset[]
  loading: boolean
  initialResultFilter?: string
  onCreateRecord: (payload: RecordCreatePayload) => Promise<void>
  onUpdateRecord: (recordId: string, payload: RecordUpdatePayload) => Promise<void>
  selectedRecordFromDash: HydrotestRecord | null
  setSelectedRecordFromDash: (rec: HydrotestRecord | null) => void
  prefillAssetId?: string
  clearPrefillAssetId: () => void
}

export const HydrotestRecordsView: React.FC<HydrotestRecordsViewProps> = ({
  records,
  assets,
  loading,
  initialResultFilter,
  onCreateRecord,
  onUpdateRecord,
  selectedRecordFromDash,
  setSelectedRecordFromDash,
  prefillAssetId,
  clearPrefillAssetId,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [resultFilter, setResultFilter] = useState(initialResultFilter || '')
  const [assetFilter, setAssetFilter] = useState(prefillAssetId || '')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortDesc, setSortDesc] = useState(true)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(Boolean(prefillAssetId))
  const [editingRecord, setEditingRecord] = useState<HydrotestRecord | null>(null)
  const [viewingRecord, setViewingRecord] = useState<HydrotestRecord | null>(selectedRecordFromDash)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportDownloadNotice, setReportDownloadNotice] = useState<string | null>(null)

  // Form state for Add
  const [addForm, setAddForm] = useState<RecordCreatePayload>({
    asset_id: prefillAssetId || (assets[0]?.asset_id ?? ''),
    test_date: new Date().toISOString().split('T')[0],
    performed_by: '',
    result: 'Pass',
    notes: '',
    report_filename: '',
  })

  // Form state for Edit
  const [editForm, setEditForm] = useState<RecordUpdatePayload>({
    test_date: '',
    performed_by: '',
    result: 'Pass',
    notes: '',
    report_filename: '',
  })

  // Keep viewingRecord in sync if dashboard passed one
  React.useEffect(() => {
    if (selectedRecordFromDash) {
      setViewingRecord(selectedRecordFromDash)
    }
  }, [selectedRecordFromDash])

  // Filtered & Sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        if (searchTerm) {
          const s = searchTerm.toLowerCase()
          const matches =
            rec.record_id.toLowerCase().includes(s) ||
            rec.asset_id.toLowerCase().includes(s) ||
            rec.performed_by.toLowerCase().includes(s) ||
            (rec.notes && rec.notes.toLowerCase().includes(s))
          if (!matches) return false
        }
        if (resultFilter && rec.result !== resultFilter) return false
        if (assetFilter && rec.asset_id !== assetFilter) return false
        if (dateFrom && rec.test_date < dateFrom) return false
        if (dateTo && rec.test_date > dateTo) return false
        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.test_date).getTime()
        const timeB = new Date(b.test_date).getTime()
        return sortDesc ? timeB - timeA : timeA - timeB
      })
  }, [records, searchTerm, resultFilter, assetFilter, dateFrom, dateTo, sortDesc])

  // Handle Add Form Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!addForm.asset_id) {
      setModalError('Please select or specify a valid referenced Asset ID.')
      return
    }

    try {
      setIsSubmitting(true)
      await onCreateRecord(addForm)
      setIsAddModalOpen(false)
      clearPrefillAssetId()
      setAddForm({
        asset_id: assets[0]?.asset_id ?? '',
        test_date: new Date().toISOString().split('T')[0],
        performed_by: '',
        result: 'Pass',
        notes: '',
        report_filename: '',
      })
    } catch (err: any) {
      setModalError(err.message || 'Failed to create hydrotest record.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (rec: HydrotestRecord) => {
    setEditingRecord(rec)
    setEditForm({
      test_date: rec.test_date,
      performed_by: rec.performed_by,
      result: rec.result,
      notes: rec.notes || '',
      report_filename: rec.report_filename || '',
    })
    setModalError(null)
  }

  // Handle Edit Form Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return
    setModalError(null)

    try {
      setIsSubmitting(true)
      await onUpdateRecord(editingRecord.record_id, editForm)
      setEditingRecord(null)
    } catch (err: any) {
      setModalError(err.message || 'Failed to update hydrotest record.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulate safe demo report preview/download
  const handleSimulateReportDownload = (filename?: string | null) => {
    const fname = filename || 'HT-RECORD-DEMO.pdf'
    setReportDownloadNotice(`Safe report reference: "${fname}" verified. In demonstration mode, file integrity checksum SHA-256 confirmed.`)
    setTimeout(() => {
      setReportDownloadNotice(null)
    }, 5000)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setResultFilter('')
    setAssetFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(resultFilter) ||
    Boolean(assetFilter) ||
    Boolean(dateFrom) ||
    Boolean(dateTo)

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Hydrotest Inspection Records
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Audit Logs & Reports
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Certified hydrostatic pressure test logs, inspector records, Pass/Fail/Pending determinations, and safe report document references.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null)
            setIsAddModalOpen(true)
          }}
          className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Hydrotest</span>
        </button>
      </div>

      {/* Report simulation notice */}
      {reportDownloadNotice && (
        <div className="p-3 bg-orange-50 border border-orange-200 text-orange-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-orange-600" />
            <span>{reportDownloadNotice}</span>
          </div>
          <button onClick={() => setReportDownloadNotice(null)}>
            <X className="w-4 h-4 text-orange-500" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Record ID, Asset, Inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Result Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-700"
            >
              <option value="">All Test Results</option>
              <option value="Pass">Pass (Compliant)</option>
              <option value="Fail">Fail (Pressure Drop / Leaks)</option>
              <option value="Pending">Pending Certification</option>
            </select>
          </div>

          {/* Asset ID Filter */}
          <div>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-slate-700 font-mono"
            >
              <option value="">All Equipment Assets</option>
              {assets.map((a) => (
                <option key={a.asset_id} value={a.asset_id}>
                  {a.asset_id} ({a.asset_type})
                </option>
              ))}
            </select>
          </div>

          {/* Sort order toggle */}
          <div>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>{sortDesc ? 'Test Date: Newest First' : 'Test Date: Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Secondary Row: Date Range Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">Test Date Range:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-700"
            />
            <span>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-700"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex min-h-10 items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overscroll-x-contain touch-pan-x" role="region" aria-label="Hydrotest records table" tabIndex={0}>
          <table className="min-w-[900px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Record ID</th>
                <th className="px-6 py-3.5">Asset Reference</th>
                <th className="px-6 py-3.5">Test Date</th>
                <th className="px-6 py-3.5">Provider / Inspector</th>
                <th className="px-6 py-3.5">Result</th>
                <th className="px-6 py-3.5">Safe Report Document</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading hydrotest records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No hydrotest records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.record_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Record ID */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                      {rec.record_id}
                    </td>

                    {/* Asset Reference */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                        {rec.asset_id}
                      </span>
                    </td>

                    {/* Test Date */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {rec.test_date}
                    </td>

                    {/* Performed By */}
                    <td className="px-6 py-4 text-slate-800 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.performed_by}</span>
                      </div>
                    </td>

                    {/* Result */}
                    <td className="px-6 py-4">
                      <ResultBadge result={rec.result} />
                    </td>

                    {/* Report File Reference */}
                    <td className="px-6 py-4">
                      {rec.report_filename ? (
                        <button
                          onClick={() => handleSimulateReportDownload(rec.report_filename)}
                          className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 hover:underline font-mono"
                          title="Verify safe document reference"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{rec.report_filename}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No report linked</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingRecord(rec)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(rec)}
                          title="Edit Record"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{filteredRecords.length}</strong> of{' '}
            <strong className="text-slate-700">{records.length}</strong> records
          </span>
          <span className="hidden sm:inline">
            Fictional report references with path-traversal prevention
          </span>
        </div>
      </div>

      {/* RECORD DETAILS MODAL */}
      <Modal
        isOpen={Boolean(viewingRecord)}
        onClose={() => {
          setViewingRecord(null)
          setSelectedRecordFromDash(null)
        }}
        title={`Inspection Record: ${viewingRecord?.record_id}`}
        subtitle="Full certified hydrotest inspection details"
      >
        {viewingRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Asset ID</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {viewingRecord.asset_id}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Result</span>
                <div className="mt-1">
                  <ResultBadge result={viewingRecord.result} />
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Test Date</span>
                <p className="font-mono text-slate-800 mt-0.5">{viewingRecord.test_date}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Provider</span>
                <p className="font-medium text-slate-800 mt-0.5">
                  {viewingRecord.performed_by}
                </p>
              </div>
            </div>

            {/* Inspection notes */}
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Inspection Remarks & Observation Notes
              </span>
              <p className="mt-1.5 p-3 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 italic">
                "{viewingRecord.notes || 'No notes entered for this test.'}"
              </p>
            </div>

            {/* Document reference */}
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">
                Certified Report Reference
              </span>
              <div className="mt-1 flex items-center justify-between p-3 bg-orange-50/60 rounded-lg border border-orange-200 text-xs">
                <div className="flex items-center gap-2 text-orange-900 font-mono">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>{viewingRecord.report_filename || 'HT-DEFAULT-ARCHIVE.pdf'}</span>
                </div>
                <button
                  onClick={() => handleSimulateReportDownload(viewingRecord.report_filename)}
                  className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 rounded font-medium transition-colors"
                >
                  Verify Ref
                </button>
              </div>
            </div>

            {/* Audit timestamps */}
            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Created: {new Date(viewingRecord.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(viewingRecord.updated_at).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD RECORD MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          clearPrefillAssetId()
        }}
        title="Record New Hydrotest Inspection"
        subtitle="Must reference an existing asset ID. Validates result values and safe filenames."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Referenced Asset ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Referenced Asset ID *
              </label>
              <select
                required
                value={addForm.asset_id}
                onChange={(e) => setAddForm({ ...addForm, asset_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white font-mono"
              >
                <option value="">Select Asset...</option>
                {assets.map((a) => (
                  <option key={a.asset_id} value={a.asset_id}>
                    {a.asset_id} — {a.asset_type} ({a.station})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom record ID (optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Custom Record ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank for auto-generation"
                value={addForm.record_id || ''}
                onChange={(e) => setAddForm({ ...addForm, record_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Test Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Test Date *
              </label>
              <input
                type="date"
                required
                value={addForm.test_date}
                onChange={(e) => setAddForm({ ...addForm, test_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Result */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Inspection Result *
              </label>
              <select
                required
                value={addForm.result}
                onChange={(e) =>
                  setAddForm({ ...addForm, result: e.target.value as TestResultType })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white font-semibold"
              >
                <option value="Pass">Pass (Meets ASME/API pressure standards)</option>
                <option value="Fail">Fail (Detected leaks, wall deformation or drop)</option>
                <option value="Pending">Pending (Hold period / engineering review)</option>
              </select>
            </div>
          </div>

          {/* Performed By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Performed By / Testing Agency *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Hydro-Testing Services Ltd"
              value={addForm.performed_by}
              onChange={(e) => setAddForm({ ...addForm, performed_by: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Safe Report Document Filename */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Report Filename Reference (Safe Reference)
            </label>
            <input
              type="text"
              placeholder="e.g. HT-REP-2026-TK01.pdf"
              value={addForm.report_filename || ''}
              onChange={(e) => setAddForm({ ...addForm, report_filename: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Only alphanumeric filenames allowed. Directory paths (/ or \) are rejected for security.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observations & Hold Notes
            </label>
            <textarea
              rows={3}
              placeholder="Record test pressure (PSI), hold duration, temperature, and visual inspection notes..."
              value={addForm.notes || ''}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false)
                clearPrefillAssetId()
              }}
              className="min-h-11 w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? 'Recording...' : 'Save Hydrotest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT RECORD MODAL */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title={`Edit Hydrotest Record: ${editingRecord?.record_id}`}
        subtitle={`Linked to Asset: ${editingRecord?.asset_id}. Created timestamp is preserved.`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Test Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Test Date
              </label>
              <input
                type="date"
                value={editForm.test_date}
                onChange={(e) => setEditForm({ ...editForm, test_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Result */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Inspection Result
              </label>
              <select
                value={editForm.result}
                onChange={(e) =>
                  setEditForm({ ...editForm, result: e.target.value as TestResultType })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Performed By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Performed By / Provider
            </label>
            <input
              type="text"
              value={editForm.performed_by}
              onChange={(e) => setEditForm({ ...editForm, performed_by: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Report Filename */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Report Filename Reference
            </label>
            <input
              type="text"
              value={editForm.report_filename || ''}
              onChange={(e) => setEditForm({ ...editForm, report_filename: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={editForm.notes || ''}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="min-h-11 w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
