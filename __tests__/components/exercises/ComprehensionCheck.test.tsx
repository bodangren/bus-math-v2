import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  COMPREHENSION_CHECK_SUPPORTED_MODES,
  ComprehensionCheck,
  type ComprehensionCheckActivity,
} from '../../../components/activities/quiz/ComprehensionCheck'
import type { ComprehensionQuizActivityProps } from '@/types/activities'

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
  standardId: null,
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
        contractVersion: 'practice.v1',
        activityId: 'activity-quiz',
        mode: 'assessment',
        status: 'submitted',
        answers: {
          q1: 'Net Income',
          q2: 'True',
        },
        parts: expect.arrayContaining([
          expect.objectContaining({
            partId: 'q1',
            rawAnswer: 'Net Income',
            isCorrect: true,
            score: 1,
            maxScore: 1,
          }),
          expect.objectContaining({
            partId: 'q2',
            rawAnswer: 'True',
            isCorrect: true,
            score: 1,
            maxScore: 1,
          }),
        ]),
      })
    )
  })

  it('accepts short-answer input and scores correctly', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const activity = buildActivity({
      questions: [
        {
          id: 'sa1',
          text: 'Define the accounting equation.',
          type: 'short-answer',
          correctAnswer: 'Assets = Liabilities + Equity',
          explanation: 'Basic accounting identity.'
        },
        {
          id: 'mc1',
          text: 'Which statement shows profit?',
          type: 'multiple-choice',
          options: ['Income Statement', 'Balance Sheet'],
          correctAnswer: 'Income Statement',
          explanation: 'Income statement reports revenue and expenses.'
        }
      ]
    })

    render(<ComprehensionCheck activity={activity} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/type your answer/i), 'assets = liabilities + equity')
    await user.click(screen.getByRole('button', { name: /income statement/i }))
    await user.click(screen.getByRole('button', { name: /submit answers/i }))

    expect(await screen.findByText(/2\/2 correct/i)).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        contractVersion: 'practice.v1',
        mode: 'assessment',
        status: 'submitted',
        answers: expect.objectContaining({
          sa1: 'assets = liabilities + equity',
          mc1: 'Income Statement',
        }),
      })
    )
  })

  it('does not crash when correctAnswer is a number (numeric-entry question)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const activity = buildActivity({
      questions: [
        {
          id: 'ne1',
          text: 'How many units are in the order?',
          type: 'numeric-entry',
          correctAnswer: 42,
          explanation: 'There are 42 units.'
        }
      ]
    })

    render(<ComprehensionCheck activity={activity} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/type your answer/i), '42')
    await user.click(screen.getByRole('button', { name: /submit answers/i }))

    expect(await screen.findByText(/1\/1 correct/i)).toBeInTheDocument()
  })

  it('does not crash when correctAnswer is a boolean true', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const activity = buildActivity({
      questions: [
        {
          id: 'tf1',
          text: 'Assets equal liabilities plus equity.',
          type: 'true-false',
          correctAnswer: true,
          explanation: 'Fundamental accounting equation.'
        }
      ]
    })

    render(<ComprehensionCheck activity={activity} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /^true$/i }))
    await user.click(screen.getByRole('button', { name: /submit answers/i }))

    // Should render score without throwing "trim is not a function"
    expect(await screen.findByText(/1\/1 correct/i)).toBeInTheDocument()
  })

  it('keeps multiple-choice option order stable across rerenders', () => {
    const activity = buildActivity({
      questions: [
        {
          id: 'stable-order',
          text: 'Pick the matching definition',
          type: 'multiple-choice',
          options: ['100% tests', '50% homework, 50% participation', '60% formative, 40% summative'],
          correctAnswer: '60% formative, 40% summative',
          explanation: 'Course grading split.'
        }
      ]
    })

    const { rerender } = render(<ComprehensionCheck activity={activity} />)

    const questionContainer = screen.getByText(/Pick the matching definition/i).closest('div')
    expect(questionContainer).not.toBeNull()
    const initialOptionLabels = within(questionContainer as HTMLElement)
      .getAllByRole('button')
      .map((button) => button.textContent?.trim())

    rerender(<ComprehensionCheck activity={activity} />)

    const rerenderedContainer = screen.getByText(/Pick the matching definition/i).closest('div')
    expect(rerenderedContainer).not.toBeNull()
    const rerenderedOptionLabels = within(rerenderedContainer as HTMLElement)
      .getAllByRole('button')
      .map((button) => button.textContent?.trim())

    expect(rerenderedOptionLabels).toEqual(initialOptionLabels)
  })

  it('declares the supported practice modes for the family', () => {
    expect(COMPREHENSION_CHECK_SUPPORTED_MODES).toEqual([
      'guided_practice',
      'independent_practice',
      'assessment',
    ])
  })

  it('resets submitted state when onSubmit throws', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => {
      throw new Error('Submission failed')
    })
    render(<ComprehensionCheck activity={buildActivity()} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /Net Income/i }))
    await user.click(screen.getByRole('button', { name: /True/i }))
    await user.click(screen.getByRole('button', { name: /Submit answers/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    // Submit button should be re-enabled because submitted was reset
    expect(screen.getByRole('button', { name: /Submit answers/i })).toBeInTheDocument()
  })
})
