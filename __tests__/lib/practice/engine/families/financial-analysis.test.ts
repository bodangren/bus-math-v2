import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildFinancialAnalysisReviewFeedback,
  financialAnalysisFamily,
  type FinancialAnalysisDefinition,
  type FinancialAnalysisResponse,
} from '@/lib/practice/engine/families/financial-analysis';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('financial analysis family', () => {
  it('generates deterministic ratio analysis scenarios across all variants', () => {
    const family: ProblemFamily<
      FinancialAnalysisDefinition,
      FinancialAnalysisResponse,
      Parameters<typeof financialAnalysisFamily.generate>[1]
    > = financialAnalysisFamily;

    for (const variant of ['profitability', 'liquidity', 'leverage'] as const) {
      for (let seed = 1; seed <= 3; seed += 1) {
        const config = { mode: 'guided_practice' as const, variant };
        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('financial-analysis');
        expect(definition.variant).toBe(variant);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.miniLedger).toBeDefined();
      }
    }
  });

  it('solves and grades correctly, and round-trips the envelope', () => {
    const definition = financialAnalysisFamily.generate(2026, {
      mode: 'assessment',
      variant: 'profitability',
      tolerance: 0.01,
    });

    const solution = financialAnalysisFamily.solve(definition);
    const grade = financialAnalysisFamily.grade(definition, solution);
    expect(grade.score).toBe(grade.maxScore);

    // Wrong answer
    const wrongResponse: FinancialAnalysisResponse = { ...solution };
    const firstKey = Object.keys(wrongResponse)[0];
    wrongResponse[firstKey] = (wrongResponse[firstKey] ?? 0) + 50;
    const wrongGrade = financialAnalysisFamily.grade(definition, wrongResponse);
    expect(wrongGrade.score).toBeLessThan(wrongGrade.maxScore);

    const reviewed = buildFinancialAnalysisReviewFeedback(definition, wrongResponse, wrongGrade);
    expect(reviewed[firstKey]).toMatchObject({ status: 'incorrect' });

    const envelope = financialAnalysisFamily.toEnvelope(definition, solution, grade);
    expect(practiceSubmissionEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it('uses mini-ledger totals for ratio computations', () => {
    const definition = financialAnalysisFamily.generate(42, { variant: 'profitability' });
    const ledger = definition.miniLedger;

    // Profit margin = net income / revenue
    const expectedProfitMargin = Math.round((ledger.totals.netIncome / ledger.totals.revenue) * 10000) / 10000;
    const solution = financialAnalysisFamily.solve(definition);
    expect(solution['profit-margin']).toBe(expectedProfitMargin);
  });
});
