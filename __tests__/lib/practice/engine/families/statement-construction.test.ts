import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildStatementConstructionReviewFeedback,
  statementConstructionFamily,
  type StatementConstructionDefinition,
  type StatementConstructionResponse,
} from '@/lib/practice/engine/families/statement-construction';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('statement construction family', () => {
  it('generates deterministic statement templates with an account bank', () => {
    const family: ProblemFamily<
      StatementConstructionDefinition,
      StatementConstructionResponse,
      Parameters<typeof statementConstructionFamily.generate>[1]
    > = statementConstructionFamily;

    for (const statementKind of ['balance-sheet', 'income-statement'] as const) {
      for (let seed = 1; seed <= 5; seed += 1) {
        const config = {
          mode: 'guided_practice' as const,
          statementKind,
        };

        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('statement-construction');
        expect(definition.statementKind).toBe(statementKind);
        const placementPartCount = definition.parts.filter((part) => part.details.expectedAnswerType === 'label').length;
        expect(definition.accountBank.length).toBeGreaterThan(placementPartCount);
        expect(definition.parts.some((part) => part.details.expectedAnswerType === 'label')).toBe(true);
        expect(definition.parts.some((part) => part.details.expectedAnswerType === 'number')).toBe(true);
      }
    }
  });

  it('scores account placement separately from subtotal math and round-trips the envelope', () => {
    const definition = statementConstructionFamily.generate(2026, {
      mode: 'assessment',
      statementKind: 'balance-sheet',
      tolerance: 1,
    });

    const solution = statementConstructionFamily.solve(definition);
    const labelPart = definition.parts.find((part) => part.details.expectedAnswerType === 'label') ?? definition.parts[0];
    const amountPart = definition.parts.find((part) => part.details.expectedAnswerType === 'number') ?? definition.parts[1];
    const studentResponse: StatementConstructionResponse = {
      ...solution,
      [labelPart.id]: 'Wrong Account',
      [amountPart.id]: Number(solution[amountPart.id] ?? 0) + 2,
    };

    const gradeResult = statementConstructionFamily.grade(definition, studentResponse);
    const reviewed = buildStatementConstructionReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = statementConstructionFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[labelPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });
    expect(reviewed[amountPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected statement-construction envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers[labelPart.id]).toBe(studentResponse[labelPart.id]);
    expect(parsed.data.answers[amountPart.id]).toBe(studentResponse[amountPart.id]);
    expect(parsed.data.parts).toHaveLength(definition.parts.length);
  });
});
