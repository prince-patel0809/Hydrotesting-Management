import {
  Asset,
  AssetCreatePayload,
  AssetUpdatePayload,
  HydrotestRecord,
  RecordCreatePayload,
  RecordUpdatePayload,
  SummaryResponse,
  AssetFilterParams,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`
    try {
      const data = await res.json()
      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorDetail = data.detail
        } else if (Array.isArray(data.detail)) {
          errorDetail = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ')
        }
      } else if (data.errors && Array.isArray(data.errors)) {
        errorDetail = data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
      }
    } catch {
      // Fallback to text
    }
    throw new Error(errorDetail)
  }
  return res.json()
}

export const api = {
  // Dashboard Summary
  async getSummary(referenceDate?: string): Promise<SummaryResponse> {
    const params = new URLSearchParams()
    if (referenceDate) params.append('reference_date', referenceDate)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${BASE_URL}/api/hydrotests/summary${queryString}`)
    return handleResponse<SummaryResponse>(res)
  },

  // Assets
  async getAssets(params?: AssetFilterParams): Promise<Asset[]> {
    const searchParams = new URLSearchParams()
    if (params) {
      if (params.search) searchParams.append('search', params.search)
      if (params.station) searchParams.append('station', params.station)
      if (params.asset_type) searchParams.append('asset_type', params.asset_type)
      if (params.status) searchParams.append('status', params.status)
      if (params.validity) searchParams.append('validity', params.validity)
      if (params.due_from) searchParams.append('due_from', params.due_from)
      if (params.due_to) searchParams.append('due_to', params.due_to)
      if (params.sort_by) searchParams.append('sort_by', params.sort_by)
      if (params.sort_order) searchParams.append('sort_order', params.sort_order)
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const res = await fetch(`${BASE_URL}/api/hydrotests/assets${query}`)
    return handleResponse<Asset[]>(res)
  },

  async getAsset(assetId: string): Promise<Asset> {
    const res = await fetch(`${BASE_URL}/api/hydrotests/assets/${encodeURIComponent(assetId)}`)
    return handleResponse<Asset>(res)
  },

  async createAsset(payload: AssetCreatePayload): Promise<Asset> {
    const res = await fetch(`${BASE_URL}/api/hydrotests/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<Asset>(res)
  },

  async updateAsset(assetId: string, payload: AssetUpdatePayload): Promise<Asset> {
    const res = await fetch(`${BASE_URL}/api/hydrotests/assets/${encodeURIComponent(assetId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<Asset>(res)
  },

  // Hydrotest Records
  async getRecords(assetId?: string, result?: string): Promise<HydrotestRecord[]> {
    const params = new URLSearchParams()
    if (assetId) params.append('asset_id', assetId)
    if (result) params.append('result', result)
    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${BASE_URL}/api/hydrotests/records${query}`)
    return handleResponse<HydrotestRecord[]>(res)
  },

  async getRecord(recordId: string): Promise<HydrotestRecord> {
    const res = await fetch(`${BASE_URL}/api/hydrotests/records/${encodeURIComponent(recordId)}`)
    return handleResponse<HydrotestRecord>(res)
  },

  async createRecord(payload: RecordCreatePayload): Promise<HydrotestRecord> {
    const res = await fetch(`${BASE_URL}/api/hydrotests/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<HydrotestRecord>(res)
  },

  async updateRecord(recordId: string, payload: RecordUpdatePayload): Promise<HydrotestRecord> {
    const res = await fetch(`${BASE_URL}/api/hydrotests/records/${encodeURIComponent(recordId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<HydrotestRecord>(res)
  },
}
