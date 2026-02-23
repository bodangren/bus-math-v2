import { describe, expect, it } from 'vitest';

import { calculateScore } from '@/lib/assessments/scoring';
import { generateProblemInstance } from '@/lib/curriculum/problem-generator';
import type { Activity } from '@/lib/db/schema/validators';

const baseTieredActivity: Activity = {
  id: '11111111-1111-4111-8111-111111111111',
  componentKey: 'tiered-assessment',
  displayName: 'Tiered Assessment',
  description: 'Assessment with questions and application problems',
  props: {
    tier: 'application',
    title: 'Application Tier',
    description: 'Complete both sections',
    showExplanations: false,
    allowRetry: true,
    questions: [
      {
        id: 'q1',
        text: 'Assets = Liabilities + Equity is the accounting equation.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 'True',
      },
    ],
    applicationProblems: [
      {
        id: 'ap-1',
        standardCode: 'ACC-1.1',
        prompt: 'Compute equity from generated assets and liabilities.',
        problemTemplate: {
          parameters: {
            assets: { min: 10000, max: 12000, step: 100 },
            liabilities: { min: 3000, max: 5000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate: 'Assets {{assets}}, liabilities {{liabilities}}. Equity?',
          tolerance: 1,
        },
      },
    ],
  },
  gradingConfig: {
    autoGrade: true,
    passingScore: 70,
    partialCredit: false,
  },
  createdAt: new Date('2026-02-23T00:00:00.000Z'),
  updatedAt: new Date('2026-02-23T00:00:00.000Z'),
};

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

describe('calculateScore', () => {
  it('scores tiered-assessment application problems and includes them in maxScore', () => {
    const problem = baseTieredActivity.props.applicationProblems?.[0];
    expect(problem).toBeDefined();

    const expected = generateProblemInstance(
      problem!.problemTemplate,
      stableHash(`${baseTieredActivity.id}:${problem!.id}`),
    ).correctAnswer;

    const result = calculateScore(baseTieredActivity, {
      q1: 'true',
      'ap-1': String(expected),
    });

    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
    expect(result.percentage).toBe(100);
  });

  it('does not allow skipping application problems without score impact', () => {
    const result = calculateScore(baseTieredActivity, {
      q1: 'true',
    });

    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(2);
    expect(result.percentage).toBe(50);
  });
});
