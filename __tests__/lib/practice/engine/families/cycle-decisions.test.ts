import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildCycleDecisionReviewFeedback,
  cycleDecisionScenarioCatalog,
  cycleDecisionsFamily,
  type CycleDecisionDefinition,
  type CycleDecisionResponse,
} from '@/lib/practice/engine/families/cycle-decisions';

describe('cycle decisions family', () => {
  it('covers the scenario catalog: reversing-selection and mini-ledger closing-entry', () => {
    const expectedKinds = ['reversing-selection', 'closing-entry'] as const;

    expect(cycleDecisionScenarioCatalog.map((scenario) => scenario.kind)).toEqual(expectedKinds);

    for (const [index, kind] of expectedKinds.entries()) {
      const seed = index + 1;
      const definition: CycleDecisionDefinition = cycleDecisionsFamily.generate(seed, {
        scenarioKey: kind,
        mode: 'guided_practice',
      });
      const repeat = cycleDecisionsFamily.generate(seed, {
        scenarioKey: kind,
        mode: 'guided_practice',
      });

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('cycle-decisions');
      expect(definition.scenario.kind).toBe(kind);
      expect(definition.parts.length).toBeGreaterThan(0);
      if (kind === 'reversing-selection') {
        expect(definition.selectionRows.some((row) => row.reversingRecommended)).toBe(true);
      } else {
        expect(definition.journalLines.length).toBeGreaterThan(0);
      }
    }
  });

  it('closing-entry scenario uses mini-ledger to generate entries for all temp accounts', () => {
    const definition: CycleDecisionDefinition = cycleDecisionsFamily.generate(42, {
      scenarioKey: 'closing-entry',
      mode: 'guided_practice',
    });

    // Must have a miniLedger on the definition
    expect(definition.scenario.miniLedger).toBeDefined();

    const ledger = definition.scenario.miniLedger!;
    const revenueAccounts = ledger.accounts.filter((a) => a.accountType === 'revenue');
    const expenseAccounts = ledger.accounts.filter((a) => a.accountType === 'expense');

    // At least one revenue and one expense account
    expect(revenueAccounts.length).toBeGreaterThan(0);
    expect(expenseAccounts.length).toBeGreaterThan(0);

    // Journal lines: 2 per revenue + 2 per expense + 2 for dividends = (rev+exp+1)*2
    const expectedLineCount = (revenueAccounts.length + expenseAccounts.length + 1) * 2;
    expect(definition.journalLines.length).toBe(expectedLineCount);

    // Every revenue account should appear in the closing lines
    for (const acct of revenueAccounts) {
      expect(definition.journalLines.some((line) => line.accountId === acct.id)).toBe(true);
    }
    for (const acct of expenseAccounts) {
      expect(definition.journalLines.some((line) => line.accountId === acct.id)).toBe(true);
    }

    // Solve and grade should produce a perfect score
    const solution = cycleDecisionsFamily.solve(definition);
    const grade = cycleDecisionsFamily.grade(definition, solution);
    expect(grade.score).toBe(grade.maxScore);
  });

  it('scores reversing selections and accepts equivalent journal-entry order', () => {
    const selectionDefinition: CycleDecisionDefinition = cycleDecisionsFamily.generate(2026, {
      scenarioKey: 'reversing-selection',
      mode: 'assessment',
    });

    const selectionSolution = cycleDecisionsFamily.solve(selectionDefinition);
    const selectionStudentResponse: CycleDecisionResponse = {
      selections: {
        ...selectionSolution.selections,
        'accrued-wages': 'do-not-reverse',
      },
      lines: [],
    };
    const selectionGrade = cycleDecisionsFamily.grade(selectionDefinition, selectionStudentResponse);
    const selectionFeedback = buildCycleDecisionReviewFeedback(selectionDefinition, selectionStudentResponse, selectionGrade);

    expect(selectionGrade.score).toBeLessThan(selectionGrade.maxScore);
    expect(selectionFeedback['accrued-wages']).toMatchObject({
      status: 'incorrect',
      expectedLabel: 'reverse',
    });

    const closingDefinition: CycleDecisionDefinition = cycleDecisionsFamily.generate(2026, {
      scenarioKey: 'closing-entry',
      mode: 'assessment',
    });

    const closingSolution = cycleDecisionsFamily.solve(closingDefinition);
    const closingStudentResponse: CycleDecisionResponse = {
      selections: {},
      lines: [closingSolution.lines[1], closingSolution.lines[0], ...closingSolution.lines.slice(2)],
    };
    const closingGrade = cycleDecisionsFamily.grade(closingDefinition, closingStudentResponse);
    const closingFeedback = buildCycleDecisionReviewFeedback(closingDefinition, closingStudentResponse, closingGrade);
    const closingEnvelope = cycleDecisionsFamily.toEnvelope(closingDefinition, closingStudentResponse, closingGrade);

    expect(closingGrade.score).toBe(closingGrade.maxScore);
    expect(closingFeedback['line-1']).toMatchObject({
      status: 'partial',
      message: expect.stringContaining('Accepted equivalent ordering'),
    });
    expect(practiceSubmissionEnvelopeSchema.safeParse(closingEnvelope).success).toBe(true);
  });
});
