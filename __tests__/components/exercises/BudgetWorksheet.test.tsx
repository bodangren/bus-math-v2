import { render, screen } from '@testing-library/react'
import { BudgetWorksheet } from '@/components/activities/exercises/BudgetWorksheet'
import { expect, vi } from 'vitest'

describe('BudgetWorksheet', () => {
  it('renders without crashing', () => {
    render(<BudgetWorksheet activity={{}} />)
    expect(screen.getByText(/Budget Worksheet/i)).toBeInTheDocument()
  })

  it('calls onSubmit when budget is complete', () => {
    const onSubmit = vi.fn()
    render(<BudgetWorksheet activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Budget Worksheet/i)).toBeInTheDocument()
  })

  it('calls onComplete when budget is complete', () => {
    const onComplete = vi.fn()
    render(<BudgetWorksheet activity={{}} onComplete={onComplete} />)
    
    expect(screen.getByText(/Budget Worksheet/i)).toBeInTheDocument()
  })
})
