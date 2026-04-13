import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfitCalculator } from '@/components/activities/exercises/ProfitCalculator'
import { expect, vi } from 'vitest'

describe('ProfitCalculator', () => {
  it('renders without crashing', () => {
    render(<ProfitCalculator activity={{}} />)
    expect(screen.getByText(/Profit Calculator/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct envelope when calculation is complete', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProfitCalculator activity={{ id: 'profit-calc-test' }} onSubmit={onSubmit} />)

    const revenueInput = screen.getByLabelText(/Total Revenue/i)
    const expensesInput = screen.getByLabelText(/Total Expenses/i)

    await user.clear(revenueInput)
    await user.type(revenueInput, '150000')
    await user.clear(expensesInput)
    await user.type(expensesInput, '90000')

    const completeButton = screen.getByRole('button', { name: /Complete Calculation/i })
    await user.click(completeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope.contractVersion).toBe('practice.v1')
    expect(envelope.activityId).toBe('profit-calc-test')
    expect(envelope.status).toBe('submitted')
    expect(envelope.answers).toMatchObject({
      revenue: 150000,
      expenses: 90000,
      profit: 60000,
      profitMargin: 40,
      isProfitable: true,
    })
  })

  it('calls onComplete after successful submission', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ProfitCalculator activity={{}} onComplete={onComplete} />)

    const revenueInput = screen.getByLabelText(/Total Revenue/i)
    const expensesInput = screen.getByLabelText(/Total Expenses/i)

    await user.clear(revenueInput)
    await user.type(revenueInput, '50000')
    await user.clear(expensesInput)
    await user.type(expensesInput, '60000')

    const completeButton = screen.getByRole('button', { name: /Complete Calculation/i })
    await user.click(completeButton)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows completed state after submission', async () => {
    const user = userEvent.setup()
    render(<ProfitCalculator activity={{}} />)

    const revenueInput = screen.getByLabelText(/Total Revenue/i)
    const expensesInput = screen.getByLabelText(/Total Expenses/i)

    await user.clear(revenueInput)
    await user.type(revenueInput, '100000')
    await user.clear(expensesInput)
    await user.type(expensesInput, '75000')

    const completeButton = screen.getByRole('button', { name: /Complete Calculation/i })
    await user.click(completeButton)

    expect(screen.getByText(/Calculation complete!/i)).toBeInTheDocument()
    expect(completeButton).toBeDisabled()
  })

  it('prevents double-submit on rapid clicks', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProfitCalculator activity={{}} onSubmit={onSubmit} />)

    const revenueInput = screen.getByLabelText(/Total Revenue/i)
    const expensesInput = screen.getByLabelText(/Total Expenses/i)

    await user.clear(revenueInput)
    await user.type(revenueInput, '100000')
    await user.clear(expensesInput)
    await user.type(expensesInput, '75000')

    const completeButton = screen.getByRole('button', { name: /Complete Calculation/i })

    await user.click(completeButton)
    await user.click(completeButton)
    await user.click(completeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
