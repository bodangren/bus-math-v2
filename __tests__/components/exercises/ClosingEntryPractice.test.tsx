import { render, screen } from '@testing-library/react'
import { ClosingEntryPractice } from '@/components/activities/exercises/ClosingEntryPractice'
import { expect, vi } from 'vitest'

describe('ClosingEntryPractice', () => {
  it('renders without crashing', () => {
    render(<ClosingEntryPractice activity={{}} />)
    expect(screen.getByText(/Closing Entry Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<ClosingEntryPractice activity={{}} onSubmit={onSubmit} />)
    
    expect(screen.getByText(/Closing Entry Practice/i)).toBeInTheDocument()
  })

  it('calls onComplete when mastery is achieved', () => {
    const onComplete = vi.fn()
    render(<ClosingEntryPractice activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Closing Entry Practice/i)).toBeInTheDocument()
  })
})
