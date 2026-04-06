import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildPostingBalanceReviewFeedback,
  postingBalancesFamily,
  type PostingBalanceDefinition,
  type PostingBalanceResponse,
} from '@/lib/practice/engine/families/posting-balances';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('posting balances family', () => {
  it('generates deterministic posting boards with unchanged rows represented explicitly', () => {
    const family: ProblemFamily<
      PostingBalanceDefinition,
      PostingBalanceResponse,
      Parameters<typeof postingBalancesFamily.generate>[1]
    > = postingBalancesFamily;

    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        mode: 'guided_practice' as const,
        targetAccountCount: 4,
        postingAccountCount: 3,
      };

      const definition = family.generate(seed, config);
      const repeat = family.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('posting-balances');
      expect(definition.rows.length).toBeGreaterThanOrEqual(3);
      expect(definition.postingLines.length).toBeGreaterThan(0);
      expect(definition.rows.some((row) => row.details.netChange === 0)).toBe(true);
    }
  });

  it('scores ending balances and round-trips the practice envelope', () => {
    const definition = postingBalancesFamily.generate(2026, {
      mode: 'assessment',
      targetAccountCount: 4,
      postingAccountCount: 3,
      tolerance: 1,
    });

    const solution = postingBalancesFamily.solve(definition);
    const changedRow = definition.rows.find((row) => row.details.netChange !== 0) ?? definition.rows[0];
    const studentResponse: PostingBalanceResponse = {
      ...solution,
      [changedRow.id]: (solution[changedRow.id] ?? 0) + 2,
    };

    const gradeResult = postingBalancesFamily.grade(definition, studentResponse);
    const reviewed = buildPostingBalanceReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = postingBalancesFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[changedRow.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: String(changedRow.targetId),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected posting-balances envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers[changedRow.id]).toBe(studentResponse[changedRow.id]);
    expect(parsed.data.parts).toHaveLength(definition.parts.length);
  });

  it('emits sign-error tag when student enters wrong sign on a nonzero balance', () => {
    const definition = postingBalancesFamily.generate(2026, {
      mode: 'assessment',
      targetAccountCount: 4,
      postingAccountCount: 3,
      tolerance: 1,
    });

    const solution = postingBalancesFamily.solve(definition);
    const nonzeroRow = definition.rows.find((row) => Number(row.targetId) !== 0);
    // If no nonzero row, skip (unlikely for valid generation)
    if (!nonzeroRow) return;

    const studentResponse: PostingBalanceResponse = {
      ...solution,
      [nonzeroRow.id]: -Number(nonzeroRow.targetId),
    };

    const gradeResult = postingBalancesFamily.grade(definition, studentResponse);
    const partGrade = gradeResult.parts.find((p) => p.partId === nonzeroRow.id);
    expect(partGrade).toBeDefined();
    expect(partGrade!.isCorrect).toBe(false);
    expect(partGrade!.misconceptionTags).toEqual(
      expect.arrayContaining([expect.stringContaining('sign-error')]),
    );
  });

  it('emits computation-error tag when student enters wrong amount with correct sign', () => {
    const definition = postingBalancesFamily.generate(2026, {
      mode: 'assessment',
      targetAccountCount: 4,
      postingAccountCount: 3,
      tolerance: 1,
    });

    const solution = postingBalancesFamily.solve(definition);
    const nonzeroRow = definition.rows.find((row) => Number(row.targetId) !== 0);
    if (!nonzeroRow) return;

    // Same sign, different amount
    const correctValue = Number(nonzeroRow.targetId);
    const wrongValue = correctValue > 0 ? correctValue + 50 : correctValue - 50;
    const studentResponse: PostingBalanceResponse = {
      ...solution,
      [nonzeroRow.id]: wrongValue,
    };

    const gradeResult = postingBalancesFamily.grade(definition, studentResponse);
    const partGrade = gradeResult.parts.find((p) => p.partId === nonzeroRow.id);
    expect(partGrade).toBeDefined();
    expect(partGrade!.isCorrect).toBe(false);
    expect(partGrade!.misconceptionTags).toEqual(
      expect.arrayContaining([expect.stringContaining('computation-error')]),
    );
  });

  it('emits no misconception tags on correct answers', () => {
    const definition = postingBalancesFamily.generate(2026, {
      mode: 'assessment',
      targetAccountCount: 4,
      postingAccountCount: 3,
      tolerance: 1,
    });

    const solution = postingBalancesFamily.solve(definition);
    const gradeResult = postingBalancesFamily.grade(definition, solution);

    for (const part of gradeResult.parts) {
      expect(part.isCorrect).toBe(true);
      expect(part.misconceptionTags).toHaveLength(0);
    }
  });
});
