import { describe, expect, it } from 'vitest';

import { byNormalBalance, byStatement, byType, isContra, practiceAccounts } from '@/lib/practice/engine/accounts';

describe('practice engine accounts', () => {
  it('covers a broad accounting ontology with required metadata', () => {
    expect(practiceAccounts.length).toBeGreaterThanOrEqual(40);

    for (const account of practiceAccounts) {
      expect(account).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          label: expect.any(String),
          accountType: expect.stringMatching(/^(asset|liability|equity|revenue|expense)$/),
          normalBalance: expect.stringMatching(/^(debit|credit)$/),
          statementPlacement: expect.stringMatching(/^(balance-sheet|income-statement|equity-statement)$/),
          retailApplicable: expect.any(Boolean),
          subcategory: expect.any(String),
        }),
      );
    }
  });

  it('supports lookup helpers for type, statement, normal balance, and contra detection', () => {
    expect(byType('asset').some((account) => account.id === 'cash')).toBe(true);
    expect(byStatement('income-statement').some((account) => account.id === 'sales-revenue')).toBe(true);
    expect(byNormalBalance('credit').some((account) => account.id === 'service-revenue')).toBe(true);
    expect(isContra('allowance-for-doubtful-accounts')).toBe(true);
    expect(isContra(practiceAccounts.find((account) => account.id === 'cash')!)).toBe(false);
  });
});
