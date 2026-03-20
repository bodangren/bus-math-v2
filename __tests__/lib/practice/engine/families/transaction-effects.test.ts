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
});
