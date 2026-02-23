import { describe, expect, it } from 'vitest';

import { evaluateFormula } from '@/lib/curriculum/formula-evaluator';

describe('curriculum/formula-evaluator', () => {
  it('handles basic arithmetic', () => {
    const result = evaluateFormula('cash - liabilities', {
      cash: 10000,
      liabilities: 4000,
    });

    expect(result).toBe(6000);
  });

  it('handles multi-step formulas', () => {
    const result = evaluateFormula('assets - liabilities - equity', {
      assets: 18000,
      liabilities: 7000,
      equity: 2000,
    });

    expect(result).toBe(9000);
  });

  it('supports division and percentages', () => {
    const result = evaluateFormula('correct / total * 100', {
      correct: 17,
      total: 20,
    });

    expect(result).toBe(85);
  });

  it('throws for division by zero', () => {
    expect(() => evaluateFormula('assets / liabilities', { assets: 10, liabilities: 0 })).toThrow();
  });

  it('throws for unknown parameters', () => {
    expect(() => evaluateFormula('assets - liabilities', { assets: 10 })).toThrow();
  });
});
