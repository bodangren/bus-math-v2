import { describe, expect, it } from 'vitest';

import { generateMiniLedger } from '@/lib/practice/engine/mini-ledger';

describe('mini-ledger generator', () => {
  it('is deterministic for the same seed and config', () => {
    const config = {
      accountCount: 11,
      includeContraAccounts: true,
      capitalMode: 'ending' as const,
      companyType: 'retail' as const,
    };

    expect(generateMiniLedger(42, config)).toEqual(generateMiniLedger(42, config));
  });

  it('balances the accounting equation and honors complexity controls', () => {
    const ledger = generateMiniLedger(17, {
      accountCount: 12,
      includeContraAccounts: true,
      capitalMode: 'beginning',
      companyType: 'service',
    });

    expect(ledger.accounts).toHaveLength(12);
    expect(ledger.capitalMode).toBe('beginning');
    expect(ledger.accounts.some((account) => account.contraOf)).toBe(true);
    expect(ledger.totals.netAssets).toBe(ledger.totals.liabilities + ledger.totals.endingCapital);
    expect(ledger.totals.endingCapital).toBe(ledger.totals.beginningCapital + ledger.totals.netIncome - ledger.totals.dividends);
    expect(ledger.totals.revenue - ledger.totals.expenses).toBe(ledger.totals.netIncome);
  });

  it('can omit contra accounts when requested', () => {
    const ledger = generateMiniLedger(9, {
      accountCount: 9,
      includeContraAccounts: false,
      capitalMode: 'ending',
      companyType: 'retail',
    });

    expect(ledger.accounts.some((account) => account.contraOf)).toBe(false);
  });
});
