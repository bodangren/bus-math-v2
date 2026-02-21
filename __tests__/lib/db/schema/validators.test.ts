import { describe, expect, it } from 'vitest';

import { selectActivitySchema } from '@/lib/db/schema/validators';

const baseActivityRow = {
  id: 'a1b2c3d4-e5f6-4789-abcd-ef0123456789',
  componentKey: 'comprehension-quiz',
  displayName: 'Test Activity',
  description: 'A test activity',
  standardId: null,
  gradingConfig: { autoGrade: true, passingScore: 70, partialCredit: false },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const comprehensionProps = {
  title: 'Knowledge Check',
  description: 'Two question quiz',
  showExplanations: false,
  allowRetry: true,
  questions: [
    {
      id: 'q1',
      text: 'What is revenue minus expenses?',
      type: 'multiple-choice',
      options: ['Net Income', 'Assets'],
      correctAnswer: 'Net Income',
    },
  ],
};

describe('selectActivitySchema', () => {
  it('accepts a comprehension-quiz activity', () => {
    const result = selectActivitySchema.safeParse({
      ...baseActivityRow,
      componentKey: 'comprehension-quiz',
      props: comprehensionProps,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a tiered-assessment activity with a numeric correctAnswer', () => {
    const result = selectActivitySchema.safeParse({
      ...baseActivityRow,
      componentKey: 'tiered-assessment',
      props: {
        ...comprehensionProps,
        tier: 'knowledge',
        questions: [
          {
            id: 'q1',
            text: 'How many units break even at $500 fixed costs and $5 margin?',
            type: 'numeric-entry',
            correctAnswer: 100,
            tier: 'application',
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    // After parsing, the numeric correctAnswer must be preserved so scoring can use it
    if (result.success) {
      const questions = (result.data.props as { questions: unknown[] }).questions;
      expect((questions[0] as { correctAnswer: unknown }).correctAnswer).toBe(100);
    }
  });
});
