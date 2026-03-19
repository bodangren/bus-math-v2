import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  TIERED_ASSESSMENT_SUPPORTED_MODES,
  TieredAssessment,
  type TieredAssessmentActivity,
} from '../../../components/activities/quiz/TieredAssessment'
import { generateProblemInstance } from '@/lib/curriculum/problem-generator'
import type { TieredAssessmentActivityProps } from '@/types/activities'

const applicationTemplate = {
  parameters: {
    units: {
      min: 2,
      max: 2,
      step: 1,
    },
  },
  answerFormula: 'units + 2',
  questionTemplate: 'How many units are there when {{units}} are increased by 2?',
  tolerance: 0,
}

const buildActivity = (
  overrides: Partial<TieredAssessmentActivityProps> = {},
): TieredAssessmentActivity => ({
  id: 'activity-tiered',
  componentKey: 'tiered-assessment',
  displayName: 'Tiered Check',
  description: 'Demonstrate mastery',
  props: {
    title: 'Mastery Check',
    description: 'Answer the question and solve the application problem.',
    tier: 'application',
    allowRetry: true,
    showExplanations: true,
    questions: [
      {
        id: 'q1',
        text: 'Is revenue an asset?',
        type: 'multiple-choice',
        options: ['Yes', 'No'],
        correctAnswer: 'No',
        explanation: 'Revenue is an income statement item.',
      },
    ],
    applicationProblems: [
      {
        id: 'ap1',
        prompt: 'Solve the application problem.',
        standardCode: 'ACC-1.0',
        problemTemplate: applicationTemplate,
      },
    ],
    ...overrides,
  },
  gradingConfig: null,
  standardId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('TieredAssessment', () => {
  it('emits a canonical practice envelope with question and application evidence', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const generated = generateProblemInstance(applicationTemplate, 123)

    render(<TieredAssessment activity={buildActivity()} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /no/i }))
    await user.type(screen.getByPlaceholderText(/enter your numeric answer/i), String(generated.correctAnswer))
    await user.click(screen.getByRole('button', { name: /submit answers/i }))

    expect(await screen.findByText(/2\/2 correct/i)).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        contractVersion: 'practice.v1',
        activityId: 'activity-tiered',
        mode: 'assessment',
        status: 'submitted',
        answers: expect.objectContaining({
          q1: 'No',
          ap1: String(generated.correctAnswer),
        }),
        parts: expect.arrayContaining([
          expect.objectContaining({
            partId: 'q1',
            rawAnswer: 'No',
            isCorrect: true,
          }),
          expect.objectContaining({
            partId: 'ap1',
            rawAnswer: String(generated.correctAnswer),
            isCorrect: true,
          }),
        ]),
      }),
    )
  })

  it('declares the supported practice modes for the family', () => {
    expect(TIERED_ASSESSMENT_SUPPORTED_MODES).toEqual(['assessment'])
  })
})
