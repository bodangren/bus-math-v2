import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetWorksheet } from '@/components/activities/exercises/BudgetWorksheet'
import { expect, vi } from 'vitest'

describe('BudgetWorksheet', () => {
  it('renders without crashing', () => {
    render(<BudgetWorksheet activity={{}} />)
    expect(screen.getByText(/Budget Worksheet/i)).toBeInTheDocument()
  })

  it('calls onSubmit with correct envelope when budget is complete', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BudgetWorksheet activity={{ id: 'budget-test' }} onSubmit={onSubmit} />)

    const marketingInput = screen.getByLabelText(/Marketing/i)
    const salariesInput = screen.getByLabelText(/Salaries/i)

    await user.clear(marketingInput)
    await user.type(marketingInput, '30000')
    await user.clear(salariesInput)
    await user.type(salariesInput, '50000')

    const completeButton = screen.getByRole('button', { name: /Complete Budget/i })
    await user.click(completeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope.contractVersion).toBe('practice.v1')
    expect(envelope.activityId).toBe('budget-test')
    expect(envelope.status).toBe('submitted')
    expect(envelope.answers.totalAllocated).toBe(80000)
    expect(envelope.answers.remaining).toBe(20000)
    expect(envelope.answers.isOverBudget).toBe(false)
  })

  it('calls onComplete after successful submission', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<BudgetWorksheet activity={{}} onComplete={onComplete} />)

    const marketingInput = screen.getByLabelText(/Marketing/i)
    await user.clear(marketingInput)
    await user.type(marketingInput, '100000')

    const completeButton = screen.getByRole('button', { name: /Complete Budget/i })
    await user.click(completeButton)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows over-budget warning when allocations exceed total', async () => {
    const user = userEvent.setup()
    render(<BudgetWorksheet activity={{}} />)

    const marketingInput = screen.getByLabelText(/Marketing/i)
    await user.clear(marketingInput)
    await user.type(marketingInput, '150000')

    expect(screen.getByText(/You are over budget/i)).toBeInTheDocument()
  })

  it('prevents double-submit on rapid clicks', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<BudgetWorksheet activity={{}} onSubmit={onSubmit} />)

    const marketingInput = screen.getByLabelText(/Marketing/i)
    await user.clear(marketingInput)
    await user.type(marketingInput, '50000')

    const completeButton = screen.getByRole('button', { name: /Complete Budget/i })

    await user.click(completeButton)
    await user.click(completeButton)
    await user.click(completeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
