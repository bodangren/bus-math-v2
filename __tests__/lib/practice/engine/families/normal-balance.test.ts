import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import { practiceAccounts } from '@/lib/practice/engine/accounts';
import {
  buildNormalBalanceReviewFeedback,
  normalBalanceFamily,
  type NormalBalanceDefinition,
  type NormalBalanceResponse,
} from '@/lib/practice/engine/families/normal-balance';
import type { ProblemFamily } from '@/lib/practice/engine/types';

function getParentNormalBalance(definition: NormalBalanceDefinition, accountId: string) {
  const part = definition.parts.find((entry) => entry.id === accountId);
  if (!part?.details.contraOf) {
    return null;
  }

  const parent = practiceAccounts.find((account) => account.id === part.details.contraOf);
  return parent?.normalBalance ?? null;
}

describe('normal balance family', () => {
  it('deterministically generates mixed normal-balance boards across seeds', () => {
    const family: ProblemFamily<
      NormalBalanceDefinition,
      NormalBalanceResponse,
      Parameters<typeof normalBalanceFamily.generate>[1]
    > = normalBalanceFamily;

    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        accountCount: 10,
        includeContraAccounts: true,
        companyScope: 'service' as const,
        mode: 'guided_practice' as const,
      };

      const definition = family.generate(seed, config);
      const repeat = family.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.parts).toHaveLength(10);
      expect(new Set(definition.parts.map((part) => part.targetId))).toEqual(new Set(['debit', 'credit']));
      expect(definition.parts.some((part) => part.details.isContraAccount)).toBe(true);
      expect(definition.parts.every((part) => part.details.companyScope === 'service')).toBe(true);
    }
  });

  it('honors retail scope, excludes contra accounts when requested, and solves to canonical sides', () => {
    const definition = normalBalanceFamily.generate(27, {
      accountCount: 8,
      includeContraAccounts: false,
      companyScope: 'retail',
      mode: 'assessment',
    });

    const solution = normalBalanceFamily.solve(definition);

    expect(definition.parts.every((part) => part.details.retailApplicable)).toBe(true);
    expect(definition.parts.some((part) => part.details.isContraAccount)).toBe(false);
    expect(solution).toEqual(
      Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId])),
    );
  });

  it('tags contra-account balance confusion and round-trips through the practice envelope', () => {
    const definition = normalBalanceFamily.generate(41, {
      accountCount: 9,
      includeContraAccounts: true,
      companyScope: 'service',
      mode: 'guided_practice',
    });

    const solution = normalBalanceFamily.solve(definition);
    const contraPart = definition.parts.find((part) => part.details.isContraAccount);

    expect(contraPart).toBeDefined();
    if (!contraPart) {
      throw new Error('Expected at least one contra account in the generated board');
    }

    const parentBalance = getParentNormalBalance(definition, contraPart.id);
    expect(parentBalance).toBeDefined();
    if (!parentBalance) {
      throw new Error('Expected a parent balance for the contra account');
    }

    const studentResponse: NormalBalanceResponse = {
      ...solution,
      [contraPart.id]: parentBalance,
    };

    const gradeResult = normalBalanceFamily.grade(definition, studentResponse);
    const reviewed = buildNormalBalanceReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = normalBalanceFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(gradeResult.parts.some((part) => part.partId === contraPart.id && part.score === 0)).toBe(true);
    expect(gradeResult.parts.find((part) => part.partId === contraPart.id)?.misconceptionTags).toEqual(
      expect.arrayContaining(['contra-account-same-as-parent']),
    );
    expect(reviewed[contraPart.id]).toMatchObject({
      status: 'incorrect',
      expectedBalanceLabel: contraPart.targetId.toUpperCase(),
      selectedBalanceLabel: parentBalance.toUpperCase(),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected normal-balance envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.artifact).toMatchObject({
      kind: 'normal-balance-grid',
      family: 'normal-balance',
      companyScope: 'service',
    });
  });
});
