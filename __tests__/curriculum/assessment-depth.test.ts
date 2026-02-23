import { describe, expect, it } from 'vitest';

import { SUMMATIVE_LESSONS } from './unit1-fixtures';

describe('curriculum/assessment-depth', () => {
  it('summative has at least 3 tiered questions per linked standard', () => {
    const summative = SUMMATIVE_LESSONS[0];
    const standardCount = summative.standards.length;

    let totalTierQuestions = 0;
    for (const activity of summative.activities) {
      const questions = activity.props.questions;
      if (Array.isArray(questions)) {
        totalTierQuestions += questions.length;
      }
    }

    expect(totalTierQuestions).toBeGreaterThanOrEqual(standardCount * 3);
  });

  it('summative includes non-multiple-choice question types', () => {
    const summative = SUMMATIVE_LESSONS[0];
    const questionTypes = new Set<string>();

    for (const activity of summative.activities) {
      const questions = activity.props.questions;
      if (!Array.isArray(questions)) {
        continue;
      }

      for (const question of questions as Array<Record<string, unknown>>) {
        const type = question.type;
        if (typeof type === 'string') {
          questionTypes.add(type);
        }
      }
    }

    expect(Array.from(questionTypes).some((type) => type !== 'multiple-choice')).toBe(true);
  });

  it('summative has at least 1 application problem per linked standard', () => {
    const summative = SUMMATIVE_LESSONS[0];
    const standardCount = summative.standards.length;

    let totalApplicationProblems = 0;
    for (const activity of summative.activities) {
      const applicationProblems = activity.props.applicationProblems;
      if (Array.isArray(applicationProblems)) {
        totalApplicationProblems += applicationProblems.length;
      }
    }

    expect(totalApplicationProblems).toBeGreaterThanOrEqual(standardCount);
  });

  it('application problems include problemTemplate definitions', () => {
    const summative = SUMMATIVE_LESSONS[0];

    for (const activity of summative.activities) {
      const applicationProblems = activity.props.applicationProblems;
      if (!Array.isArray(applicationProblems)) {
        continue;
      }

      for (const problem of applicationProblems as Array<Record<string, unknown>>) {
        expect(problem.problemTemplate, `application problem ${String(problem.id)}`).toBeDefined();
      }
    }
  });
});
