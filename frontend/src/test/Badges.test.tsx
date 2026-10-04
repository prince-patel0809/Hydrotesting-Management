import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ResultBadge, ValidityBadge, StatusBadge } from '../components/Badges'

describe('Badges Component', () => {
  it('renders Pass result badge correctly', () => {
    render(<ResultBadge result="Pass" />)
    expect(screen.getByText('Pass')).toBeInTheDocument()
  })

  it('renders Fail result badge correctly', () => {
    render(<ResultBadge result="Fail" />)
    expect(screen.getByText('Fail')).toBeInTheDocument()
  })

  it('renders Pending result badge correctly', () => {
    render(<ResultBadge result="Pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders ValidityBadge for Valid, Due Soon, and Overdue', () => {
    const { rerender } = render(<ValidityBadge category="Valid" daysUntilDue={150} />)
    expect(screen.getByText('Valid')).toBeInTheDocument()
    expect(screen.getByText('(150d)')).toBeInTheDocument()

    rerender(<ValidityBadge category="Due Soon" daysUntilDue={12} />)
    expect(screen.getByText('Due Soon')).toBeInTheDocument()
    expect(screen.getByText('(12d left)')).toBeInTheDocument()

    rerender(<ValidityBadge category="Overdue" daysUntilDue={-5} />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('(5d ago)')).toBeInTheDocument()
  })

  it('renders StatusBadge with proper text', () => {
    render(<StatusBadge status="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
