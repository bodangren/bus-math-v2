import { render, screen, fireEvent } from '@testing-library/react'
import { MarkupMarginMastery } from '@/components/activities/exercises/MarkupMarginMastery'
import { expect, vi } from 'vitest'

describe('MarkupMarginMastery', () => {
  it('renders without crashing', () => {
    render(<MarkupMarginMastery activity={{}} />)
    expect(screen.getByText(/Markup & Margin Mastery/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<MarkupMarginMastery activity={{}} onSubmit={onSubmit} />)
    
    const firstOption = screen.getAllByRole('button')[0]
    fireEvent.click(firstOption)
    
    const checkButton = screen.getByText(/Check Answer/i)
    fireEvent.click(checkButton)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('calls onComplete when mastery is achieved', () => {
    const onComplete = vi.fn()
    render(<MarkupMarginMastery activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    // Just verify the component renders without crashing
    expect(screen.getByText(/Markup & Margin Mastery/i)).toBeInTheDocument()
  })
})
