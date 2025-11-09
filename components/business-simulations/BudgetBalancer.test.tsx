import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BudgetBalancer, type BudgetBalancerActivity, type BudgetBalancerState } from './BudgetBalancer'
import type { BudgetBalancerActivityProps } from '@/lib/db/schema/activities'

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
})
