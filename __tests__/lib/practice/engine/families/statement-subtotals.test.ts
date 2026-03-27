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
  it('accepts density low config and produces fewer blanks for income-statement', () => {
    const lowDef = statementSubtotalsFamily.generate(42, {
      mode: 'guided_practice',
      statementKind: 'income-statement',
      density: 'low',
    });
    const stdDef = statementSubtotalsFamily.generate(42, {
      mode: 'guided_practice',
      statementKind: 'income-statement',
    });

    // Low density: only net income is editable (1 blank)
    expect(lowDef.parts.length).toBe(1);
    expect(lowDef.parts[0].id).toBe('net-income');
    expect(lowDef.scaffolding.blanks).toBe(1);

    // Standard density: 3 blanks (total revenue, total expenses, net income)
    expect(stdDef.parts.length).toBe(3);
    expect(stdDef.scaffolding.blanks).toBe(3);

    // Both should still generate valid definitions
    expect(lowDef.familyKey).toBe('statement-subtotals');
    expect(lowDef.statementKind).toBe('income-statement');

    // Low density solve/grade still works
    const solution = statementSubtotalsFamily.solve(lowDef);
    const grade = statementSubtotalsFamily.grade(lowDef, solution);
    expect(grade.score).toBe(grade.maxScore);
  });

  it('density low has no effect on balance-sheet and equity-statement (already minimal)', () => {
    for (const kind of ['balance-sheet', 'equity-statement'] as const) {
      const lowDef = statementSubtotalsFamily.generate(42, {
        mode: 'guided_practice',
        statementKind: kind,
        density: 'low',
      });
      const stdDef = statementSubtotalsFamily.generate(42, {
        mode: 'guided_practice',
        statementKind: kind,
      });

      expect(lowDef.parts.length).toBe(stdDef.parts.length);
    }
  });

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

  it('includes computation-chain feedback for income-statement net income', () => {
    const definition = statementSubtotalsFamily.generate(2026, {
      mode: 'assessment',
      statementKind: 'income-statement',
      tolerance: 1,
    });

    const solution = statementSubtotalsFamily.solve(definition);
    const netIncomePart = definition.parts.find((part) => part.id === 'net-income');
    if (!netIncomePart) {
      throw new Error('Expected net-income part in income-statement');
    }

    const studentResponse: StatementSubtotalsResponse = {
      ...solution,
      [netIncomePart.id]: Number(solution[netIncomePart.id] ?? 0) + 100,
    };

    const gradeResult = statementSubtotalsFamily.grade(definition, studentResponse);
    const reviewed = buildStatementSubtotalsReviewFeedback(definition, studentResponse, gradeResult);

    expect(reviewed[netIncomePart.id].message).toContain('Total Revenues');
    expect(reviewed[netIncomePart.id].message).toContain('Total Expenses');
    expect(reviewed[netIncomePart.id].message).toContain('Net Income');
    expect(reviewed[netIncomePart.id].message).toMatch(/\$[\d,]+.*\$[\d,]+.*=.*\$[\d,]+/);
  });

  it('includes computation-chain feedback for retail-income-statement dependent subtotals', () => {
    const definition = statementSubtotalsFamily.generate(2026, {
      mode: 'assessment',
      statementKind: 'retail-income-statement',
      tolerance: 1,
    });

    const solution = statementSubtotalsFamily.solve(definition);
    const netIncomePart = definition.parts.find((part) => part.id === 'retail-net-income');
    if (!netIncomePart) {
      throw new Error('Expected retail-net-income part in retail-income-statement');
    }

    const studentResponse: StatementSubtotalsResponse = {
      ...solution,
      [netIncomePart.id]: Number(solution[netIncomePart.id] ?? 0) + 100,
    };

    const gradeResult = statementSubtotalsFamily.grade(definition, studentResponse);
    const reviewed = buildStatementSubtotalsReviewFeedback(definition, studentResponse, gradeResult);

    expect(reviewed[netIncomePart.id].message).toContain('Gross Profit');
    expect(reviewed[netIncomePart.id].message).toContain('Operating Expenses');
    expect(reviewed[netIncomePart.id].message).toMatch(/Gross Profit.*Operating Expenses.*Net Income/);
  });
});
