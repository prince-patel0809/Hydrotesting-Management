import React, { useState, useEffect, useCallback } from 'react'
import { Navbar } from './components/Navbar'
import { DashboardView } from './components/DashboardView'
import { AssetManagementView } from './components/AssetManagementView'
import { HydrotestRecordsView } from './components/HydrotestRecordsView'
import { api } from './api/client'
import {
  Asset,
  HydrotestRecord,
  SummaryResponse,
  AssetCreatePayload,
  AssetUpdatePayload,
  RecordCreatePayload,
  RecordUpdatePayload,
} from './types'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'records'>('dashboard')
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [records, setRecords] = useState<HydrotestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  // Cross-view navigation filters
  const [assetValidityFilter, setAssetValidityFilter] = useState<string | undefined>()
  const [recordResultFilter, setRecordResultFilter] = useState<string | undefined>()
  const [prefillAssetId, setPrefillAssetId] = useState<string | undefined>()
  const [selectedRecordFromDash, setSelectedRecordFromDash] = useState<HydrotestRecord | null>(null)

  // Show auto-dismissing success toast
  const triggerSuccess = (msg: string) => {
    setSuccessNotice(msg)
    setTimeout(() => {
      setSuccessNotice((current) => (current === msg ? null : current))
    }, 4500)
  }

  // Load all data
  const loadData = useCallback(async (isRefreshAction = false) => {
    if (isRefreshAction) setIsRefreshing(true)
    else setLoading(true)
    setErrorNotice(null)

    try {
      const [sumRes, astRes, recRes] = await Promise.all([
        api.getSummary(),
        api.getAssets(),
        api.getRecords(),
      ])
      setSummary(sumRes)
      setAssets(astRes)
      setRecords(recRes)
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to fetch application data from server.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Asset Actions
  const handleCreateAsset = async (payload: AssetCreatePayload) => {
    const created = await api.createAsset(payload)
    triggerSuccess(`Asset "${created.asset_id}" successfully registered!`)
    await loadData(true)
  }

  const handleUpdateAsset = async (assetId: string, payload: AssetUpdatePayload) => {
    const updated = await api.updateAsset(assetId, payload)
    triggerSuccess(`Asset "${updated.asset_id}" updated successfully. Audit timestamp refreshed.`)
    await loadData(true)
  }

  // Record Actions
  const handleCreateRecord = async (payload: RecordCreatePayload) => {
    const created = await api.createRecord(payload)
    triggerSuccess(`Hydrotest record "${created.record_id}" logged successfully for asset ${created.asset_id}!`)
    await loadData(true)
  }

  const handleUpdateRecord = async (recordId: string, payload: RecordUpdatePayload) => {
    const updated = await api.updateRecord(recordId, payload)
    triggerSuccess(`Hydrotest record "${updated.record_id}" updated successfully.`)
    await loadData(true)
  }

  // Navigation helpers from Dashboard
  const handleNavigateToAssetsWithFilter = (validity?: string) => {
    setAssetValidityFilter(validity)
    setActiveTab('assets')
  }

  const handleNavigateToRecordsWithFilter = (result?: string) => {
    setRecordResultFilter(result)
    setActiveTab('records')
  }

  const handleOpenAddRecord = (assetId?: string) => {
    setPrefillAssetId(assetId)
    setActiveTab('records')
  }

  const handleSelectRecordFromDashboard = (rec: HydrotestRecord) => {
    setSelectedRecordFromDash(rec)
    setActiveTab('records')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
          if (tab === 'assets') setAssetValidityFilter(undefined)
          if (tab === 'records') {
            setRecordResultFilter(undefined)
            setPrefillAssetId(undefined)
          }
        }}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Toast / Notification Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 space-y-2">
        {errorNotice && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={() => setErrorNotice(null)}
              className="p-1 text-red-400 hover:text-red-700 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successNotice && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="p-1 text-emerald-400 hover:text-emerald-700 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            loading={loading}
            onNavigateToAssets={handleNavigateToAssetsWithFilter}
            onNavigateToRecords={handleNavigateToRecordsWithFilter}
            onOpenAddRecord={handleOpenAddRecord}
            onSelectRecord={handleSelectRecordFromDashboard}
          />
        )}

        {activeTab === 'assets' && (
          <AssetManagementView
            assets={assets}
            loading={loading}
            initialValidityFilter={assetValidityFilter}
            onCreateAsset={handleCreateAsset}
            onUpdateAsset={handleUpdateAsset}
            onOpenAddRecord={handleOpenAddRecord}
            onRefresh={() => loadData(true)}
          />
        )}

        {activeTab === 'records' && (
          <HydrotestRecordsView
            records={records}
            assets={assets}
            loading={loading}
            initialResultFilter={recordResultFilter}
            onCreateRecord={handleCreateRecord}
            onUpdateRecord={handleUpdateRecord}
            selectedRecordFromDash={selectedRecordFromDash}
            setSelectedRecordFromDash={setSelectedRecordFromDash}
            prefillAssetId={prefillAssetId}
            clearPrefillAssetId={() => setPrefillAssetId(undefined)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>FuelFlux Technology Private Limited</strong> — Hydrotesting Management & Inspection Workflow
          </div>
          <div>
            API Documentation: <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Swagger UI (/docs)</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
