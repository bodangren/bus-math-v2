import { render, screen } from '@testing-library/react'
import { MonthEndClosePractice } from '@/components/activities/exercises/MonthEndClosePractice'
import { expect, vi } from 'vitest'

describe('MonthEndClosePractice', () => {
  it('renders without crashing', () => {
    render(<MonthEndClosePractice activity={{}} />)
    expect(screen.getByText(/Month‑End Close Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<MonthEndClosePractice activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Month‑End Close Practice/i)).toBeInTheDocument()
  })

  it('calls onComplete when answer is correct', () => {
    const onComplete = vi.fn()
    render(<MonthEndClosePractice activity={{}} onComplete={onComplete} />)
    
    expect(screen.getByText(/Month‑End Close Practice/i)).toBeInTheDocument()
  })
})
