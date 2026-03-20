import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildTrialBalanceErrorReviewFeedback,
  trialBalanceErrorFamily,
  type TrialBalanceErrorDefinition,
  type TrialBalanceErrorResponse,
} from '@/lib/practice/engine/families/trial-balance-errors';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('trial balance error analysis family', () => {
  it('deterministically generates multi-scenario problems across seeds', () => {
    const family: ProblemFamily<
      TrialBalanceErrorDefinition,
      TrialBalanceErrorResponse,
      Parameters<typeof trialBalanceErrorFamily.generate>[1]
    > = trialBalanceErrorFamily;

    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        mode: 'guided_practice' as const,
        scenarioCount: 4,
        includeBalancedScenarios: true,
      };

      const definition = family.generate(seed, config);
      const repeat = family.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('trial-balance-errors');
      expect(definition.scenarios).toHaveLength(4);
      expect(definition.parts).toHaveLength(12);
      expect(definition.columns.map((column) => column.id)).toEqual(['balanced', 'difference', 'larger-column']);
      expect(definition.scenarios.every((scenario) => scenario.rowId.startsWith('scenario-'))).toBe(true);
    }
  });

  it('scores scenario outcomes and round-trips the practice envelope', () => {
    const definition: TrialBalanceErrorDefinition = trialBalanceErrorFamily.generate(2026, {
      mode: 'assessment',
      scenarioCount: 3,
      includeBalancedScenarios: true,
    });

    const solution = trialBalanceErrorFamily.solve(definition);
    const firstScenario = definition.scenarios[0];
    const studentResponse: TrialBalanceErrorResponse = {
      ...solution,
      [`${firstScenario.rowId}:balanced`]: firstScenario.expectedBalanced === 'still-balances' ? 'out-of-balance' : 'still-balances',
      [`${firstScenario.rowId}:difference`]: Number(solution[`${firstScenario.rowId}:difference`]) + 9,
      [`${firstScenario.rowId}:larger-column`]: firstScenario.expectedLargerColumn === 'debit' ? 'credit' : 'debit',
    };

    const gradeResult = trialBalanceErrorFamily.grade(definition, studentResponse);
    const reviewed = buildTrialBalanceErrorReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = trialBalanceErrorFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[`${firstScenario.rowId}:balanced`]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.stringMatching(/still balances|out of balance/i),
    });
    expect(reviewed[`${firstScenario.rowId}:difference`].message).toContain('difference');

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected trial-balance-errors envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.artifact).toMatchObject({
      kind: 'trial-balance-error-analysis',
      family: 'trial-balance-errors',
    });
  });
});
