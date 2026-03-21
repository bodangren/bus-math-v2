import { describe, expect, it } from 'vitest';

import {
  generateMerchandisingTimeline,
  solveMerchandisingTimeline,
} from '@/lib/practice/engine/merchandising';

function balanceCheck(lines: Array<{ debit: number; credit: number }>) {
  const debitTotal = lines.reduce((sum, line) => sum + line.debit, 0);
  const creditTotal = lines.reduce((sum, line) => sum + line.credit, 0);
  return debitTotal === creditTotal;
}

describe('merchandising timeline generator', () => {
  it('builds seller and buyer timelines that honor discount timing and freight allocation', () => {
    const seller = generateMerchandisingTimeline(9, {
      role: 'seller',
      discountMethod: 'gross',
      paymentTiming: 'within-discount-period',
      fobCondition: 'destination',
      saleAmount: 1000,
      costAmount: 600,
      returnAmount: 100,
      discountRate: 0.1,
      freightAmount: 40,
    });

    expect(seller.events.map((event) => event.kind)).toEqual([
      'original-sale',
      'return',
      'freight',
      'collection',
    ]);
    expect(seller.events.some((event) => event.journalLines.some((line) => line.accountId === 'sales-discounts'))).toBe(true);
    expect(seller.events.some((event) => event.journalLines.some((line) => line.accountId === 'freight-out'))).toBe(true);

    const sellerSolution = solveMerchandisingTimeline(seller);
    expect(balanceCheck(sellerSolution.journalLines)).toBe(true);

    const buyer = generateMerchandisingTimeline(12, {
      role: 'buyer',
      discountMethod: 'net',
      paymentTiming: 'after-discount-period',
      fobCondition: 'shipping-point',
      saleAmount: 1500,
      costAmount: 900,
      returnAmount: 150,
      discountRate: 0.05,
      freightAmount: 35,
    });

    expect(buyer.events.some((event) => event.journalLines.some((line) => line.accountId === 'freight-in'))).toBe(true);
    expect(buyer.events.some((event) => event.journalLines.some((line) => line.accountId === 'sales-discounts'))).toBe(false);

    const buyerSolution = solveMerchandisingTimeline(buyer);
    expect(balanceCheck(buyerSolution.journalLines)).toBe(true);
  });

  it('keeps returns before payment and reduces the cash amount accordingly', () => {
    const definition = generateMerchandisingTimeline(3, {
      role: 'seller',
      discountMethod: 'gross',
      paymentTiming: 'within-discount-period',
      fobCondition: 'destination',
      saleAmount: 1000,
      costAmount: 600,
      returnAmount: 200,
      discountRate: 0.1,
      freightAmount: 0,
    });

    const returnEvent = definition.events.find((event) => event.kind === 'return');
    const paymentEvent = definition.events.find((event) => event.kind === 'collection');

    expect(returnEvent).toBeDefined();
    expect(paymentEvent).toBeDefined();
    expect(returnEvent!.date < paymentEvent!.date).toBe(true);
    expect(paymentEvent?.journalLines.find((line) => line.accountId === 'cash')?.debit).toBe(720);
  });

  it('is deterministic for the same seed and config', () => {
    const config = {
      role: 'buyer' as const,
      discountMethod: 'gross' as const,
      paymentTiming: 'after-discount-period' as const,
      fobCondition: 'shipping-point' as const,
      saleAmount: 1400,
      costAmount: 800,
      returnAmount: 120,
      discountRate: 0.05,
      freightAmount: 20,
    };

    expect(generateMerchandisingTimeline(27, config)).toEqual(generateMerchandisingTimeline(27, config));
  });
});
