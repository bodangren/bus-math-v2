import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CapitalNegotiation } from '../../../components/activities/simulations/CapitalNegotiation'

const mockActivity = {
  id: 'capital-negotiation-test',
  title: 'The Capital Negotiation',
  description: 'Choose between debt and equity financing',
  props: {
    options: [
      {
        id: 'bank-loan',
        name: 'Bank Loan',
        type: 'debt' as const,
        monthlyImpact: 'Pay $500/month in interest',
        longTermImpact: 'Sarah keeps 100% equity',
        terms: [
          { label: 'Interest Rate', value: '6%', isPro: false },
          { label: 'Term Length', value: '3 years', isPro: true },
          { label: 'Collateral', value: 'Equipment', isPro: false },
          { label: 'Monthly Payment', value: '$500', isPro: false },
        ],
      },
      {
        id: 'angel-investor',
        name: 'Angel Investor',
        type: 'equity' as const,
        monthlyImpact: 'No monthly payments',
        longTermImpact: 'Sarah shares 20% profits',
        terms: [
          { label: 'Equity Share', value: '20%', isPro: false },
          { label: 'Mentorship', value: 'Included', isPro: true },
          { label: 'Board Seat', value: '1 seat', isPro: false },
        ],
      },
    ],
  },
}

describe('CapitalNegotiation', () => {
  it('renders with activity title', () => {
    render(<CapitalNegotiation activity={mockActivity} />)

    expect(screen.getByText('The Capital Negotiation')).toBeInTheDocument()
  })

  it('emits a practice.v1 envelope when deal is signed', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<CapitalNegotiation activity={mockActivity} onSubmit={onSubmit} />)

    // Select Bank Loan (first "Negotiate This Deal" button)
    const negotiateButtons = screen.getAllByRole('button', { name: /negotiate this deal/i })
    await user.click(negotiateButtons[0])

    // Reveal at least 3 terms
    await waitFor(() => {
      expect(screen.getByText('Interest Rate')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Interest Rate'))
    await user.click(screen.getByText('Term Length'))
    await user.click(screen.getByText('Collateral'))

    // Sign the deal
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign this deal/i })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: /sign this deal/i }))

    // Verify completion
    await waitFor(() => {
      expect(screen.getByText('OFFICE FUNDED!')).toBeInTheDocument()
    })

    expect(onSubmit).toHaveBeenCalled()
    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope).toHaveProperty('contractVersion', 'practice.v1')
    expect(envelope).toHaveProperty('artifact.kind', 'capital_negotiation')
    expect(envelope).toHaveProperty('activityId', 'capital-negotiation-test')
    expect(envelope).toHaveProperty('mode', 'guided_practice')
  })
})
