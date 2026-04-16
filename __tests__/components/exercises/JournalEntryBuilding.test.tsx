import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { JournalEntryActivity as JournalEntryBuilding } from '../../../components/activities/accounting/JournalEntryActivity'
import type { JournalEntryActivityProps } from '@/types/activities'
import type { JournalEntryActivityData as JournalEntryActivity } from '../../../components/activities/accounting/JournalEntryActivity'

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
  standardId: null,
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
          contractVersion: 'practice.v1',
          activityId: 'activity-journal',
          mode: 'independent_practice',
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: expect.any(String),
          answers: {
            Cash: {
              account: 'Cash',
              debit: 500,
              credit: 0
            },
            'Service Revenue': {
              account: 'Service Revenue',
              debit: 0,
              credit: 500
            }
          },
          parts: expect.arrayContaining([
            expect.objectContaining({
              partId: 'Cash',
              rawAnswer: expect.objectContaining({
                account: 'Cash',
                debit: 500,
                credit: 0
              }),
              isCorrect: true,
              score: 1,
              maxScore: 1
            }),
            expect.objectContaining({
              partId: 'Service Revenue',
              rawAnswer: expect.objectContaining({
                account: 'Service Revenue',
                debit: 0,
                credit: 500
              }),
              isCorrect: true,
              score: 1,
              maxScore: 1
            })
          ]),
          artifact: expect.objectContaining({
            kind: 'journal_entry',
            family: 'journal-entry-building',
            scenarioId: 'scenario-1',
            balanced: true,
            totals: expect.objectContaining({
              debits: 500,
              credits: 500
            })
          }),
          analytics: expect.objectContaining({
            scenarioId: 'scenario-1',
            lineCount: 2,
            totalDebits: 500,
            totalCredits: 500
          }),
          studentFeedback: expect.stringContaining('Cash increases with a debit')
        })
      )
    })
  }, 15_000)

  it('resets completed state when onSubmit throws', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => {
      throw new Error('Submission failed')
    })
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

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    // The "Next Scenario" button should NOT appear because completed was reset
    expect(screen.queryByRole('button', { name: /next scenario/i })).not.toBeInTheDocument()
  })
})
