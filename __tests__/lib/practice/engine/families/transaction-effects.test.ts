import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildTransactionEffectsReviewFeedback,
  transactionEffectsFamily,
  type TransactionEffectsDefinition,
  type TransactionEffectsResponse,
} from '@/lib/practice/engine/families/transaction-effects';

describe('transaction effects family', () => {
  it('deterministically generates account-effect boards across seeds', () => {
    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        archetypeId: 'earn-revenue' as const,
        context: 'service' as const,
        settlement: 'cash' as const,
        mode: 'guided_practice' as const,
      };

      const definition: TransactionEffectsDefinition = transactionEffectsFamily.generate(seed, config);
      const repeat = transactionEffectsFamily.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('transaction-effects');
      expect(definition.rows.map((row) => row.id)).toEqual([
        definition.event.effects[0]?.accountId ?? 'cash',
        definition.event.effects[1]?.accountId ?? 'accounts-receivable',
        'assets',
        'liabilities',
        'equity',
      ]);
      expect(definition.columns.map((column) => column.id)).toEqual(['increase', 'decrease', 'no-effect']);
      expect(definition.parts).toHaveLength(7);
    }
  });

  it('scores per-part answers and round-trips the practice envelope', () => {
    const definition: TransactionEffectsDefinition = transactionEffectsFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionEffectsFamily.solve(definition);
    const wrongEffectId = definition.event.effects[0]?.accountId ?? 'cash';
    const studentResponse: TransactionEffectsResponse = {
      ...solution,
      [wrongEffectId]: solution[wrongEffectId] === 'increase' ? 'decrease' : 'increase',
      equity: definition.event.equityEffect === 'increases' ? 'decrease' : 'increase',
      amount: definition.event.amount,
      'equity-reason': 'asset-exchange',
    };

    const gradeResult = transactionEffectsFamily.grade(definition, studentResponse);
    const reviewed = buildTransactionEffectsReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = transactionEffectsFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[wrongEffectId]).toMatchObject({
      status: 'incorrect',
      selectedLabel: expect.any(String),
      expectedLabel: expect.any(String),
    });
    expect(reviewed.amount).toMatchObject({
      status: 'correct',
      expectedLabel: expect.stringMatching(/\$\d/),
    });
    expect(reviewed['equity-reason']).toMatchObject({
      status: 'incorrect',
      message: expect.stringContaining('asset exchange'),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected transaction-effects envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.artifact).toMatchObject({
      kind: 'transaction-effects-analysis',
      family: 'transaction-effects',
      event: expect.objectContaining({
        archetypeId: 'earn-revenue',
      }),
    });
  });

  it('emits classification-error (not debit-credit-reversal) for wrong direction selections', () => {
    const definition = transactionEffectsFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionEffectsFamily.solve(definition);

    // Find an effect-kind part and answer incorrectly
    const effectParts = definition.parts.filter((p) => p.details.kind === 'effect' && p.targetId !== 'no-effect');
    const wrongPart = effectParts[0];
    const wrongAnswer = wrongPart.targetId === 'increase' ? 'decrease' : 'increase';
    const studentResponse: TransactionEffectsResponse = {
      ...solution,
      [wrongPart.id]: wrongAnswer,
    };

    const gradeResult = transactionEffectsFamily.grade(definition, studentResponse);
    const wrongPartGrade = gradeResult.parts.find((p) => p.partId === wrongPart.id);
    expect(wrongPartGrade).toBeDefined();
    expect(wrongPartGrade!.isCorrect).toBe(false);
    // Direction errors are classification errors, not debit-credit reversals
    for (const tag of wrongPartGrade!.misconceptionTags) {
      expect(tag).not.toContain('debit-credit-reversal');
    }
  });

  it('emits computation-error for wrong amount answers', () => {
    const definition = transactionEffectsFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionEffectsFamily.solve(definition);
    const amountPart = definition.parts.find((p) => p.details.kind === 'amount');
    expect(amountPart).toBeDefined();

    const studentResponse: TransactionEffectsResponse = {
      ...solution,
      [amountPart!.id]: (Number(amountPart!.targetId) + 999).toString(),
    };

    const gradeResult = transactionEffectsFamily.grade(definition, studentResponse);
    const wrongAmountGrade = gradeResult.parts.find((p) => p.partId === amountPart!.id);
    expect(wrongAmountGrade).toBeDefined();
    expect(wrongAmountGrade!.isCorrect).toBe(false);
    expect(wrongAmountGrade!.misconceptionTags).toEqual(
      expect.arrayContaining([expect.stringContaining('computation-error')]),
    );
  });

  it('emits no misconception tags on correct answers', () => {
    const definition = transactionEffectsFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionEffectsFamily.solve(definition);
    const gradeResult = transactionEffectsFamily.grade(definition, solution);

    for (const part of gradeResult.parts) {
      expect(part.isCorrect).toBe(true);
      expect(part.misconceptionTags).toHaveLength(0);
    }
  });
});
