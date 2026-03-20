import { getAccountById, type PracticeAccount } from './accounts';

export type TransactionArchetypeId =
  | 'owner-invests-cash'
  | 'earn-revenue'
  | 'collect-receivable'
  | 'pay-payable'
  | 'pay-expense'
  | 'purchase-asset'
  | 'receive-advance'
  | 'owner-withdrawal';

export type TransactionContext = 'service' | 'merchandise';
export type TransactionSettlement = 'cash' | 'on-account';
export type TransactionAssetKind = 'supplies' | 'equipment' | 'inventory';
export type TransactionEquityEffect = 'increases' | 'decreases' | 'no-effect';
export type TransactionAmountRule = 'single-amount' | 'derived-amount' | 'paired-amount';
export type TransactionEffectDirection = 'increase' | 'decrease';
export type TransactionEntrySide = 'debit' | 'credit';

export interface TransactionArchetype {
  id: TransactionArchetypeId;
  label: string;
  amountRule: TransactionAmountRule;
  equityEffect: TransactionEquityEffect;
  affectedAccounts: readonly string[];
  description: string;
}

export interface TransactionEffect {
  role: string;
  accountId: string;
  label: string;
  accountType: PracticeAccount['accountType'];
  normalBalance: PracticeAccount['normalBalance'];
  direction: TransactionEffectDirection;
  side: TransactionEntrySide;
  amount: number;
}

export interface TransactionJournalLine {
  accountId: string;
  label: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface TransactionEvent {
  id: string;
  archetypeId: TransactionArchetypeId;
  title: string;
  narrative: string;
  context: TransactionContext;
  settlement?: TransactionSettlement;
  assetKind?: TransactionAssetKind;
  amount: number;
  equityEffect: TransactionEquityEffect;
  equityReason: string;
  effects: TransactionEffect[];
  journalLines: TransactionJournalLine[];
  tags: string[];
}

export interface TransactionBuildOptions {
  archetypeId?: TransactionArchetypeId;
  amount?: number;
  context?: TransactionContext;
  settlement?: TransactionSettlement;
  assetKind?: TransactionAssetKind;
  expenseAccountId?: string;
  seed?: number;
}

const AMOUNT_CHOICES = [250, 400, 600, 800, 1200, 1500, 2400, 3600] as const;

export const transactionArchetypeCatalog = [
  {
    id: 'owner-invests-cash',
    label: 'Owner invests cash',
    amountRule: 'single-amount',
    equityEffect: 'increases',
    affectedAccounts: ['Cash', "Common Stock"],
    description: 'Owner contributions bring cash into the business and raise equity.',
  },
  {
    id: 'earn-revenue',
    label: 'Earn revenue',
    amountRule: 'single-amount',
    equityEffect: 'increases',
    affectedAccounts: ['Cash or Accounts Receivable', 'Service Revenue or Sales Revenue'],
    description: 'The business earns revenue and receives cash or a receivable.',
  },
  {
    id: 'collect-receivable',
    label: 'Collect receivable',
    amountRule: 'single-amount',
    equityEffect: 'no-effect',
    affectedAccounts: ['Cash', 'Accounts Receivable'],
    description: 'Collecting an open receivable swaps one asset for another.',
  },
  {
    id: 'pay-payable',
    label: 'Pay payable',
    amountRule: 'single-amount',
    equityEffect: 'no-effect',
    affectedAccounts: ['Accounts Payable', 'Cash'],
    description: 'Paying a payable reduces both cash and the liability.',
  },
  {
    id: 'pay-expense',
    label: 'Pay expense',
    amountRule: 'single-amount',
    equityEffect: 'decreases',
    affectedAccounts: ['Expense account', 'Cash or Accounts Payable'],
    description: 'An expense lowers net income and therefore equity.',
  },
  {
    id: 'purchase-asset',
    label: 'Purchase asset',
    amountRule: 'single-amount',
    equityEffect: 'no-effect',
    affectedAccounts: ['Supplies, equipment, or merchandise inventory', 'Cash or Accounts Payable'],
    description: 'Buying an asset changes the asset mix and maybe a liability, but not equity directly.',
  },
  {
    id: 'receive-advance',
    label: 'Receive advance',
    amountRule: 'single-amount',
    equityEffect: 'no-effect',
    affectedAccounts: ['Cash', 'Unearned Revenue'],
    description: 'A customer advance increases cash and a liability until earned.',
  },
  {
    id: 'owner-withdrawal',
    label: 'Owner withdrawal',
    amountRule: 'single-amount',
    equityEffect: 'decreases',
    affectedAccounts: ['Withdrawals', 'Cash'],
    description: 'A withdrawal removes owner resources from the business.',
  },
] as const satisfies readonly TransactionArchetype[];

const transactionArchetypeById = new Map(transactionArchetypeCatalog.map((archetype) => [archetype.id, archetype]));

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

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

function resolveAccountId(role: string, options: TransactionBuildOptions, context: TransactionContext) {
  switch (role) {
    case 'cash':
      return 'cash';
    case 'receivable':
      return 'accounts-receivable';
    case 'payable':
      return 'accounts-payable';
    case 'revenue':
      return context === 'merchandise' ? 'sales-revenue' : 'service-revenue';
    case 'expense':
      return options.expenseAccountId ?? (context === 'merchandise' ? 'cost-of-goods-sold' : 'rent-expense');
    case 'asset': {
      const assetKind = options.assetKind ?? (context === 'merchandise' ? 'inventory' : 'supplies');
      if (assetKind === 'equipment') {
        return 'equipment';
      }
      if (assetKind === 'inventory') {
        return 'merchandise-inventory';
      }
      return 'supplies';
    }
    case 'equity':
      return 'common-stock';
    case 'withdrawals':
      return 'withdrawals';
    case 'unearned-revenue':
      return 'unearned-revenue';
    default:
      throw new Error(`Unsupported transaction role: ${role}`);
  }
}

function buildEffect(
  role: string,
  direction: TransactionEffectDirection,
  amount: number,
  options: TransactionBuildOptions,
  context: TransactionContext,
): TransactionEffect {
  const accountId = resolveAccountId(role, options, context);
  const account = getAccountById(accountId);

  if (!account) {
    throw new Error(`Unknown transaction account: ${accountId}`);
  }

  const side =
    direction === 'increase'
      ? account.normalBalance === 'debit'
        ? 'debit'
        : 'credit'
      : account.normalBalance === 'debit'
        ? 'credit'
        : 'debit';

  return {
    role,
    accountId,
    label: account.label,
    accountType: account.accountType,
    normalBalance: account.normalBalance,
    direction,
    side,
    amount,
  };
}

function buildJournalLines(effects: TransactionEffect[], memo: string): TransactionJournalLine[] {
  return effects.map((effect) => ({
    accountId: effect.accountId,
    label: effect.label,
    debit: effect.side === 'debit' ? effect.amount : 0,
    credit: effect.side === 'credit' ? effect.amount : 0,
    memo,
  }));
}

function buildEventBase(args: {
  archetypeId: TransactionArchetypeId;
  title: string;
  narrative: string;
  context: TransactionContext;
  amount: number;
  equityEffect: TransactionEquityEffect;
  equityReason: string;
  effects: TransactionEffect[];
  settlement?: TransactionSettlement;
  assetKind?: TransactionAssetKind;
  tags?: string[];
}): TransactionEvent {
  const suffix = [args.context, args.settlement, args.assetKind, args.amount].filter(Boolean).join('-');

  return {
    id: `${args.archetypeId}-${suffix}`,
    archetypeId: args.archetypeId,
    title: args.title,
    narrative: args.narrative,
    context: args.context,
    settlement: args.settlement,
    assetKind: args.assetKind,
    amount: args.amount,
    equityEffect: args.equityEffect,
    equityReason: args.equityReason,
    effects: args.effects,
    journalLines: buildJournalLines(args.effects, args.narrative),
    tags: args.tags ?? [],
  };
}

function buildOwnerInvestment(amount: number, context: TransactionContext, options: TransactionBuildOptions) {
  const effects = [
    buildEffect('cash', 'increase', amount, options, context),
    buildEffect('equity', 'increase', amount, options, context),
  ];

  return buildEventBase({
    archetypeId: 'owner-invests-cash',
    title: 'Owner invests cash',
    narrative: `The owner invests $${formatAmount(amount)} cash in the business.`,
    context,
    amount,
    equityEffect: 'increases',
    equityReason: 'Owner contributions increase the owner claim on the business.',
    effects,
    tags: ['capital-contribution', context],
  });
}

function buildRevenueEvent(amount: number, context: TransactionContext, settlement: TransactionSettlement, options: TransactionBuildOptions) {
  const revenueEffect = buildEffect('revenue', 'increase', amount, options, context);
  const offsetRole = settlement === 'cash' ? 'cash' : 'receivable';
  const offsetEffect = buildEffect(offsetRole, 'increase', amount, options, context);
  const revenueLabel = revenueEffect.label;

  return buildEventBase({
    archetypeId: 'earn-revenue',
    title: 'Earn revenue',
    narrative:
      settlement === 'cash'
        ? `The business earns $${formatAmount(amount)} of ${context === 'merchandise' ? 'sales' : 'service'} revenue and receives cash.`
        : `The business earns $${formatAmount(amount)} of ${context === 'merchandise' ? 'sales' : 'service'} revenue on account.`,
    context,
    settlement,
    amount,
    equityEffect: 'increases',
    equityReason: 'Earned revenue increases net income and therefore owner equity.',
    effects: [offsetEffect, revenueEffect],
    tags: ['revenue', settlement, context, revenueLabel.toLowerCase()],
  });
}

function buildCollectReceivable(amount: number, context: TransactionContext, options: TransactionBuildOptions) {
  const effects = [
    buildEffect('cash', 'increase', amount, options, context),
    buildEffect('receivable', 'decrease', amount, options, context),
  ];

  return buildEventBase({
    archetypeId: 'collect-receivable',
    title: 'Collect receivable',
    narrative: `The business collects $${formatAmount(amount)} from a customer who previously owed on account.`,
    context,
    amount,
    equityEffect: 'no-effect',
    equityReason: 'Collecting a receivable exchanges one asset for another without changing equity.',
    effects,
    tags: ['receivable-collection', context],
  });
}

function buildPayPayable(amount: number, context: TransactionContext, options: TransactionBuildOptions) {
  const effects = [
    buildEffect('payable', 'decrease', amount, options, context),
    buildEffect('cash', 'decrease', amount, options, context),
  ];

  return buildEventBase({
    archetypeId: 'pay-payable',
    title: 'Pay payable',
    narrative: `The business pays $${formatAmount(amount)} on an outstanding payable.`,
    context,
    amount,
    equityEffect: 'no-effect',
    equityReason: 'Paying a payable reduces a liability and cash by the same amount.',
    effects,
    tags: ['liability-payment', context],
  });
}

function buildPayExpense(
  amount: number,
  context: TransactionContext,
  settlement: TransactionSettlement,
  options: TransactionBuildOptions,
) {
  const effects = [
    buildEffect('expense', 'increase', amount, options, context),
    buildEffect(settlement === 'cash' ? 'cash' : 'payable', settlement === 'cash' ? 'decrease' : 'increase', amount, options, context),
  ];

  const expenseAccountId = resolveAccountId('expense', options, context);

  return buildEventBase({
    archetypeId: 'pay-expense',
    title: 'Pay expense',
    narrative:
      settlement === 'cash'
        ? `The business pays $${formatAmount(amount)} for ${getAccountById(expenseAccountId)?.label ?? 'an expense'}.`
        : `The business records $${formatAmount(amount)} of ${getAccountById(expenseAccountId)?.label ?? 'an expense'} on account.`,
    context,
    settlement,
    amount,
    equityEffect: 'decreases',
    equityReason: 'Expenses reduce net income, which reduces owner equity.',
    effects,
    tags: ['expense', settlement, context, expenseAccountId],
  });
}

function buildPurchaseAsset(
  amount: number,
  context: TransactionContext,
  settlement: TransactionSettlement,
  assetKind: TransactionAssetKind,
  options: TransactionBuildOptions,
) {
  const effects = [
    buildEffect('asset', 'increase', amount, { ...options, assetKind }, context),
    buildEffect(settlement === 'cash' ? 'cash' : 'payable', settlement === 'cash' ? 'decrease' : 'increase', amount, options, context),
  ];

  const assetAccountId = resolveAccountId('asset', { ...options, assetKind }, context);

  return buildEventBase({
    archetypeId: 'purchase-asset',
    title: 'Purchase asset',
    narrative:
      settlement === 'cash'
        ? `The business buys ${getAccountById(assetAccountId)?.label ?? 'an asset'} for $${formatAmount(amount)} cash.`
        : `The business buys ${getAccountById(assetAccountId)?.label ?? 'an asset'} for $${formatAmount(amount)} on account.`,
    context,
    settlement,
    assetKind,
    amount,
    equityEffect: 'no-effect',
    equityReason: 'Buying an asset changes the asset mix and maybe a liability, but does not change equity directly.',
    effects,
    tags: ['asset-purchase', settlement, context, assetKind],
  });
}

function buildReceiveAdvance(amount: number, context: TransactionContext, options: TransactionBuildOptions) {
  const effects = [
    buildEffect('cash', 'increase', amount, options, context),
    buildEffect('unearned-revenue', 'increase', amount, options, context),
  ];

  return buildEventBase({
    archetypeId: 'receive-advance',
    title: 'Receive advance',
    narrative: `The business receives a $${formatAmount(amount)} customer advance before earning the revenue.`,
    context,
    amount,
    equityEffect: 'no-effect',
    equityReason: 'A customer advance creates a liability until the service is earned.',
    effects,
    tags: ['advance', context],
  });
}

function buildOwnerWithdrawal(amount: number, context: TransactionContext, options: TransactionBuildOptions) {
  const effects = [
    buildEffect('withdrawals', 'increase', amount, options, context),
    buildEffect('cash', 'decrease', amount, options, context),
  ];

  return buildEventBase({
    archetypeId: 'owner-withdrawal',
    title: 'Owner withdrawal',
    narrative: `The owner withdraws $${formatAmount(amount)} cash from the business.`,
    context,
    amount,
    equityEffect: 'decreases',
    equityReason: 'Withdrawals reduce owner equity because they remove resources without earning revenue.',
    effects,
    tags: ['withdrawal', context],
  });
}

export function listTransactionArchetypes() {
  return transactionArchetypeCatalog;
}

export function getTransactionArchetype(archetypeId: TransactionArchetypeId) {
  return transactionArchetypeById.get(archetypeId) ?? null;
}

export function buildTransactionEvent(
  archetypeId: TransactionArchetypeId,
  options: TransactionBuildOptions = {},
): TransactionEvent {
  const context: TransactionContext = options.context ?? 'service';
  const rng = mulberry32(options.seed ?? 0x5f5f5f5f);
  const amount = options.amount ?? pick(AMOUNT_CHOICES, rng);

  switch (archetypeId) {
    case 'owner-invests-cash':
      return buildOwnerInvestment(amount, context, options);
    case 'earn-revenue':
      return buildRevenueEvent(amount, context, options.settlement ?? 'cash', options);
    case 'collect-receivable':
      return buildCollectReceivable(amount, context, options);
    case 'pay-payable':
      return buildPayPayable(amount, context, options);
    case 'pay-expense':
      return buildPayExpense(amount, context, options.settlement ?? 'cash', options);
    case 'purchase-asset':
      return buildPurchaseAsset(amount, context, options.settlement ?? 'cash', options.assetKind ?? 'supplies', options);
    case 'receive-advance':
      return buildReceiveAdvance(amount, context, options);
    case 'owner-withdrawal':
      return buildOwnerWithdrawal(amount, context, options);
    default:
      throw new Error(`Unknown transaction archetype: ${archetypeId}`);
  }
}

export function generateTransactionEvent(seed: number, options: TransactionBuildOptions = {}) {
  const rng = mulberry32(seed);
  const archetypeId = options.archetypeId ?? pick(transactionArchetypeCatalog, rng).id;
  const generatedOptions: TransactionBuildOptions = {
    ...options,
    seed,
    amount: options.amount ?? pick(AMOUNT_CHOICES, rng),
    context: options.context ?? (rng() > 0.5 ? 'service' : 'merchandise'),
  };

  if (generatedOptions.settlement === undefined && (archetypeId === 'earn-revenue' || archetypeId === 'pay-expense' || archetypeId === 'purchase-asset')) {
    generatedOptions.settlement = rng() > 0.5 ? 'cash' : 'on-account';
  }

  if (generatedOptions.assetKind === undefined && archetypeId === 'purchase-asset') {
    generatedOptions.assetKind = pick(['supplies', 'equipment', 'inventory'] as const, rng);
  }

  if (generatedOptions.expenseAccountId === undefined && archetypeId === 'pay-expense') {
    generatedOptions.expenseAccountId = pick(['rent-expense', 'utilities-expense', 'supplies-expense', 'insurance-expense'] as const, rng);
  }

  return buildTransactionEvent(archetypeId, {
    ...generatedOptions,
  });
}
