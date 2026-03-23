import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildCvpAnalysisReviewFeedback,
  cvpAnalysisFamily,
  type CvpAnalysisDefinition,
  type CvpAnalysisResponse,
} from '@/lib/practice/engine/families/cvp-analysis';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('cvp analysis family', () => {
  it('generates deterministic CVP scenarios across all variant kinds', () => {
    const family: ProblemFamily<
      CvpAnalysisDefinition,
      CvpAnalysisResponse,
      Parameters<typeof cvpAnalysisFamily.generate>[1]
    > = cvpAnalysisFamily;

    for (const variant of ['break-even-units', 'break-even-dollars', 'contribution-margin-ratio', 'target-profit-units'] as const) {
      for (let seed = 1; seed <= 3; seed += 1) {
        const config = { mode: 'guided_practice' as const, variant };
        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('cvp-analysis');
        expect(definition.variant).toBe(variant);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.scenario.sellingPricePerUnit).toBeGreaterThan(0);
        expect(definition.scenario.variableCostPerUnit).toBeGreaterThan(0);
        expect(definition.scenario.fixedCosts).toBeGreaterThan(0);
      }
    }
  });

  it('solves and grades correctly, and round-trips the envelope', () => {
    const definition = cvpAnalysisFamily.generate(2026, {
      mode: 'assessment',
      variant: 'break-even-units',
      tolerance: 1,
    });

    const solution = cvpAnalysisFamily.solve(definition);
    const grade = cvpAnalysisFamily.grade(definition, solution);
    expect(grade.score).toBe(grade.maxScore);

    // Wrong answer should score less
    const wrongResponse: CvpAnalysisResponse = { ...solution };
    const firstKey = Object.keys(wrongResponse)[0];
    wrongResponse[firstKey] = (wrongResponse[firstKey] ?? 0) + 999;
    const wrongGrade = cvpAnalysisFamily.grade(definition, wrongResponse);
    expect(wrongGrade.score).toBeLessThan(wrongGrade.maxScore);

    const reviewed = buildCvpAnalysisReviewFeedback(definition, wrongResponse, wrongGrade);
    expect(reviewed[firstKey]).toMatchObject({ status: 'incorrect' });

    const envelope = cvpAnalysisFamily.toEnvelope(definition, solution, grade);
    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
  });

  it('generates target-profit variant with a target profit field', () => {
    const definition = cvpAnalysisFamily.generate(42, {
      mode: 'guided_practice',
      variant: 'target-profit-units',
    });

    expect(definition.scenario.targetProfit).toBeGreaterThan(0);
    expect(definition.parts.some((p) => p.id === 'target-profit-units')).toBe(true);
  });
});
