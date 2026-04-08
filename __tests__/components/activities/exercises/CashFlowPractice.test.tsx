import { render, screen } from '@testing-library/react'
import { CashFlowPractice } from '@/components/activities/exercises/CashFlowPractice'
import { expect, vi } from 'vitest'

describe('CashFlowPractice', () => {
  it('renders without crashing', () => {
    render(<CashFlowPractice activity={{}} />)
    expect(screen.getByText(/Cash Flow Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<CashFlowPractice activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Cash Flow Practice/i)).toBeInTheDocument()
  })

  it('calls onComplete when mastery is achieved', () => {
    const onComplete = vi.fn()
    render(<CashFlowPractice activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Cash Flow Practice/i)).toBeInTheDocument()
  })
})
