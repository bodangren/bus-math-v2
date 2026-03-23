import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  adjustingCalculationsFamily,
  buildAdjustingCalculationsReviewFeedback,
  type AdjustingCalculationsDefinition,
  type AdjustingCalculationsJournalLine,
  type AdjustingCalculationsResponse,
} from '@/lib/practice/engine/families/adjusting-calculations';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('adjusting calculations family', () => {
  it('generates deterministic calculation and journal-entry variants across the adjustment scenarios', () => {
    const family: ProblemFamily<
      AdjustingCalculationsDefinition,
      AdjustingCalculationsResponse,
      Parameters<typeof adjustingCalculationsFamily.generate>[1]
    > = adjustingCalculationsFamily;

    for (const presentation of ['calculation', 'journal-entry'] as const) {
      for (const scenarioKind of ['deferral', 'accrual', 'depreciation'] as const) {
        for (let seed = 1; seed <= 5; seed += 1) {
          const config = {
            mode: 'guided_practice' as const,
            presentation,
            scenarioKind,
          };

          const definition = family.generate(seed, config);
          const repeat = family.generate(seed, config);

          expect(definition).toEqual(repeat);
          expect(definition.familyKey).toBe('adjusting-calculations');
          expect(definition.presentation).toBe(presentation);
          expect(definition.scenario.kind).toBe(scenarioKind);
          expect(definition.parts.length).toBeGreaterThan(0);

          if (presentation === 'calculation') {
            expect(definition.parts.every((part) => part.kind === 'numeric')).toBe(true);
          } else {
            expect(definition.entryLines?.length).toBeGreaterThan(0);
            expect(definition.parts.every((part) => part.kind === 'journal-entry')).toBe(true);
          }
        }
      }
    }
  });

  it('scores the calculation answer and journal entry rows, then round-trips the envelope', () => {
    const calculationDefinition = adjustingCalculationsFamily.generate(2026, {
      mode: 'assessment',
      presentation: 'calculation',
      scenarioKind: 'deferral',
      tolerance: 1,
    });
    const calculationSolution = adjustingCalculationsFamily.solve(calculationDefinition);
    const calculationPart = calculationDefinition.parts[0];
    const calculationResponse: AdjustingCalculationsResponse = {
      ...calculationSolution,
      [calculationPart.id]: Number(calculationSolution[calculationPart.id] ?? 0) + 2,
    };

    const calculationGrade = adjustingCalculationsFamily.grade(calculationDefinition, calculationResponse);
    const calculationFeedback = buildAdjustingCalculationsReviewFeedback(
      calculationDefinition,
      calculationResponse,
      calculationGrade,
    );
    const calculationEnvelope = adjustingCalculationsFamily.toEnvelope(
      calculationDefinition,
      calculationResponse,
      calculationGrade,
    );

    expect(calculationGrade.score).toBeLessThan(calculationGrade.maxScore);
    expect(calculationFeedback[calculationPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const calculationParsed = practiceSubmissionEnvelopeSchema.safeParse(calculationEnvelope);
    expect(calculationParsed.success).toBe(true);
    if (!calculationParsed.success) {
      throw new Error('Expected adjusting-calculations calculation envelope to parse');
    }

    expect(calculationParsed.data.contractVersion).toBe('practice.v1');
    expect(calculationParsed.data.answers[calculationPart.id]).toBe(calculationResponse[calculationPart.id]);

    const entryDefinition = adjustingCalculationsFamily.generate(2026, {
      mode: 'assessment',
      presentation: 'journal-entry',
      scenarioKind: 'depreciation',
      tolerance: 1,
    });
    const entrySolution = adjustingCalculationsFamily.solve(entryDefinition);
    const entryLine = entryDefinition.parts[0];
    const solutionLine = entrySolution[entryLine.id] as AdjustingCalculationsJournalLine;
    const entryResponse: AdjustingCalculationsResponse = {
      ...entrySolution,
      [entryLine.id]: {
        ...solutionLine,
        memo: 'Wrong memo',
      },
    };

    const entryGrade = adjustingCalculationsFamily.grade(entryDefinition, entryResponse);
    const entryFeedback = buildAdjustingCalculationsReviewFeedback(entryDefinition, entryResponse, entryGrade);
    const entryEnvelope = adjustingCalculationsFamily.toEnvelope(entryDefinition, entryResponse, entryGrade);

    // Bug 3 fix: wrong memo should NOT fail a journal line — only accounts/amounts matter
    expect(entryGrade.parts[0].isCorrect).toBe(true);
    expect(entryFeedback[entryLine.id]).toMatchObject({
      status: 'correct',
    });

    const entryParsed = practiceSubmissionEnvelopeSchema.safeParse(entryEnvelope);
    expect(entryParsed.success).toBe(true);
    if (!entryParsed.success) {
      throw new Error('Expected adjusting-calculations journal-entry envelope to parse');
    }

    expect(entryParsed.data.contractVersion).toBe('practice.v1');
    expect(entryParsed.data.answers[entryLine.id]).toMatchObject({
      memo: 'Wrong memo',
    });
    expect(entryParsed.data.parts).toHaveLength(entryDefinition.parts.length);
  });

  it('marks a journal line incorrect when the account is wrong (even with correct amounts)', () => {
    const definition = adjustingCalculationsFamily.generate(2026, {
      presentation: 'journal-entry',
      scenarioKind: 'depreciation',
      tolerance: 1,
    });
    const solution = adjustingCalculationsFamily.solve(definition);
    const firstLine = definition.parts[0];
    const solutionLine = solution[firstLine.id] as AdjustingCalculationsJournalLine;

    const response: AdjustingCalculationsResponse = {
      ...solution,
      [firstLine.id]: {
        ...solutionLine,
        accountId: 'cash', // wrong account
      },
    };

    const grade = adjustingCalculationsFamily.grade(definition, response);
    expect(grade.parts[0].isCorrect).toBe(false);
  });

  it('adds distractor accounts to the journal-entry presentation', () => {
    const definition = adjustingCalculationsFamily.generate(2026, {
      presentation: 'journal-entry',
      scenarioKind: 'accrual',
    });

    expect(definition.availableAccounts.length).toBeGreaterThanOrEqual(4);
    expect(definition.availableAccounts.some((account) => !definition.entryLines.some((line) => line.accountId === account.id))).toBe(true);
  });

  it('expense-method deferral uses remainingAmount (unexpired portion) as the entry amount', () => {
    // Use odd seed (produces expense method) and force deferral kind
    const definition = adjustingCalculationsFamily.generate(43, {
      presentation: 'calculation',
      scenarioKind: 'deferral',
    });

    const scenario = definition.scenario as import('@/lib/practice/engine/adjustments').DeferralAdjustmentScenario;
    expect(scenario.method).toBe('expense');
    // For expense-method, the correcting entry moves the unexpired portion back to the asset
    expect(scenario.amount).toBe(scenario.remainingAmount);
    expect(scenario.entry.amount).toBe(scenario.remainingAmount);
    // Verify it's different from the expired portion
    expect(scenario.remainingAmount).not.toBe(scenario.adjustmentAmount);
  });
});
