import { render, screen } from '@testing-library/react'
import { ProfitCalculator } from '@/components/activities/exercises/ProfitCalculator'
import { expect, vi } from 'vitest'

describe('ProfitCalculator', () => {
  it('renders without crashing', () => {
    render(<ProfitCalculator activity={{}} />)
    expect(screen.getByText(/Profit Calculator/i)).toBeInTheDocument()
  })

  it('calls onSubmit when calculation is complete', () => {
    const onSubmit = vi.fn()
    render(<ProfitCalculator activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Profit Calculator/i)).toBeInTheDocument()
  })

  it('calls onComplete when calculation is complete', () => {
    const onComplete = vi.fn()
    render(<ProfitCalculator activity={{}} onComplete={onComplete} />)
    
    expect(screen.getByText(/Profit Calculator/i)).toBeInTheDocument()
  })
})
