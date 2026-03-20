import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildStatementCompletionReviewFeedback,
  statementCompletionFamily,
  type StatementCompletionDefinition,
  type StatementCompletionResponse,
} from '@/lib/practice/engine/families/statement-completion';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('statement completion family', () => {
  it('generates deterministic statement variants across seeds', () => {
    const family: ProblemFamily<
      StatementCompletionDefinition,
      StatementCompletionResponse,
      Parameters<typeof statementCompletionFamily.generate>[1]
    > = statementCompletionFamily;

    const statementKinds = ['income-statement', 'balance-sheet', 'equity-statement'] as const;

    for (const statementKind of statementKinds) {
      for (let seed = 1; seed <= 5; seed += 1) {
        const config = {
          mode: 'guided_practice' as const,
          statementKind,
        };

        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('statement-completion');
        expect(definition.statementKind).toBe(statementKind);
        expect(definition.sections.length).toBeGreaterThan(0);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.rows.some((row) => row.kind === 'prefilled')).toBe(true);
        expect(definition.rows.some((row) => row.kind === 'editable')).toBe(true);
      }
    }
  });

  it('scores blank statement totals and round-trips the practice envelope', () => {
    const definition = statementCompletionFamily.generate(2026, {
      mode: 'assessment',
      statementKind: 'balance-sheet',
      tolerance: 1,
    });

    const solution = statementCompletionFamily.solve(definition);
    const changedPart = definition.parts[0];
    const studentResponse: StatementCompletionResponse = {
      ...solution,
      [changedPart.id]: (solution[changedPart.id] ?? 0) + 2,
    };

    const gradeResult = statementCompletionFamily.grade(definition, studentResponse);
    const reviewed = buildStatementCompletionReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = statementCompletionFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[changedPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected statement-completion envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers[changedPart.id]).toBe(studentResponse[changedPart.id]);
    expect(parsed.data.parts).toHaveLength(definition.parts.length);
  });
});
