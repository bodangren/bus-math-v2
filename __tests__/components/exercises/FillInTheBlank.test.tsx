import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  FILL_IN_THE_BLANK_SUPPORTED_MODES,
  FillInTheBlank,
  type FillInTheBlankActivity,
} from '../../../components/activities/quiz/FillInTheBlank'
import type { FillInTheBlankActivityProps } from '@/types/activities'

const buildActivity = (overrides: Partial<FillInTheBlankActivityProps> = {}): FillInTheBlankActivity => ({
  id: 'activity-fill',
  componentKey: 'fill-in-the-blank',
  displayName: 'Equation Practice',
  description: 'Fill the blanks',
  props: {
    title: 'Accounting Fundamentals',
    description: 'Complete each equation.',
    showHints: false,
    showWordList: false,
    randomizeWordOrder: false,
    sentences: [
      {
        id: 's1',
        text: 'Assets = {blank} + Equity',
        answer: 'Liabilities'
      }
    ],
    ...overrides
  },
  gradingConfig: null,
  standardId: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('FillInTheBlank', () => {
  it('validates answers and triggers submit callback', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FillInTheBlank activity={buildActivity()} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/type your answer/i), 'Liabilities')
    await user.click(screen.getByRole('button', { name: /check answers/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        contractVersion: 'practice.v1',
        activityId: 'activity-fill',
        mode: 'independent_practice',
        status: 'submitted',
        answers: {
          s1: 'Liabilities',
        },
        parts: expect.arrayContaining([
          expect.objectContaining({
            partId: 's1',
            rawAnswer: 'Liabilities',
            isCorrect: true,
            score: 1,
            maxScore: 1,
          }),
        ]),
      })
    )
  })

  it('uses guided practice mode when scaffolding is present', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const activity = buildActivity({ showWordList: true })

    render(<FillInTheBlank activity={activity} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/type your answer/i), 'Liabilities')
    await user.click(screen.getByRole('button', { name: /check answers/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'guided_practice',
      })
    )
  })

  it('keeps word bank ordering stable when randomizeWordOrder is enabled', () => {
    const wordListActivity = buildActivity({
      showWordList: true,
      randomizeWordOrder: true,
      sentences: [
        { id: 's1', text: 'Assets = {blank} + Equity', answer: 'Liabilities' },
        { id: 's2', text: 'CVP means Cost-Volume-{blank}', answer: 'Profit' },
        { id: 's3', text: '{blank} analysis compares outcomes', answer: 'Scenario' },
      ],
    })

    const { rerender } = render(<FillInTheBlank activity={wordListActivity} />)
    const initialOrder = screen
      .getAllByText(/Liabilities|Profit|Scenario/)
      .map((node) => node.textContent)

    rerender(<FillInTheBlank activity={wordListActivity} />)
    const rerenderOrder = screen
      .getAllByText(/Liabilities|Profit|Scenario/)
      .map((node) => node.textContent)

    expect(rerenderOrder).toEqual(initialOrder)
  })

  it('declares the supported practice modes for the family', () => {
    expect(FILL_IN_THE_BLANK_SUPPORTED_MODES).toEqual([
      'guided_practice',
      'independent_practice',
      'assessment',
    ])
  })
})
