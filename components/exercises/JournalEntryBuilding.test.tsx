import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { JournalEntryBuilding } from './JournalEntryBuilding'
import type { JournalEntryActivityProps } from '@/lib/db/schema/activities'
import type { JournalEntryActivity } from './JournalEntryBuilding'

const buildActivity = (overrides: Partial<JournalEntryActivityProps> = {}): JournalEntryActivity => ({
  id: 'activity-journal',
  componentKey: 'journal-entry-building',
  displayName: 'Journal Practice',
  description: 'Learn journal entries',
  props: {
    title: 'Journal Entry Builder',
    description: 'Record this transaction.',
    availableAccounts: ['Cash', 'Service Revenue'],
    showInstructionsDefaultOpen: false,
    scenarios: [
      {
        id: 'scenario-1',
        description: 'Received $500 cash for services rendered.',
        correctEntry: [
          { account: 'Cash', debit: 500, credit: 0 },
          { account: 'Service Revenue', debit: 0, credit: 500 }
        ],
        explanation: 'Cash increases with a debit and revenue increases with a credit.'
      }
    ],
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('JournalEntryBuilding', () => {
  it('validates scenario and notifies onSubmit when correct', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<JournalEntryBuilding activity={buildActivity()} onSubmit={onSubmit} />)

    const selectors = screen.getAllByLabelText(/Select account for row/i)
    await user.selectOptions(selectors[0], 'Cash')
    await user.selectOptions(selectors[1], 'Service Revenue')

    const amountInputs = screen.getAllByPlaceholderText('0.00')
    const debitInput = amountInputs[0]
    const creditInput = amountInputs[3]

    await user.clear(debitInput)
    await user.type(debitInput, '500')
    await user.clear(creditInput)
    await user.type(creditInput, '500')

    await screen.findAllByText('$500.00')

    await user.click(screen.getByRole('button', { name: /check entry/i }))

    const feedback = await screen.findByTestId('journal-feedback')
    expect(feedback.textContent).toMatch(/Perfect!/)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-journal',
          scenarioId: 'scenario-1'
        })
      )
    })
  })
})
