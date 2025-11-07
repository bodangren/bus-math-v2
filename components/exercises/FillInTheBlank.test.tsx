import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FillInTheBlank, type FillInTheBlankActivity } from './FillInTheBlank'
import type { FillInTheBlankActivityProps } from '@/lib/db/schema/activities'

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
        activityId: 'activity-fill',
        score: 100
      })
    )
  })
})
