import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { IncomeStatementPractice } from '@/components/activities/exercises/IncomeStatementPractice'

describe('IncomeStatementPractice', () => {
  it('renders without crashing', () => {
    render(<IncomeStatementPractice activity={{}} />)
    expect(screen.getByText(/Income Statement Practice/i)).toBeInTheDocument()
  })

  it('calls onSubmit when answer is checked', () => {
    const onSubmit = vi.fn()
    render(<IncomeStatementPractice activity={{}} onSubmit={onSubmit} />)
    
    const firstOption = screen.getAllByRole('button')[0]
    fireEvent.click(firstOption)
    
    const checkButton = screen.getByText(/Check Answer/i)
    fireEvent.click(checkButton)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('calls onComplete when mastery is achieved', () => {
    const onComplete = vi.fn()
    render(<IncomeStatementPractice activity={{ props: { masteryThreshold: 1 } }} onComplete={onComplete} />)
    
    expect(screen.getByText(/Income Statement Practice/i)).toBeInTheDocument()
  })
})
