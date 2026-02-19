export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type NormalBalanceSide = 'debit' | 'credit';

export interface AccountingTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference?: string;
  journalEntry?: string;
  category?: string;
}

export interface JournalEntryLine {
  id: string;
  account: string;
  accountType: AccountType;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface TrialBalanceAccount {
  id: string;
  accountNumber?: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalanceSide;
  debitBalance?: number;
  creditBalance?: number;
}

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  asset: 'bg-blue-100 text-blue-800 border-blue-200',
  liability: 'bg-red-100 text-red-800 border-red-200',
  equity: 'bg-purple-100 text-purple-800 border-purple-200',
  revenue: 'bg-green-100 text-green-800 border-green-200',
  expense: 'bg-orange-100 text-orange-800 border-orange-200'
};

export const getAccountTypeColor = (type: AccountType | string): string => {
  if ((type as AccountType) in ACCOUNT_TYPE_COLORS) {
    return ACCOUNT_TYPE_COLORS[type as AccountType];
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getNormalBalanceSide = (accountType: AccountType): NormalBalanceSide =>
  accountType === 'asset' || accountType === 'expense' ? 'debit' : 'credit';

export const formatCurrency = (value: number): string => `$${value.toLocaleString()}`;
