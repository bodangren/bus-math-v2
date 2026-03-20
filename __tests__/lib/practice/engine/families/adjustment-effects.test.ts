import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  adjustmentEffectsFamily,
  buildAdjustmentEffectsReviewFeedback,
  type AdjustmentEffectsDefinition,
  type AdjustmentEffectsResponse,
} from '@/lib/practice/engine/families/adjustment-effects';
import type { ProblemFamily } from '@/lib/practice/engine/types';

function pickAlternateEffect(effect: AdjustmentEffectsResponse[keyof AdjustmentEffectsResponse]) {
  const options = ['overstated', 'understated', 'no-effect'] as const;
  return options.find((candidate) => candidate !== effect) ?? effect;
}

describe('adjustment effects family', () => {
  it('generates deterministic omission scenarios across seeds', () => {
    const family: ProblemFamily<
      AdjustmentEffectsDefinition,
      AdjustmentEffectsResponse,
      Parameters<typeof adjustmentEffectsFamily.generate>[1]
    > = adjustmentEffectsFamily;

    for (let seed = 1; seed <= 10; seed += 1) {
      const definition = family.generate(seed, {
        mode: 'guided_practice',
      });
      const repeat = family.generate(seed, {
        mode: 'guided_practice',
      });

      expect(definition).toEqual(repeat);
      expect(definition.parts).toHaveLength(6);
      expect(definition.columns).toHaveLength(3);
      expect(definition.rows.map((row) => row.id)).toEqual([
        'revenue',
        'expense',
        'net-income',
        'assets',
        'liabilities',
        'equity',
      ]);
      expect(definition.scenario.scenario).toContain('$');
      expect(definition.scenario.missedAdjustment).toContain('$');
    }
  });

  it('scores omitted-adjustment matrices and round-trips the submission envelope', () => {
    const definition = adjustmentEffectsFamily.generate(2026, {
      mode: 'assessment',
      scenarioKind: 'depreciation',
    });

    const solution = adjustmentEffectsFamily.solve(definition);
    const studentResponse: AdjustmentEffectsResponse = {
      ...solution,
      revenue: pickAlternateEffect(solution.revenue),
      assets: pickAlternateEffect(solution.assets),
    };

    const gradeResult = adjustmentEffectsFamily.grade(definition, studentResponse);
    const reviewed = buildAdjustmentEffectsReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = adjustmentEffectsFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(gradeResult.parts.some((part) => part.isCorrect)).toBe(true);
    expect(reviewed.revenue).toMatchObject({
      status: 'incorrect',
      expectedLabel: 'No effect',
      selectedLabel: expect.any(String),
    });
    expect(reviewed.expense?.message).toContain('depreciation');

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected adjustment-effects envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.artifact).toMatchObject({
      kind: 'adjustment-effects-grid',
      family: 'adjustment-effects',
      scenario: {
        kind: 'depreciation',
      },
    });
  });
});
