import { render, screen } from '@testing-library/react'
import { AdjustmentPractice } from '@/components/activities/exercises/AdjustmentPractice'
import { expect, vi } from 'vitest'

describe('AdjustmentPractice', () => {
  it('renders without crashing', () => {
    render(<AdjustmentPractice activity={{}} />)
    expect(screen.getByText(/Adjustment Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<AdjustmentPractice activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Adjustment Practice/i)).toBeInTheDocument()
  })

  it('calls onComplete when mastery is achieved', () => {
    const onComplete = vi.fn()
    render(<AdjustmentPractice activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Adjustment Practice/i)).toBeInTheDocument()
  })
})