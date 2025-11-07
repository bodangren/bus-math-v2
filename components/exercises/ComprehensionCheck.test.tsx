import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ComprehensionCheck, type ComprehensionCheckActivity } from './ComprehensionCheck'
import type { ComprehensionQuizActivityProps } from '@/lib/db/schema/activities'

const buildActivity = (overrides: Partial<ComprehensionQuizActivityProps> = {}): ComprehensionCheckActivity => ({
  id: 'activity-quiz',
  componentKey: 'comprehension-quiz',
  displayName: 'Knowledge Check',
  description: 'Verify understanding',
  props: {
    title: 'Quick Quiz',
    description: 'Answer a few questions.',
    allowRetry: true,
    showExplanations: true,
    questions: [
      {
        id: 'q1',
        text: 'What is revenue minus expenses?',
        type: 'multiple-choice',
        options: ['Net Income', 'Assets', 'Liabilities'],
        correctAnswer: 'Net Income',
        explanation: 'Net income measures profitability.'
      },
      {
        id: 'q2',
        text: 'True or false: Assets = Liabilities + Equity.',
        type: 'true-false',
        correctAnswer: 'True',
        explanation: 'This is the fundamental accounting equation.'
      }
    ],
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('ComprehensionCheck', () => {
  it('submits answers and reports score', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ComprehensionCheck activity={buildActivity()} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /Net Income/i }))
    await user.click(screen.getByRole('button', { name: /True/i }))
    await user.click(screen.getByRole('button', { name: /Submit answers/i }))

    expect(await screen.findByText(/2\/2 correct/i)).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-quiz',
        score: 2,
        totalQuestions: 2
      })
    )
  })
})
