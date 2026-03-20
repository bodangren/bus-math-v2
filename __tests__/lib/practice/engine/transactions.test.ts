import { describe, expect, it } from 'vitest';

import {
  buildTransactionEvent,
  generateTransactionEvent,
  listTransactionArchetypes,
} from '@/lib/practice/engine/transactions';

function totalDebits(lines: Array<{ debit: number }>) {
  return lines.reduce((sum, line) => sum + line.debit, 0);
}

function totalCredits(lines: Array<{ credit: number }>) {
  return lines.reduce((sum, line) => sum + line.credit, 0);
}

describe('transaction event library', () => {
  it('lists the canonical transaction archetypes and equity classifications', () => {
    const archetypes = listTransactionArchetypes();

    expect(archetypes.map((archetype) => archetype.id)).toEqual([
      'owner-invests-cash',
      'earn-revenue',
      'collect-receivable',
      'pay-payable',
      'pay-expense',
      'purchase-asset',
      'receive-advance',
      'owner-withdrawal',
    ]);
    expect(new Set(archetypes.map((archetype) => archetype.equityEffect))).toEqual(
      new Set(['increases', 'decreases', 'no-effect']),
    );
    expect(archetypes.every((archetype) => archetype.amountRule.length > 0)).toBe(true);
  });

  it('builds balanced contextual events with the expected account effects', () => {
    const serviceCashSale = buildTransactionEvent('earn-revenue', {
      amount: 1200,
      context: 'service',
      settlement: 'cash',
    });

    expect(serviceCashSale.effects.map((effect) => effect.accountId)).toEqual([
      'cash',
      'service-revenue',
    ]);
    expect(serviceCashSale.effects.map((effect) => effect.direction)).toEqual([
      'increase',
      'increase',
    ]);
    expect(totalDebits(serviceCashSale.journalLines)).toBe(totalCredits(serviceCashSale.journalLines));
    expect(serviceCashSale.equityEffect).toBe('increases');

    const merchandisePurchase = buildTransactionEvent('purchase-asset', {
      amount: 900,
      assetKind: 'inventory',
      context: 'merchandise',
      settlement: 'on-account',
    });

    expect(merchandisePurchase.effects.map((effect) => effect.accountId)).toEqual([
      'merchandise-inventory',
      'accounts-payable',
    ]);
    expect(totalDebits(merchandisePurchase.journalLines)).toBe(totalCredits(merchandisePurchase.journalLines));
    expect(merchandisePurchase.equityEffect).toBe('no-effect');
  });

  it('is deterministic when seeded through the generator helper', () => {
    const config = {
      context: 'merchandise' as const,
      settlement: 'on-account' as const,
      amount: 1500,
    };

    expect(generateTransactionEvent(17, config)).toEqual(generateTransactionEvent(17, config));
  });
});
