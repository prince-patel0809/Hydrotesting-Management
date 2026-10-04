import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit,
  ClipboardCheck,
  Building,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react'
import { Asset, AssetCreatePayload, AssetUpdatePayload } from '../types'
import { ResultBadge, ValidityBadge, StatusBadge } from './Badges'
import { Modal } from './Modal'

const ASSET_TYPES = [
  'Storage Tank',
  'Fuel Pipeline',
  'Pressure Vessel',
  'Dispenser Unit',
  'Transfer Manifold',
  'Filter Separator',
  'Valve Station',
]

const STATUS_OPTIONS = ['Active', 'Maintenance', 'Inactive', 'Decommissioned']

interface AssetManagementViewProps {
  assets: Asset[]
  loading: boolean
  initialValidityFilter?: string
  onCreateAsset: (payload: AssetCreatePayload) => Promise<void>
  onUpdateAsset: (assetId: string, payload: AssetUpdatePayload) => Promise<void>
  onOpenAddRecord: (assetId: string) => void
  onRefresh: () => void
}

export const AssetManagementView: React.FC<AssetManagementViewProps> = ({
  assets,
  loading,
  initialValidityFilter,
  onCreateAsset,
  onUpdateAsset,
  onOpenAddRecord,
}) => {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStation, setSelectedStation] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedValidity, setSelectedValidity] = useState(initialValidityFilter || '')
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for Add
  const [addForm, setAddForm] = useState<AssetCreatePayload>({
    asset_id: '',
    station: '',
    asset_type: 'Storage Tank',
    serial_number: '',
    test_date: new Date().toISOString().split('T')[0],
    next_due_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: 'Active',
  })

  // Form state for Edit
  const [editForm, setEditForm] = useState<AssetUpdatePayload>({
    station: '',
    asset_type: '',
    serial_number: '',
    test_date: '',
    next_due_date: '',
    status: '',
  })

  // Extract unique stations for dropdown
  const uniqueStations = useMemo(() => {
    const set = new Set(assets.map((a) => a.station))
    return Array.from(set).sort()
  }, [assets])

  // Filtered & Sorted assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        // Text search
        if (searchTerm) {
          const s = searchTerm.toLowerCase()
          const matches =
            asset.asset_id.toLowerCase().includes(s) ||
            asset.serial_number.toLowerCase().includes(s) ||
            asset.station.toLowerCase().includes(s) ||
            asset.asset_type.toLowerCase().includes(s)
          if (!matches) return false
        }
        // Station filter
        if (selectedStation && asset.station !== selectedStation) return false
        // Asset type filter
        if (selectedType && asset.asset_type !== selectedType) return false
        // Status filter
        if (selectedStatus && asset.status !== selectedStatus) return false
        // Validity category filter
        if (selectedValidity && asset.validity_category !== selectedValidity) return false
        // Due Date range
        if (dueFrom && asset.next_due_date < dueFrom) return false
        if (dueTo && asset.next_due_date > dueTo) return false

        return true
      })
      .sort((a, b) => {
        const dateA = new Date(a.next_due_date).getTime()
        const dateB = new Date(b.next_due_date).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
  }, [
    assets,
    searchTerm,
    selectedStation,
    selectedType,
    selectedStatus,
    selectedValidity,
    dueFrom,
    dueTo,
    sortOrder,
  ])

  // Handle Add Form Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (addForm.next_due_date < addForm.test_date) {
      setModalError('Next-due date cannot be earlier than test date.')
      return
    }

    try {
      setIsSubmitting(true)
      await onCreateAsset(addForm)
      setIsAddModalOpen(false)
      // Reset form
      setAddForm({
        asset_id: '',
        station: '',
        asset_type: 'Storage Tank',
        serial_number: '',
        test_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        status: 'Active',
      })
    } catch (err: any) {
      setModalError(err.message || 'Failed to register asset.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset)
    setEditForm({
      station: asset.station,
      asset_type: asset.asset_type,
      serial_number: asset.serial_number,
      test_date: asset.test_date,
      next_due_date: asset.next_due_date,
      status: asset.status,
    })
    setModalError(null)
  }

  // Handle Edit Form Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset) return
    setModalError(null)

    if (editForm.test_date && editForm.next_due_date) {
      if (editForm.next_due_date < editForm.test_date) {
        setModalError('Next-due date cannot be earlier than test date.')
        return
      }
    }

    try {
      setIsSubmitting(true)
      await onUpdateAsset(editingAsset.asset_id, editForm)
      setEditingAsset(null)
    } catch (err: any) {
      setModalError(err.message || 'Failed to update asset.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear all filters
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedStation('')
    setSelectedType('')
    setSelectedStatus('')
    setSelectedValidity('')
    setDueFrom('')
    setDueTo('')
  }

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedStation) ||
    Boolean(selectedType) ||
    Boolean(selectedStatus) ||
    Boolean(selectedValidity) ||
    Boolean(dueFrom) ||
    Boolean(dueTo)

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Equipment & Asset Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register, inspect, and maintain fuel terminals, pressure vessels, and pipeline assets.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null)
            setIsAddModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Asset ID, Serial, Station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Station Filter */}
          <div>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700"
            >
              <option value="">All Stations & Sites</option>
              {uniqueStations.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700"
            >
              <option value="">All Asset Types</option>
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Validity Filter */}
          <div>
            <select
              value={selectedValidity}
              onChange={(e) => setSelectedValidity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700"
            >
              <option value="">All Validity States</option>
              <option value="Valid">Valid (Unexpired)</option>
              <option value="Due Soon">Due Soon (&le; 30 Days)</option>
              <option value="Overdue">Overdue (&lt; Today)</option>
            </select>
          </div>
        </div>

        {/* Secondary Row: Due Date Range, Status & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Range */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Due Range:</span>
              <input
                type="date"
                value={dueFrom}
                onChange={(e) => setDueFrom(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="From"
              />
              <span>to</span>
              <input
                type="date"
                value={dueTo}
                onChange={(e) => setDueTo(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="To"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort By Due Date Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort by Next Due Date:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>{sortOrder === 'asc' ? 'Ascending (Soonest First)' : 'Descending (Furthest First)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Asset ID / Serial</th>
                <th className="px-6 py-3.5">Station / Location</th>
                <th className="px-6 py-3.5">Asset Type</th>
                <th className="px-6 py-3.5">Last Test</th>
                <th className="px-6 py-3.5">Next Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading equipment assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No assets match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.asset_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Asset ID & Serial */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">
                        {asset.asset_id}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        SN: {asset.serial_number}
                      </div>
                    </td>

                    {/* Station */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{asset.station}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-slate-700">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {asset.asset_type}
                      </span>
                    </td>

                    {/* Last Test Date & Latest Result */}
                    <td className="px-6 py-4">
                      <div className="text-slate-800 text-xs font-mono">{asset.test_date}</div>
                      <div className="mt-1">
                        <ResultBadge result={asset.latest_test_result} />
                      </div>
                    </td>

                    {/* Next Due Date & Validity Badge */}
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-semibold text-xs font-mono">
                        {asset.next_due_date}
                      </div>
                      <div className="mt-1">
                        <ValidityBadge
                          category={asset.validity_category}
                          daysUntilDue={asset.days_until_due}
                        />
                      </div>
                    </td>

                    {/* Operational Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={asset.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenAddRecord(asset.asset_id)}
                          title="Record Hydrotest"
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(asset)}
                          title="Edit Asset"
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

        {/* Table Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{filteredAssets.length}</strong> of{' '}
            <strong className="text-slate-700">{assets.length}</strong> assets
          </span>
          <span className="hidden sm:inline">
            Preserves system audit timestamps (created_at & updated_at)
          </span>
        </div>
      </div>

      {/* ADD ASSET MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Equipment Asset"
        subtitle="Ensure unique Asset ID and that next-due date is not earlier than test date."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Asset ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Asset ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FF-TK-105"
                value={addForm.asset_id}
                onChange={(e) => setAddForm({ ...addForm, asset_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Serial / Reference Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SN-TK-99201"
                value={addForm.serial_number}
                onChange={(e) => setAddForm({ ...addForm, serial_number: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Station / Site */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Station / Site Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Station Alpha - Bulk Fuel Terminal"
                value={addForm.station}
                onChange={(e) => setAddForm({ ...addForm, station: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Asset Type *
              </label>
              <select
                required
                value={addForm.asset_type}
                onChange={(e) => setAddForm({ ...addForm, asset_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Validity / Next Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Validity / Next-Due Date *
              </label>
              <input
                type="date"
                required
                value={addForm.next_due_date}
                onChange={(e) => setAddForm({ ...addForm, next_due_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Operational Status *
            </label>
            <select
              value={addForm.status}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT ASSET MODAL */}
      <Modal
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
        title={`Edit Equipment Asset: ${editingAsset?.asset_id}`}
        subtitle="Asset ID is immutable. Created timestamp is preserved."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Station */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Station / Site Location
              </label>
              <input
                type="text"
                value={editForm.station}
                onChange={(e) => setEditForm({ ...editForm, station: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Asset Type
              </label>
              <select
                value={editForm.asset_type}
                onChange={(e) => setEditForm({ ...editForm, asset_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Serial Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Serial / Reference Number
              </label>
              <input
                type="text"
                value={editForm.serial_number}
                onChange={(e) => setEditForm({ ...editForm, serial_number: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Operational Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Operational Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Test Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Last Test Date
              </label>
              <input
                type="date"
                value={editForm.test_date}
                onChange={(e) => setEditForm({ ...editForm, test_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Next Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={editForm.next_due_date}
                onChange={(e) => setEditForm({ ...editForm, next_due_date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditingAsset(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
