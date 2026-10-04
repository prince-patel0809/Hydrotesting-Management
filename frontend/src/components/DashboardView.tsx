import React from 'react'
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  Building,
  Calendar,
} from 'lucide-react'
import { SummaryResponse, Asset, HydrotestRecord } from '../types'
import { ResultBadge, ValidityBadge, StatusBadge } from './Badges'

interface DashboardViewProps {
  summary: SummaryResponse | null
  loading: boolean
  onNavigateToAssets: (filterValidity?: string) => void
  onNavigateToRecords: (filterResult?: string) => void
  onOpenAddRecord: (prefilledAssetId?: string) => void
  onSelectRecord: (record: HydrotestRecord) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  loading,
  onNavigateToAssets,
  onNavigateToRecords,
  onOpenAddRecord,
  onSelectRecord,
}) => {
  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Loading hydrotesting compliance statistics...</p>
      </div>
    )
  }

  const stats = summary?.stats || {
    total_assets: 0,
    valid_tests: 0,
    tests_due_30_days: 0,
    overdue_tests: 0,
    failed_records: 0,
    pending_records: 0,
  }

  const upcomingTests = summary?.upcoming_tests || []
  const overdueTests = summary?.overdue_tests || []
  const failedRecords = summary?.failed_records || []
  const pendingRecords = summary?.pending_records || []

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex min-w-0 flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Hydrotesting Operational Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
              Overview
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time compliance monitoring, hydrostatic pressure hold analytics, and equipment recertification deadlines across all terminal stations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAddRecord()}
            className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Hydrotest</span>
          </button>
        </div>
      </div>

      {/* Six Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Assets */}
        <div
          onClick={() => onNavigateToAssets()}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-orange-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Assets
            </span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{stats.total_assets}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>View all registered</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* 2. Valid Tests */}
        <div
          onClick={() => onNavigateToAssets('Valid')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Valid Tests
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600">{stats.valid_tests}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Unexpired & compliant</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* 3. Due in 30 Days */}
        <div
          onClick={() => onNavigateToAssets('Due Soon')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Due in 30 Days
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600">{stats.tests_due_30_days}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Expiring shortly</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* 4. Overdue Tests */}
        <div
          onClick={() => onNavigateToAssets('Overdue')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Overdue Tests
            </span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-red-600">{stats.overdue_tests}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Immediate action</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* 5. Failed Records */}
        <div
          onClick={() => onNavigateToRecords('Fail')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              Failed Records
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-rose-600">{stats.failed_records}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Pressure drop / leaks</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* 6. Pending Records */}
        <div
          onClick={() => onNavigateToRecords('Pending')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pending Records
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600">{stats.pending_records}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Awaiting sign-off</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>
      </div>

      {/* Due Date & Action Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tests (Due within 30 days) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 bg-amber-50/50 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Tests Due Within Next 30 Days ({upcomingTests.length})
              </h2>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Schedule Recertification
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {upcomingTests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hydrotests due in the next 30 days. All equipment certifications are up to date!
              </div>
            ) : (
              upcomingTests.map((asset) => (
                <div
                  key={asset.asset_id}
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {asset.asset_id}
                      </span>
                      <span className="text-xs text-slate-500">({asset.asset_type})</span>
                      <ValidityBadge
                        category={asset.validity_category}
                        daysUntilDue={asset.days_until_due}
                      />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {asset.station}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due: {asset.next_due_date}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAddRecord(asset.asset_id)}
                    className="min-h-11 w-full sm:w-auto shrink-0 text-xs font-semibold px-3 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-md transition-colors"
                  >
                    Log Test
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Tests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 bg-red-50/50 border-b border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-slate-900">
                Overdue Hydrotests ({overdueTests.length})
              </h2>
            </div>
            <span className="text-xs font-medium text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
              Non-Compliant
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-96">
            {overdueTests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Excellent! Zero overdue hydrotests found across all terminals.
              </div>
            ) : (
              overdueTests.map((asset) => (
                <div
                  key={asset.asset_id}
                  className="p-4 hover:bg-red-50/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {asset.asset_id}
                      </span>
                      <span className="text-xs text-slate-500">({asset.asset_type})</span>
                      <ValidityBadge
                        category={asset.validity_category}
                        daysUntilDue={asset.days_until_due}
                      />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {asset.station}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-red-600">
                        <Calendar className="w-3.5 h-3.5" />
                        Expired: {asset.next_due_date}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAddRecord(asset.asset_id)}
                    className="min-h-11 w-full sm:w-auto shrink-0 text-xs font-semibold px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md shadow-sm transition-colors"
                  >
                    Retest Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Failed & Pending Records Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Inspection Records */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 bg-rose-50/50 border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">
                Failed Inspection Records ({failedRecords.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateToRecords('Fail')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80">
            {failedRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No failed hydrotest records on file.
              </div>
            ) : (
              failedRecords.map((rec) => (
                <div
                  key={rec.record_id}
                  onClick={() => onSelectRecord(rec)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {rec.record_id}
                      </span>
                      <span className="text-xs text-slate-500">Asset: {rec.asset_id}</span>
                    </div>
                    <ResultBadge result={rec.result} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 italic bg-rose-50/50 p-2 rounded border border-rose-100">
                    "{rec.notes || 'No notes specified'}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>By: {rec.performed_by}</span>
                    <span>Test Date: {rec.test_date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Records */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 bg-amber-50/50 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Pending Hydrotest Certifications ({pendingRecords.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateToRecords('Pending')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80">
            {pendingRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hydrotest records currently awaiting certification.
              </div>
            ) : (
              pendingRecords.map((rec) => (
                <div
                  key={rec.record_id}
                  onClick={() => onSelectRecord(rec)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {rec.record_id}
                      </span>
                      <span className="text-xs text-slate-500">Asset: {rec.asset_id}</span>
                    </div>
                    <ResultBadge result={rec.result} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                    "{rec.notes || 'Awaiting lab / engineer verification'}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>By: {rec.performed_by}</span>
                    <span>Test Date: {rec.test_date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
