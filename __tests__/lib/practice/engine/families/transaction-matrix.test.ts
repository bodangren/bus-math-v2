import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildTransactionMatrixReviewFeedback,
  transactionMatrixFamily,
  type TransactionMatrixDefinition,
  type TransactionMatrixResponse,
} from '@/lib/practice/engine/families/transaction-matrix';

describe('transaction matrix family', () => {
  it('deterministically generates scaffolded reasoning boards across seeds', () => {
    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        archetypeId: 'earn-revenue' as const,
        context: 'service' as const,
        settlement: 'cash' as const,
        mode: 'guided_practice' as const,
      };

      const definition: TransactionMatrixDefinition = transactionMatrixFamily.generate(seed, config);
      const repeat = transactionMatrixFamily.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('transaction-matrix');
      expect(definition.rows.map((row) => row.id)).toEqual(['cash', 'offset-account', 'income-statement', 'equity']);
      expect(definition.columns.map((column) => column.id)).toEqual([
        'affected',
        'direction',
        'amount-basis',
        'equity-reason',
      ]);
      expect(definition.parts).toHaveLength(4);
    }
  });

  it('scores reasoning stages and round-trips the practice envelope', () => {
    const definition: TransactionMatrixDefinition = transactionMatrixFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionMatrixFamily.solve(definition);
    const studentResponse: TransactionMatrixResponse = {
      ...solution,
      'offset-account': 'equity-reason',
      equity: 'direction',
    };

    const gradeResult = transactionMatrixFamily.grade(definition, studentResponse);
    const reviewed = buildTransactionMatrixReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = transactionMatrixFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed['offset-account']).toMatchObject({
      status: 'incorrect',
      expectedLabel: 'direction',
    });
    expect(reviewed.equity).toMatchObject({
      status: 'incorrect',
      message: expect.stringContaining('equity'),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected transaction-matrix envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.artifact).toMatchObject({
      kind: 'transaction-matrix-analysis',
      family: 'transaction-matrix',
      event: expect.objectContaining({
        archetypeId: 'earn-revenue',
      }),
    });
  });
});
