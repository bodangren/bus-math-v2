import { type TransactionArchetypeId, type TransactionEvent } from '@/lib/practice/engine/transactions';

export type TransactionDirection = 'increase' | 'decrease' | 'no-effect';

export type TransactionReasonId =
  | 'owner-contribution'
  | 'earned-revenue'
  | 'asset-exchange'
  | 'liability-settlement'
  | 'expense-recognition'
  | 'customer-advance'
  | 'owner-withdrawal';

export interface TransactionReasonChoice {
  id: TransactionReasonId;
  label: string;
  description: string;
}

export const transactionDirectionColumns = [
  { id: 'increase', label: 'Increase', description: 'The balance goes up' },
  { id: 'decrease', label: 'Decrease', description: 'The balance goes down' },
  { id: 'no-effect', label: 'No effect', description: 'The category does not change' },
] as const;

export const transactionReasonColumns = [
  { id: 'owner-contribution', label: 'Owner contribution', description: 'Capital invested by the owner' },
  { id: 'earned-revenue', label: 'Earned revenue', description: 'Revenue was earned or collected' },
  { id: 'asset-exchange', label: 'Asset exchange', description: 'One asset changed into another' },
  { id: 'liability-settlement', label: 'Liability settlement', description: 'A payable was cleared' },
  { id: 'expense-recognition', label: 'Expense recognition', description: 'A period cost was recorded' },
  { id: 'customer-advance', label: 'Customer advance', description: 'Cash was received before earning' },
  { id: 'owner-withdrawal', label: 'Owner withdrawal', description: 'Owner cash left the business' },
] as const satisfies readonly TransactionReasonChoice[];

export function buildTransactionReasonChoice(event: TransactionEvent): TransactionReasonChoice {
  switch (event.archetypeId) {
    case 'owner-invests-cash':
      return transactionReasonColumns[0];
    case 'earn-revenue':
      return transactionReasonColumns[1];
    case 'collect-receivable':
      return transactionReasonColumns[2];
    case 'pay-payable':
      return transactionReasonColumns[3];
    case 'pay-expense':
      return transactionReasonColumns[4];
    case 'purchase-asset':
      return transactionReasonColumns[2];
    case 'receive-advance':
      return transactionReasonColumns[5];
    case 'owner-withdrawal':
      return transactionReasonColumns[6];
    default:
      return transactionReasonColumns[1];
  }
}

export function buildAccountEffectSummary(event: TransactionEvent, accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') {
  const effects = event.effects.filter((effect) => effect.accountType === accountType);
  if (!effects.length) {
    return 'no-effect' as TransactionDirection;
  }

  const total = effects.reduce((sum, effect) => {
    return sum + (effect.direction === 'increase' ? 1 : -1);
  }, 0);

  if (total > 0) {
    return 'increase' as TransactionDirection;
  }

  if (total < 0) {
    return 'decrease' as TransactionDirection;
  }

  return 'no-effect' as TransactionDirection;
}

export function formatTransactionAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

export function formatDirectionLabel(direction: TransactionDirection) {
  return direction === 'no-effect' ? 'No effect' : direction[0].toUpperCase() + direction.slice(1);
}

export function describeTransactionFocus(event: TransactionEvent) {
  const reason = buildTransactionReasonChoice(event);

  return {
    transaction: event.narrative,
    amount: `$${formatTransactionAmount(event.amount)}`,
    whyEquityChanges: reason.label,
    reason,
  };
}

export function buildEffectDescription(event: TransactionEvent, accountLabel: string, direction: TransactionDirection) {
  const amount = `$${formatTransactionAmount(event.amount)}`;
  const reason = buildTransactionReasonChoice(event);
  return `${accountLabel} ${direction} ${amount} • Why equity changes: ${reason.label}`;
}

export function buildReasonMessage(event: TransactionEvent) {
  const reason = buildTransactionReasonChoice(event);
  return `${reason.label}: ${reason.description}`;
}

export function getReasonTag(event: TransactionEvent) {
  const reason = buildTransactionReasonChoice(event);
  return `reason:${reason.id}`;
}

export function getArchetypeLabel(archetypeId: TransactionArchetypeId) {
  switch (archetypeId) {
    case 'owner-invests-cash':
      return 'Owner invests cash';
    case 'earn-revenue':
      return 'Earn revenue';
    case 'collect-receivable':
      return 'Collect receivable';
    case 'pay-payable':
      return 'Pay payable';
    case 'pay-expense':
      return 'Pay expense';
    case 'purchase-asset':
      return 'Purchase asset';
    case 'receive-advance':
      return 'Receive advance';
    case 'owner-withdrawal':
      return 'Owner withdrawal';
    default:
      return archetypeId;
  }
}
