import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ProfitCalculator } from '@/components/activities/exercises/ProfitCalculator'

describe('ProfitCalculator', () => {
  it('renders without crashing', () => {
    render(<ProfitCalculator activity={{}} />)
    expect(screen.getByText(/Profit Calculator/i)).toBeInTheDocument()
  })

  it('calls onSubmit when complete is clicked', () => {
    const onSubmit = vi.fn()
    render(<ProfitCalculator activity={{}} onSubmit={onSubmit} />)
    
    const completeButton = screen.getByText(/Complete Calculation/i)
    fireEvent.click(completeButton)
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('calls onComplete when complete is clicked', () => {
    const onComplete = vi.fn()
    render(<ProfitCalculator activity={{}} onComplete={onComplete} />)
    
    const completeButton = screen.getByText(/Complete Calculation/i)
    fireEvent.click(completeButton)
    
    expect(onComplete).toHaveBeenCalled()
  })

  it('resets submission state when onSubmit throws, allowing retry', async () => {
    const onSubmit = vi.fn().mockImplementation(() => {
      throw new Error('Network error')
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(<ProfitCalculator activity={{}} onSubmit={onSubmit} />)
    
    const completeButton = screen.getByText(/Complete Calculation/i)
    fireEvent.click(completeButton)
    
    expect(onSubmit).toHaveBeenCalledTimes(1)
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })
    
    fireEvent.click(completeButton)
    expect(onSubmit).toHaveBeenCalledTimes(2)
    
    consoleError.mockRestore()
  })
})
