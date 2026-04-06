import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BudgetBalancer, type BudgetBalancerActivity, type BudgetBalancerState } from '../../../components/activities/simulations/BudgetBalancer'
import type { BudgetBalancerActivityProps } from '@/types/activities'

const defaultBudgetProps: BudgetBalancerActivityProps = {
  title: 'Budget Balancer',
  description: 'Learn to balance income and expenses each month.',
  expenses: [
    { id: 'rent', label: 'Rent', required: true, defaultAmount: 1200, icon: 'home', color: 'bg-blue-500' },
    { id: 'utilities', label: 'Utilities', required: true, defaultAmount: 300, icon: 'zap', color: 'bg-yellow-500' },
    { id: 'groceries', label: 'Groceries', required: true, defaultAmount: 400, icon: 'shopping-cart', color: 'bg-green-500' },
    { id: 'transportation', label: 'Transportation', required: true, defaultAmount: 200, icon: 'car', color: 'bg-purple-500' },
    { id: 'entertainment', label: 'Entertainment', required: false, defaultAmount: 0, icon: 'coffee', color: 'bg-pink-500' }
  ],
  savingsConfig: {
    emergencyFundContributionRate: 0.1,
    healthScoreBase: 50,
    savingsMultiplier: 50,
    emergencyMultiplier: 25
  },
  initialState: {
    monthlyIncome: 5000,
    month: 1,
    totalSavings: 1000,
    emergencyFund: 500,
    financialHealth: 100
  }
}

const buildActivity = (overrides: Partial<BudgetBalancerActivityProps> = {}): BudgetBalancerActivity => {
  const props: BudgetBalancerActivityProps = {
    ...defaultBudgetProps,
    ...overrides,
    expenses: overrides.expenses ?? defaultBudgetProps.expenses,
    savingsConfig: overrides.savingsConfig ?? defaultBudgetProps.savingsConfig,
    initialState: {
      ...defaultBudgetProps.initialState,
      ...(overrides.initialState ?? {})
    }
  }

  return {
    id: 'activity-budget',
    componentKey: 'budget-balancer',
    displayName: 'Budget Balancer',
    description: 'Plan monthly finances.',
    props,
    gradingConfig: null,
    standardId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

describe('BudgetBalancer', () => {
  it('shows income from persisted state overrides', async () => {
    const activity = buildActivity()
    const initialState: Partial<BudgetBalancerState> = {
      monthlyIncome: 6500
    }

    render(<BudgetBalancer activity={activity} initialState={initialState} />)

    expect(await screen.findByText('$6,500')).toBeInTheDocument()
  })

  it('emits a practice.v1 envelope on Submit Results', async () => {
    const onSubmit = vi.fn()
    const activity = buildActivity({
      initialState: {
        monthlyIncome: 5000,
        month: 2,
        totalSavings: 5000,
        emergencyFund: 500,
        financialHealth: 80
      }
    })

    render(<BudgetBalancer activity={activity} onSubmit={onSubmit} />)

    const submitButton = await screen.findByRole('button', { name: /submit results/i })
    await userEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('artifact.kind', 'budget_balancer')
    expect(envelope).toHaveProperty('activityId', 'activity-budget')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
    expect(envelope).toHaveProperty('status', 'submitted')
    expect(envelope.parts.length).toBeGreaterThan(0)
  })

  it('applies expense updates and calls onStateChange', async () => {
    const onStateChange = vi.fn()
    const activity = buildActivity()

    render(<BudgetBalancer activity={activity} onStateChange={onStateChange} />)

    await waitFor(() => expect(onStateChange).toHaveBeenCalled())

    const inputs = await screen.findAllByRole('spinbutton')
    const updateButtons = await screen.findAllByRole('button', { name: /update/i })
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '1500')
    await userEvent.click(updateButtons[0])

    await waitFor(() => expect(onStateChange.mock.calls.at(-1)?.[0].expenses.rent.amount).toBe(1500))
  })

  it('only calls onSubmit once on rapid double-click of submit button', async () => {
    const onSubmit = vi.fn()
    const activity = buildActivity({
      initialState: {
        monthlyIncome: 5000,
        month: 2,
        totalSavings: 5000,
        emergencyFund: 500,
        financialHealth: 80
      }
    })

    render(<BudgetBalancer activity={activity} onSubmit={onSubmit} />)

    const submitButton = await screen.findByRole('button', { name: /submit results/i })

    // Rapidly fire two click events (simulates double-click before re-render)
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
