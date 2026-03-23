import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildInterestSchedulesReviewFeedback,
  interestSchedulesFamily,
  type InterestSchedulesDefinition,
  type InterestSchedulesResponse,
} from '@/lib/practice/engine/families/interest-schedules';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('interest schedules family', () => {
  it('generates deterministic interest scenarios across all variants', () => {
    const family: ProblemFamily<
      InterestSchedulesDefinition,
      InterestSchedulesResponse,
      Parameters<typeof interestSchedulesFamily.generate>[1]
    > = interestSchedulesFamily;

    for (const variant of ['simple-interest', 'compound-interest', 'loan-amortization'] as const) {
      for (let seed = 1; seed <= 3; seed += 1) {
        const config = { mode: 'guided_practice' as const, variant };
        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('interest-schedules');
        expect(definition.variant).toBe(variant);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.scenario.principal).toBeGreaterThan(0);
        expect(definition.scenario.annualRate).toBeGreaterThan(0);
      }
    }
  });

  it('solves and grades correctly, and round-trips the envelope', () => {
    const definition = interestSchedulesFamily.generate(2026, {
      mode: 'assessment',
      variant: 'simple-interest',
      tolerance: 1,
    });

    const solution = interestSchedulesFamily.solve(definition);
    const grade = interestSchedulesFamily.grade(definition, solution);
    expect(grade.score).toBe(grade.maxScore);

    // Wrong answer
    const wrongResponse: InterestSchedulesResponse = { ...solution };
    const firstKey = Object.keys(wrongResponse)[0];
    wrongResponse[firstKey] = (wrongResponse[firstKey] ?? 0) + 500;
    const wrongGrade = interestSchedulesFamily.grade(definition, wrongResponse);
    expect(wrongGrade.score).toBeLessThan(wrongGrade.maxScore);

    const reviewed = buildInterestSchedulesReviewFeedback(definition, wrongResponse, wrongGrade);
    expect(reviewed[firstKey]).toMatchObject({ status: 'incorrect' });

    const envelope = interestSchedulesFamily.toEnvelope(definition, solution, grade);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it('compound interest produces a larger total than simple interest for the same scenario', () => {
    const simpleDef = interestSchedulesFamily.generate(42, { variant: 'simple-interest' });
    const compoundDef = interestSchedulesFamily.generate(42, { variant: 'compound-interest' });

    const simpleSolution = interestSchedulesFamily.solve(simpleDef);
    const compoundSolution = interestSchedulesFamily.solve(compoundDef);

    const simpleTotal = simpleSolution['total-interest'] ?? simpleSolution['interest'] ?? 0;
    const compoundTotal = compoundSolution['total-amount'] ?? 0;
    const compoundPrincipal = compoundDef.scenario.principal;

    // Compound total (principal + interest) should exceed simple interest + principal
    expect(compoundTotal).toBeGreaterThan(compoundPrincipal + simpleTotal);
  });
});
