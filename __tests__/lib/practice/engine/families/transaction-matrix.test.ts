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
      // 4 real rows + 2 distractors = 6, shuffled
      expect(definition.rows).toHaveLength(6);
      expect(definition.columns.map((column) => column.id)).toEqual([
        'affected',
        'direction',
        'amount-basis',
        'equity-reason',
        'not-affected',
      ]);
      // 4 real parts + 2 distractor parts = 6
      expect(definition.parts).toHaveLength(6);
    }
  });

  it('includes distractor rows that are not part of the transaction effects', () => {
    const definition = transactionMatrixFamily.generate(42, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
    });

    const distractorParts = definition.parts.filter((p) => p.id.startsWith('distractor-'));
    expect(distractorParts).toHaveLength(2);

    for (const part of distractorParts) {
      expect(part.targetId).toBe('not-affected');
      expect(part.details.stage).toBe('distractor');
      // distractor account should not be in the event effects
      const involvedIds = definition.event.effects.map((e) => e.accountId);
      expect(involvedIds).not.toContain(part.details.accountId);
    }
  });

  it('shuffles row order so position is not deterministic across different seeds', () => {
    const def1 = transactionMatrixFamily.generate(1, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
    });
    const def2 = transactionMatrixFamily.generate(2, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
    });

    const ids1 = def1.rows.map((r) => r.id);
    const ids2 = def2.rows.map((r) => r.id);

    // Both have the same set of real row IDs
    const realIds = ['cash', 'offset-account', 'income-statement', 'equity'];
    for (const id of realIds) {
      expect(ids1).toContain(id);
      expect(ids2).toContain(id);
    }

    // With different seeds, row order or distractor accounts should differ
    // (extremely unlikely to be identical for different seeds)
    const anyDifference = ids1.join(',') !== ids2.join(',');
    expect(anyDifference).toBe(true);
  });

  it('scores reasoning stages including distractors and round-trips the practice envelope', () => {
    const definition: TransactionMatrixDefinition = transactionMatrixFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionMatrixFamily.solve(definition);

    // Verify distractor solution is 'not-affected'
    expect(solution['distractor-1']).toBe('not-affected');
    expect(solution['distractor-2']).toBe('not-affected');

    const studentResponse: TransactionMatrixResponse = {
      ...solution,
      'offset-account': 'equity-reason',
      equity: 'direction',
      'distractor-1': 'affected', // wrong — this account isn't involved
    };

    const gradeResult = transactionMatrixFamily.grade(definition, studentResponse);
    const reviewed = buildTransactionMatrixReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = transactionMatrixFamily.toEnvelope(definition, studentResponse, gradeResult);

    // 3 wrong out of 6
    expect(gradeResult.score).toBe(3);
    expect(gradeResult.maxScore).toBe(6);

    expect(reviewed['offset-account']).toMatchObject({
      status: 'incorrect',
      expectedLabel: 'direction',
    });
    expect(reviewed.equity).toMatchObject({
      status: 'incorrect',
      message: expect.stringContaining('equity'),
    });
    expect(reviewed['distractor-1']).toMatchObject({
      status: 'incorrect',
      expectedLabel: 'not affected',
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

  it('works with multiple archetypes', () => {
    const archetypes = ['purchase-asset', 'pay-expense', 'owner-invests-cash'] as const;
    for (const archetypeId of archetypes) {
      const definition = transactionMatrixFamily.generate(100, {
        archetypeId,
        context: 'merchandise',
        settlement: 'cash',
      });

      expect(definition.rows).toHaveLength(6);
      expect(definition.parts).toHaveLength(6);

      const solution = transactionMatrixFamily.solve(definition);
      const grade = transactionMatrixFamily.grade(definition, solution);
      expect(grade.score).toBe(grade.maxScore);
    }
  });

  it('emits no canonical misconception tags for reasoning-stage (column-selection) errors', () => {
    const definition = transactionMatrixFamily.generate(2026, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
      mode: 'assessment',
    });

    const solution = transactionMatrixFamily.solve(definition);

    // Build a response with wrong reasoning-stage answers for non-distractor parts
    const studentResponse: TransactionMatrixResponse = { ...solution };
    const realParts = definition.parts.filter((p) => !p.id.startsWith('distractor-'));
    // Pick the first real part and set it to the wrong stage column
    const wrongPart = realParts[0];
    const wrongColumns = definition.columns
      .map((c) => c.id)
      .filter((c) => c !== solution[wrongPart.id]);
    studentResponse[wrongPart.id] = wrongColumns[0];

    const gradeResult = transactionMatrixFamily.grade(definition, studentResponse);

    // The wrong part should have tags but NONE should be debit-credit-reversal or computation-error
    const wrongPartGrade = gradeResult.parts.find((p) => p.partId === wrongPart.id);
    expect(wrongPartGrade).toBeDefined();
    expect(wrongPartGrade!.isCorrect).toBe(false);
    for (const tag of wrongPartGrade!.misconceptionTags) {
      expect(tag).not.toContain('debit-credit-reversal');
      expect(tag).not.toContain('computation-error');
    }
  });

  it('emits context-only tags for distractor reasoning-stage errors', () => {
    const definition = transactionMatrixFamily.generate(42, {
      archetypeId: 'earn-revenue',
      context: 'service',
      settlement: 'cash',
    });

    const solution = transactionMatrixFamily.solve(definition);
    const studentResponse: TransactionMatrixResponse = {
      ...solution,
      'distractor-1': 'affected',
    };

    const gradeResult = transactionMatrixFamily.grade(definition, studentResponse);
    const distractorGrade = gradeResult.parts.find((p) => p.partId === 'distractor-1');
    expect(distractorGrade).toBeDefined();
    expect(distractorGrade!.isCorrect).toBe(false);
    for (const tag of distractorGrade!.misconceptionTags) {
      expect(tag).not.toContain('debit-credit-reversal');
      expect(tag).not.toContain('computation-error');
    }
  });
});
