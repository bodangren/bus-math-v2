import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildStatementSubtotalsReviewFeedback,
  statementSubtotalsFamily,
  type StatementSubtotalsDefinition,
  type StatementSubtotalsResponse,
} from '@/lib/practice/engine/families/statement-subtotals';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('statement subtotals family', () => {
  it('generates deterministic subtotal statements across all statement kinds', () => {
    const family: ProblemFamily<
      StatementSubtotalsDefinition,
      StatementSubtotalsResponse,
      Parameters<typeof statementSubtotalsFamily.generate>[1]
    > = statementSubtotalsFamily;

    for (const statementKind of ['balance-sheet', 'income-statement', 'equity-statement', 'retail-income-statement'] as const) {
      for (let seed = 1; seed <= 5; seed += 1) {
        const config = {
          mode: 'guided_practice' as const,
          statementKind,
        };

        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('statement-subtotals');
        expect(definition.statementKind).toBe(statementKind);
        expect(definition.sections.length).toBeGreaterThan(0);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.rows.some((row) => row.kind === 'prefilled')).toBe(true);
        expect(definition.rows.some((row) => row.kind === 'editable')).toBe(true);
      }
    }
  });

  it('scores dependent subtotals and round-trips the envelope', () => {
    const definition = statementSubtotalsFamily.generate(2026, {
      mode: 'assessment',
      statementKind: 'retail-income-statement',
      tolerance: 1,
    });

    const solution = statementSubtotalsFamily.solve(definition);
    const changedPart = definition.parts[0];
    const studentResponse: StatementSubtotalsResponse = {
      ...solution,
      [changedPart.id]: Number(solution[changedPart.id] ?? 0) + 5,
    };

    const gradeResult = statementSubtotalsFamily.grade(definition, studentResponse);
    const reviewed = buildStatementSubtotalsReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = statementSubtotalsFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[changedPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected statement-subtotals envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers[changedPart.id]).toBe(studentResponse[changedPart.id]);
    expect(parsed.data.parts).toHaveLength(definition.parts.length);
  });
});
