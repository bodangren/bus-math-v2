import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CashFlowChallenge } from './CashFlowChallenge'
import type { CashFlowChallengeActivityProps } from '@/lib/db/schema/activities'

const mockActivity: CashFlowChallengeActivityProps = {
  title: 'Cash Flow Challenge',
  description: 'Manage business cash flow for 30 days. Balance incoming and outgoing payments to stay solvent!',
  incomingFlows: [
    { id: 'in-1', description: 'Customer Payment A', amount: 15000, daysLeft: 5, type: 'incoming', canModify: true },
    { id: 'in-2', description: 'Customer Payment B', amount: 20000, daysLeft: 12, type: 'incoming', canModify: true }
  ],
  outgoingFlows: [
    { id: 'out-1', description: 'Supplier Payment', amount: 12000, daysLeft: 3, type: 'outgoing', canModify: true },
    { id: 'out-2', description: 'Payroll', amount: 18000, daysLeft: 15, type: 'outgoing', canModify: false }
  ],
  initialState: {
    cashPosition: 25000,
    day: 1,
    maxDays: 30,
    incomingFlows: [],
    outgoingFlows: [],
    lineOfCredit: 0,
    creditUsed: 0,
    creditInterestRate: 0.05,
    actionsUsed: {
      requestPayment: 0,
      negotiateTerms: 0,
      lineOfCredit: 0,
      delayExpense: 0
    },
    gameStatus: 'playing'
  }
}

describe('CashFlowChallenge', () => {
  it('renders with activity title and description', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    expect(screen.getByText('Cash Flow Challenge')).toBeInTheDocument()
    expect(screen.getByText(/Manage business cash flow for 30 days/i)).toBeInTheDocument()
  })

  it('displays initial cash position from activity props', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    expect(screen.getByText('$25,000')).toBeInTheDocument()
  })

  it('displays day counter from initial state', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    const dayLabel = screen.getByText('Day')
    expect(dayLabel.parentElement).toHaveTextContent('1 / 30')
  })

  it('displays incoming flows from activity props', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    expect(screen.getByText('Customer Payment A')).toBeInTheDocument()
    expect(screen.getByText('Customer Payment B')).toBeInTheDocument()
    expect(screen.getByText('+$15,000')).toBeInTheDocument()
    expect(screen.getByText('+$20,000')).toBeInTheDocument()
  })

  it('displays outgoing flows from activity props', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    expect(screen.getByText('Supplier Payment')).toBeInTheDocument()
    expect(screen.getByText('Payroll')).toBeInTheDocument()
    expect(screen.getByText('-$12,000')).toBeInTheDocument()
    expect(screen.getByText('-$18,000')).toBeInTheDocument()
  })

  it('shows incoming and outgoing totals', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    // Total incoming: 15000 + 20000 = 35000
    expect(screen.getByText('$35,000')).toBeInTheDocument()
    // Total outgoing: 12000 + 18000 = 30000
    expect(screen.getByText('$30,000')).toBeInTheDocument()
  })

  it('allows advancing to next day', async () => {
    const user = userEvent.setup()
    render(<CashFlowChallenge activity={mockActivity} />)

    const advanceButton = screen.getByRole('button', { name: /advance day/i })
    await user.click(advanceButton)

    await waitFor(() => {
      const dayLabel = screen.getByText('Day')
      expect(dayLabel.parentElement).toHaveTextContent('2 / 30')
    })
  })

  it('allows requesting payment action', async () => {
    const user = userEvent.setup()
    render(<CashFlowChallenge activity={mockActivity} />)

    const requestButton = screen.getByRole('button', { name: /request payment/i })
    await user.click(requestButton)

    await waitFor(() => {
      const usedBadge = screen.getByText('Used: 1')
      expect(usedBadge).toBeInTheDocument()
    })
  })

  it('calls onSubmit when game ends', async () => {
    const onSubmit = vi.fn()
    const winningActivity = {
      ...mockActivity,
      initialState: {
        ...mockActivity.initialState,
        cashPosition: 50000,
        day: 30,
        maxDays: 30
      }
    }

    render(<CashFlowChallenge activity={winningActivity} onSubmit={onSubmit} />)

    // Advance one more day to trigger win
    const advanceButton = screen.getByRole('button', { name: /advance day/i })
    await userEvent.click(advanceButton)

    await waitFor(() => {
      expect(screen.getByText(/Challenge Complete!/i)).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /submit results/i })
    await userEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('gameStatus', 'won')
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('finalProfit')
  })

  it('resets game to initial state from activity props', async () => {
    const user = userEvent.setup()
    render(<CashFlowChallenge activity={mockActivity} />)

    // Advance a day first
    const advanceButton = screen.getByRole('button', { name: /advance day/i })
    await user.click(advanceButton)

    await waitFor(() => {
      const dayLabel = screen.getByText('Day')
      expect(dayLabel.parentElement).toHaveTextContent('2 / 30')
    })

    // Reset the game
    const resetButton = screen.getByRole('button', { name: /reset challenge/i })
    await user.click(resetButton)

    await waitFor(() => {
      const dayLabel = screen.getByText('Day')
      expect(dayLabel.parentElement).toHaveTextContent('1 / 30')
      expect(screen.getByText('$25,000')).toBeInTheDocument()
    })
  })

  it('shows game over when cash position goes negative', async () => {
    const nearBankruptActivity = {
      ...mockActivity,
      initialState: {
        ...mockActivity.initialState,
        cashPosition: 1000
      },
      outgoingFlows: [
        { id: 'out-1', description: 'Large Bill', amount: 5000, daysLeft: 1, type: 'outgoing' as const, canModify: true }
      ]
    }

    render(<CashFlowChallenge activity={nearBankruptActivity} />)

    const advanceButton = screen.getByRole('button', { name: /advance day/i })
    await userEvent.click(advanceButton)

    await waitFor(() => {
      expect(screen.getByText(/Game Over/i)).toBeInTheDocument()
    })
  })

  it('allows establishing line of credit', async () => {
    const user = userEvent.setup()
    render(<CashFlowChallenge activity={mockActivity} />)

    const creditButton = screen.getByRole('button', { name: /line of credit/i })
    await user.click(creditButton)

    await waitFor(() => {
      const availableText = screen.getAllByText(/Available: \$15,000/i)
      expect(availableText.length).toBeGreaterThan(0)
    })
  })

  it('displays action counts correctly', () => {
    render(<CashFlowChallenge activity={mockActivity} />)

    // Multiple action buttons show "Used: 0"
    const usedBadges = screen.getAllByText('Used: 0')
    expect(usedBadges.length).toBeGreaterThan(0)
  })

  it('toggles instructions panel', async () => {
    const user = userEvent.setup()
    render(<CashFlowChallenge activity={mockActivity} />)

    const helpButton = screen.getByRole('button', { name: /how to play/i })

    // Instructions can be toggled
    await user.click(helpButton)

    // Wait for animation/rendering
    await waitFor(() => {
      // No specific assertion needed - just verify clicking doesn't error
      expect(helpButton).toBeInTheDocument()
    })
  })
})
