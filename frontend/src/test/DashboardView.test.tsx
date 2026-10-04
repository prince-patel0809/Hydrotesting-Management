import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { DashboardView } from '../components/DashboardView'
import { SummaryResponse } from '../types'

const mockSummary: SummaryResponse = {
  stats: {
    total_assets: 10,
    valid_tests: 6,
    tests_due_30_days: 3,
    overdue_tests: 2,
    failed_records: 2,
    pending_records: 1,
  },
  upcoming_tests: [
    {
      asset_id: 'FF-TK-101',
      station: 'Station Alpha',
      asset_type: 'Storage Tank',
      serial_number: 'SN-01',
      test_date: '2025-10-01',
      next_due_date: '2026-10-20',
      status: 'Active',
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
      days_until_due: 17,
      validity_category: 'Due Soon',
      hydrotest_count: 2,
    },
  ],
  overdue_tests: [
    {
      asset_id: 'FF-PL-201',
      station: 'Station Beta',
      asset_type: 'Fuel Pipeline',
      serial_number: 'SN-02',
      test_date: '2025-08-01',
      next_due_date: '2026-09-15',
      status: 'Maintenance',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
      days_until_due: -18,
      validity_category: 'Overdue',
      hydrotest_count: 1,
    },
  ],
  failed_records: [
    {
      record_id: 'HTR-2026-0005',
      asset_id: 'FF-PL-201',
      test_date: '2026-09-20',
      performed_by: 'Inspector John',
      result: 'Fail',
      notes: 'Pressure loss under 220 PSI',
      report_filename: 'HT-FAIL-01.pdf',
      created_at: '2026-09-20T00:00:00Z',
      updated_at: '2026-09-20T00:00:00Z',
    },
  ],
  pending_records: [],
  reference_date: '2026-10-03',
  generated_at: '2026-10-03T00:00:00Z',
}

describe('DashboardView Component', () => {
  it('renders all 6 metric counts accurately', () => {
    const onNavigateAssets = vi.fn()
    const onNavigateRecords = vi.fn()
    const onOpenAdd = vi.fn()
    const onSelectRec = vi.fn()

    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        onNavigateToAssets={onNavigateAssets}
        onNavigateToRecords={onNavigateRecords}
        onOpenAddRecord={onOpenAdd}
        onSelectRecord={onSelectRec}
      />
    )

    // Check 6 metric titles
    expect(screen.getByText('Total Assets')).toBeInTheDocument()
    expect(screen.getByText('Valid Tests')).toBeInTheDocument()
    expect(screen.getByText('Due in 30 Days')).toBeInTheDocument()
    expect(screen.getByText('Overdue Tests')).toBeInTheDocument()
    expect(screen.getByText('Failed Records')).toBeInTheDocument()
    expect(screen.getByText('Pending Records')).toBeInTheDocument()

    // Check metric values
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders upcoming and overdue asset lists', () => {
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        onNavigateToAssets={vi.fn()}
        onNavigateToRecords={vi.fn()}
        onOpenAddRecord={vi.fn()}
        onSelectRecord={vi.fn()}
      />
    )

    expect(screen.getByText('FF-TK-101')).toBeInTheDocument()
    expect(screen.getByText('FF-PL-201')).toBeInTheDocument()
    expect(screen.getByText(/Pressure loss under 220 PSI/)).toBeInTheDocument()
  })

  it('triggers navigation callback when card is clicked', () => {
    const onNavigateAssets = vi.fn()
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        onNavigateToAssets={onNavigateAssets}
        onNavigateToRecords={vi.fn()}
        onOpenAddRecord={vi.fn()}
        onSelectRecord={vi.fn()}
      />
    )

    const overdueCard = screen.getByText('Overdue Tests').closest('div')
    fireEvent.click(overdueCard!)
    expect(onNavigateAssets).toHaveBeenCalledWith('Overdue')
  })
})
