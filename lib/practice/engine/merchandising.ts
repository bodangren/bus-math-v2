import { getAccountById } from './accounts';

export type MerchandisingRole = 'seller' | 'buyer';
export type MerchandisingDiscountMethod = 'gross' | 'net';
export type MerchandisingPaymentTiming = 'within-discount-period' | 'after-discount-period';
export type MerchandisingFobCondition = 'shipping-point' | 'destination';
export type MerchandisingInventorySystem = 'perpetual';

export interface MerchandisingTimelineConfig {
  role?: MerchandisingRole;
  inventorySystem?: MerchandisingInventorySystem;
  discountMethod?: MerchandisingDiscountMethod;
  paymentTiming?: MerchandisingPaymentTiming;
  fobCondition?: MerchandisingFobCondition;
  saleAmount?: number;
  costAmount?: number;
  discountRate?: number;
  returnAmount?: number;
  freightAmount?: number;
  seed?: number;
}

export interface MerchandisingJournalLine {
  date: string;
  accountId: string;
  label: string;
  debit: number;
  credit: number;
  memo: string;
  eventId: string;
}

export interface MerchandisingTimelineEvent {
  id: string;
  kind: 'original-sale' | 'original-purchase' | 'return' | 'freight' | 'collection';
  date: string;
  narrative: string;
  journalLines: MerchandisingJournalLine[];
  tags: string[];
}

export interface MerchandisingTimelineDefinition {
  seed: number;
  role: MerchandisingRole;
  inventorySystem: MerchandisingInventorySystem;
  discountMethod: MerchandisingDiscountMethod;
  paymentTiming: MerchandisingPaymentTiming;
  fobCondition: MerchandisingFobCondition;
  saleAmount: number;
  costAmount: number;
  discountRate: number;
  returnAmount: number;
  freightAmount: number;
  events: MerchandisingTimelineEvent[];
}

export interface MerchandisingTimelineSolution {
  journalLines: MerchandisingJournalLine[];
}

const GROSS_DISCOUNT_RATES = [0.02, 0.05, 0.1] as const;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng: () => number, min: number, max: number) {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  if (upper <= lower) {
    return lower;
  }

  return Math.floor(rng() * (upper - lower + 1)) + lower;
}

function pick<T>(items: readonly T[], rng: () => number) {
  return items[randomInt(rng, 0, items.length - 1)];
}

function addDays(baseDate: string, offset: number) {
  const date = new Date(`${baseDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

function resolveSide(accountId: string, direction: 'increase' | 'decrease') {
  const account = getAccountById(accountId);
  if (!account) {
    throw new Error(`Unknown merchandising account: ${accountId}`);
  }

  return direction === 'increase'
    ? account.normalBalance === 'debit'
      ? 'debit'
      : 'credit'
    : account.normalBalance === 'debit'
      ? 'credit'
      : 'debit';
}

function line(
  date: string,
  eventId: string,
  accountId: string,
  direction: 'increase' | 'decrease',
  amount: number,
  memo: string,
): MerchandisingJournalLine {
  const account = getAccountById(accountId);
  if (!account) {
    throw new Error(`Unknown merchandising account: ${accountId}`);
  }

  const side = resolveSide(accountId, direction);

  return {
    date,
    eventId,
    accountId,
    label: account.label,
    debit: side === 'debit' ? amount : 0,
    credit: side === 'credit' ? amount : 0,
    memo,
  };
}

function buildEvent(
  event: MerchandisingTimelineEvent,
  journalLines: MerchandisingJournalLine[],
): MerchandisingTimelineEvent {
  return {
    ...event,
    journalLines,
  };
}

function buildSellerTimeline(definition: Omit<MerchandisingTimelineDefinition, 'events'>) {
  const saleDate = '2026-03-01';
  const returnDate = addDays(saleDate, 1);
  const freightDate = addDays(saleDate, 2);
  const collectionDate = definition.paymentTiming === 'within-discount-period' ? addDays(saleDate, 8) : addDays(saleDate, 14);
  const baseAmount = definition.discountMethod === 'gross' ? definition.saleAmount : Math.round(definition.saleAmount * (1 - definition.discountRate));
  const returnBasis = definition.discountMethod === 'gross' ? definition.returnAmount : Math.round(definition.returnAmount * (1 - definition.discountRate));
  const dueAfterReturn = Math.max(0, baseAmount - returnBasis);
  const discountEligible = definition.discountMethod === 'gross' && definition.paymentTiming === 'within-discount-period';
  const discountAmount = discountEligible ? Math.round(dueAfterReturn * definition.discountRate) : 0;
  const cashCollected = dueAfterReturn - discountAmount;
  const returnedCost = definition.saleAmount === 0 ? 0 : Math.round((definition.returnAmount / definition.saleAmount) * definition.costAmount);

  const events: MerchandisingTimelineEvent[] = [];

  events.push(
    buildEvent(
      {
        id: 'seller-original-sale',
        kind: 'original-sale',
        date: saleDate,
        narrative:
          definition.discountMethod === 'gross'
            ? `Record the $${formatAmount(definition.saleAmount)} sale on account and the related cost of goods sold.`
            : `Record the sale at the net amount of $${formatAmount(baseAmount)} and the related cost of goods sold.`,
        journalLines: [],
        tags: ['seller', 'original-sale'],
      },
      [
        line(
          saleDate,
          'seller-original-sale',
          'accounts-receivable',
          'increase',
          baseAmount,
          'Record the sale receivable.',
        ),
        line(
          saleDate,
          'seller-original-sale',
          'sales-revenue',
          'increase',
          baseAmount,
          'Record the sale revenue.',
        ),
        line(
          saleDate,
          'seller-original-sale',
          'cost-of-goods-sold',
          'increase',
          definition.costAmount,
          'Record the cost of goods sold.',
        ),
        line(
          saleDate,
          'seller-original-sale',
          'merchandise-inventory',
          'decrease',
          definition.costAmount,
          'Reduce inventory for the goods sold.',
        ),
      ],
    ),
  );

  if (definition.returnAmount > 0) {
    events.push(
      buildEvent(
        {
          id: 'seller-return',
          kind: 'return',
          date: returnDate,
          narrative: `Record the ${definition.discountMethod === 'gross' ? '' : 'net '}return before collection.`,
          journalLines: [],
          tags: ['seller', 'return'],
        },
        [
          line(
            returnDate,
            'seller-return',
            'sales-returns-and-allowances',
            'increase',
            returnBasis,
            'Record the sales return or allowance.',
          ),
          line(
            returnDate,
            'seller-return',
            'accounts-receivable',
            'decrease',
            returnBasis,
            'Reduce the receivable for the return.',
          ),
          line(
            returnDate,
            'seller-return',
            'merchandise-inventory',
            'increase',
            returnedCost,
            'Restore returned inventory at cost.',
          ),
          line(
            returnDate,
            'seller-return',
            'cost-of-goods-sold',
            'decrease',
            returnedCost,
            'Reverse the cost of goods sold for the returned items.',
          ),
        ],
      ),
    );
  }

  if (definition.freightAmount > 0 && definition.fobCondition === 'destination') {
    events.push(
      buildEvent(
        {
          id: 'seller-freight',
          kind: 'freight',
          date: freightDate,
          narrative: 'The seller pays freight because the terms are FOB destination.',
          journalLines: [],
          tags: ['seller', 'freight', 'destination'],
        },
        [
          line(
            freightDate,
            'seller-freight',
            'freight-out',
            'increase',
            definition.freightAmount,
            'Record freight out.',
          ),
          line(
            freightDate,
            'seller-freight',
            'cash',
            'decrease',
            definition.freightAmount,
            'Pay freight in cash.',
          ),
        ],
      ),
    );
  }

  events.push(
    buildEvent(
      {
        id: 'seller-collection',
        kind: 'collection',
        date: collectionDate,
        narrative:
          definition.discountMethod === 'gross'
            ? definition.paymentTiming === 'within-discount-period'
              ? 'Collect the receivable with the sales discount taken.'
              : 'Collect the receivable after the discount period.'
            : 'Collect the receivable at the net amount.',
        journalLines: [],
        tags: ['seller', 'collection'],
      },
      [
        line(collectionDate, 'seller-collection', 'cash', 'increase', cashCollected, 'Collect the receivable in cash.'),
        ...(discountAmount > 0
          ? [
              line(
                collectionDate,
                'seller-collection',
                'sales-discounts',
                'increase',
                discountAmount,
                'Record the cash discount.',
              ),
            ]
          : []),
        line(
          collectionDate,
          'seller-collection',
          'accounts-receivable',
          'decrease',
          dueAfterReturn,
          'Clear the receivable.',
        ),
      ],
    ),
  );

  return {
    ...definition,
    events,
  };
}

function buildBuyerTimeline(definition: Omit<MerchandisingTimelineDefinition, 'events'>) {
  const purchaseDate = '2026-03-01';
  const returnDate = addDays(purchaseDate, 1);
  const freightDate = addDays(purchaseDate, 2);
  const paymentDate = definition.paymentTiming === 'within-discount-period' ? addDays(purchaseDate, 8) : addDays(purchaseDate, 14);
  const baseAmount = definition.discountMethod === 'gross' ? definition.saleAmount : Math.round(definition.saleAmount * (1 - definition.discountRate));
  const returnBasis = definition.discountMethod === 'gross' ? definition.returnAmount : Math.round(definition.returnAmount * (1 - definition.discountRate));
  const dueAfterReturn = Math.max(0, baseAmount - returnBasis);
  const discountEligible = definition.discountMethod === 'gross' && definition.paymentTiming === 'within-discount-period';
  const discountAmount = discountEligible ? Math.round(dueAfterReturn * definition.discountRate) : 0;
  const cashPaid = dueAfterReturn - discountAmount;

  const events: MerchandisingTimelineEvent[] = [];

  events.push(
    buildEvent(
      {
        id: 'buyer-original-purchase',
        kind: 'original-purchase',
        date: purchaseDate,
        narrative:
          definition.discountMethod === 'gross'
            ? `Record the $${formatAmount(definition.saleAmount)} purchase on account and the related inventory cost.`
            : `Record the purchase at the net amount of $${formatAmount(baseAmount)} and the related inventory cost.`,
        journalLines: [],
        tags: ['buyer', 'original-purchase'],
      },
      [
        line(
          purchaseDate,
          'buyer-original-purchase',
          'merchandise-inventory',
          'increase',
          baseAmount,
          'Record the inventory purchase.',
        ),
        line(
          purchaseDate,
          'buyer-original-purchase',
          'accounts-payable',
          'increase',
          baseAmount,
          'Record the payable for the purchase.',
        ),
      ],
    ),
  );

  if (definition.returnAmount > 0) {
    events.push(
      buildEvent(
        {
          id: 'buyer-return',
          kind: 'return',
          date: returnDate,
          narrative: `Record the return before payment.`,
          journalLines: [],
          tags: ['buyer', 'return'],
        },
        [
          line(
            returnDate,
            'buyer-return',
            'accounts-payable',
            'decrease',
            returnBasis,
            'Reduce the payable for the returned goods.',
          ),
          line(
            returnDate,
            'buyer-return',
            'merchandise-inventory',
            'decrease',
            returnBasis,
            'Remove returned inventory from the purchase record.',
          ),
        ],
      ),
    );
  }

  if (definition.freightAmount > 0 && definition.fobCondition === 'shipping-point') {
    events.push(
      buildEvent(
        {
          id: 'buyer-freight',
          kind: 'freight',
          date: freightDate,
          narrative: 'The buyer pays freight because the terms are FOB shipping point.',
          journalLines: [],
          tags: ['buyer', 'freight', 'shipping-point'],
        },
        [
          line(
            freightDate,
            'buyer-freight',
            'freight-in',
            'increase',
            definition.freightAmount,
            'Record freight in.',
          ),
          line(
            freightDate,
            'buyer-freight',
            'cash',
            'decrease',
            definition.freightAmount,
            'Pay freight in cash.',
          ),
        ],
      ),
    );
  }

  events.push(
    buildEvent(
      {
        id: 'buyer-payment',
        kind: 'collection',
        date: paymentDate,
        narrative:
          definition.discountMethod === 'gross'
            ? definition.paymentTiming === 'within-discount-period'
              ? 'Pay the supplier within the discount period.'
              : 'Pay the supplier after the discount period.'
            : 'Pay the supplier at the net amount.',
        journalLines: [],
        tags: ['buyer', 'payment'],
      },
      [
        line(paymentDate, 'buyer-payment', 'accounts-payable', 'decrease', dueAfterReturn, 'Clear the payable.'),
        ...(discountAmount > 0
          ? [
              line(
                paymentDate,
                'buyer-payment',
                'merchandise-inventory',
                'decrease',
                discountAmount,
                'Reduce inventory for the cash discount.',
              ),
            ]
          : []),
        line(paymentDate, 'buyer-payment', 'cash', 'decrease', cashPaid, 'Pay the supplier in cash.'),
      ],
    ),
  );

  return {
    ...definition,
    events,
  };
}

export function generateMerchandisingTimeline(
  seed: number,
  config: MerchandisingTimelineConfig = {},
): MerchandisingTimelineDefinition {
  const rng = mulberry32(seed);
  const role = config.role ?? (rng() > 0.5 ? 'seller' : 'buyer');
  const inventorySystem = config.inventorySystem ?? 'perpetual';
  const discountMethod = config.discountMethod ?? (rng() > 0.5 ? 'gross' : 'net');
  const paymentTiming = config.paymentTiming ?? (rng() > 0.5 ? 'within-discount-period' : 'after-discount-period');
  const fobCondition = config.fobCondition ?? (rng() > 0.5 ? 'shipping-point' : 'destination');
  const saleAmount = config.saleAmount ?? pick([900, 1200, 1500, 1800, 2400], rng);
  const costAmount = config.costAmount ?? Math.round(saleAmount * 0.6);
  const discountRate = config.discountRate ?? pick(GROSS_DISCOUNT_RATES, rng);
  const returnAmount = config.returnAmount ?? Math.round(saleAmount * 0.1);
  const freightAmount = config.freightAmount ?? pick([0, 25, 35, 45, 60], rng);

  const baseDefinition: Omit<MerchandisingTimelineDefinition, 'events'> = {
    seed,
    role,
    inventorySystem,
    discountMethod,
    paymentTiming,
    fobCondition,
    saleAmount,
    costAmount,
    discountRate,
    returnAmount,
    freightAmount,
  };

  return role === 'seller' ? buildSellerTimeline(baseDefinition) : buildBuyerTimeline(baseDefinition);
}

export function solveMerchandisingTimeline(definition: MerchandisingTimelineDefinition): MerchandisingTimelineSolution {
  const journalLines = definition.events
    .flatMap((event) => event.journalLines)
    .sort((left, right) => {
      if (left.date !== right.date) {
        return left.date.localeCompare(right.date);
      }

      if (left.eventId !== right.eventId) {
        return left.eventId.localeCompare(right.eventId);
      }

      if (left.debit !== right.debit) {
        return right.debit - left.debit;
      }

      return left.accountId.localeCompare(right.accountId);
    });

  return {
    journalLines,
  };
}
