import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { AssetManagementView } from '../components/AssetManagementView'
import { Asset } from '../types'

const sampleAssets: Asset[] = [
  {
    asset_id: 'FF-TK-101',
    station: 'Station Alpha - Bulk Fuel Terminal',
    asset_type: 'Storage Tank',
    serial_number: 'SN-TK-88210',
    test_date: '2025-10-01',
    next_due_date: '2026-10-20',
    status: 'Active',
    created_at: '2025-10-01T00:00:00Z',
    updated_at: '2025-10-01T00:00:00Z',
    days_until_due: 17,
    validity_category: 'Due Soon',
    hydrotest_count: 2,
  },
  {
    asset_id: 'FF-PL-201',
    station: 'Station Beta - Refinery Intake',
    asset_type: 'Fuel Pipeline',
    serial_number: 'SN-PL-55401',
    test_date: '2025-08-01',
    next_due_date: '2026-09-15',
    status: 'Maintenance',
    created_at: '2025-08-01T00:00:00Z',
    updated_at: '2025-08-01T00:00:00Z',
    days_until_due: -18,
    validity_category: 'Overdue',
    hydrotest_count: 1,
  },
]

describe('AssetManagementView Component', () => {
  it('renders asset table with equipment rows', () => {
    render(
      <AssetManagementView
        assets={sampleAssets}
        loading={false}
        onCreateAsset={vi.fn()}
        onUpdateAsset={vi.fn()}
        onOpenAddRecord={vi.fn()}
        onRefresh={vi.fn()}
      />
    )

    expect(screen.getByText('FF-TK-101')).toBeInTheDocument()
    expect(screen.getByText('SN: SN-TK-88210')).toBeInTheDocument()
    expect(screen.getAllByText('Station Alpha - Bulk Fuel Terminal')[0]).toBeInTheDocument()
    expect(screen.getByText('FF-PL-201')).toBeInTheDocument()
  })

  it('filters assets dynamically when typing in search bar', () => {
    render(
      <AssetManagementView
        assets={sampleAssets}
        loading={false}
        onCreateAsset={vi.fn()}
        onUpdateAsset={vi.fn()}
        onOpenAddRecord={vi.fn()}
        onRefresh={vi.fn()}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search Asset ID, Serial, Station...')
    fireEvent.change(searchInput, { target: { value: 'Pipeline' } })

    // FF-PL-201 matches Pipeline
    expect(screen.getByText('FF-PL-201')).toBeInTheDocument()
    // FF-TK-101 does not match Pipeline
    expect(screen.queryByText('FF-TK-101')).not.toBeInTheDocument()
  })

  it('opens Register Asset modal on button click', () => {
    render(
      <AssetManagementView
        assets={sampleAssets}
        loading={false}
        onCreateAsset={vi.fn()}
        onUpdateAsset={vi.fn()}
        onOpenAddRecord={vi.fn()}
        onRefresh={vi.fn()}
      />
    )

    const registerBtn = screen.getByText('Register New Asset')
    fireEvent.click(registerBtn)

    expect(screen.getByText('Register New Equipment Asset')).toBeInTheDocument()
    expect(screen.getByText('Asset ID *')).toBeInTheDocument()
  })
})
