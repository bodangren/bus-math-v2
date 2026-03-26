import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildDepreciationSchedulesReviewFeedback,
  depreciationSchedulesFamily,
  type DepreciationSchedulesDefinition,
  type DepreciationSchedulesResponse,
} from '@/lib/practice/engine/families/depreciation-schedules';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('depreciation schedules family', () => {
  it('generates deterministic depreciation scenarios across all methods', () => {
    const family: ProblemFamily<
      DepreciationSchedulesDefinition,
      DepreciationSchedulesResponse,
      Parameters<typeof depreciationSchedulesFamily.generate>[1]
    > = depreciationSchedulesFamily;

    for (const method of ['straight-line', 'double-declining', 'units-of-production'] as const) {
      for (let seed = 1; seed <= 3; seed += 1) {
        const config = { mode: 'guided_practice' as const, method };
        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('depreciation-schedules');
        expect(definition.method).toBe(method);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.asset.cost).toBeGreaterThan(0);
        expect(definition.asset.usefulLifeYears).toBeGreaterThan(0);
      }
    }
  });

  it('solves and grades correctly, and round-trips the envelope', () => {
    const definition = depreciationSchedulesFamily.generate(2026, {
      mode: 'assessment',
      method: 'straight-line',
      tolerance: 1,
    });

    const solution = depreciationSchedulesFamily.solve(definition);
    const grade = depreciationSchedulesFamily.grade(definition, solution);
    expect(grade.score).toBe(grade.maxScore);

    // Wrong answer
    const wrongResponse: DepreciationSchedulesResponse = { ...solution };
    const firstKey = Object.keys(wrongResponse)[0];
    wrongResponse[firstKey] = (wrongResponse[firstKey] ?? 0) + 500;
    const wrongGrade = depreciationSchedulesFamily.grade(definition, wrongResponse);
    expect(wrongGrade.score).toBeLessThan(wrongGrade.maxScore);

    const reviewed = buildDepreciationSchedulesReviewFeedback(definition, wrongResponse, wrongGrade);
    expect(reviewed[firstKey]).toMatchObject({ status: 'incorrect' });
    const chainKey = definition.parts.find((part) => part.id === 'year-1-depreciation' || part.id === 'rate-per-unit')?.id ?? firstKey;
    expect(reviewed[chainKey].message).toContain('÷');

    const envelope = depreciationSchedulesFamily.toEnvelope(definition, solution, grade);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it('DDB year-1 depreciation is double the straight-line rate', () => {
    const def = depreciationSchedulesFamily.generate(99, { method: 'double-declining' });
    const solution = depreciationSchedulesFamily.solve(def);
    const year1Dep = solution['year-1-depreciation'] ?? 0;
    const slRate = 1 / def.asset.usefulLifeYears;
    const expectedDDB = Math.round(def.asset.cost * slRate * 2);
    expect(year1Dep).toBe(expectedDDB);
  });
});
