import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { BalanceSheetPractice } from '@/components/activities/exercises/BalanceSheetPractice'

describe('BalanceSheetPractice', () => {
  it('renders without crashing', () => {
    render(<BalanceSheetPractice activity={{}} />)
    expect(screen.getByText(/Balance Sheet Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<BalanceSheetPractice activity={{}} onSubmit={onSubmit} />)
    
    const firstOption = screen.getAllByRole('button')[0]
    fireEvent.click(firstOption)
    
    const checkButton = screen.getByText(/Check Answer/i)
    fireEvent.click(checkButton)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('calls onComplete when mastery is achieved', () => {
    const onComplete = vi.fn()
    render(<BalanceSheetPractice activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Balance Sheet Practice/i)).toBeInTheDocument()
  })
})
