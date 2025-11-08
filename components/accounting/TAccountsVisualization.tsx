'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import {
  formatCurrency,
  getAccountTypeColor,
  getNormalBalanceSide,
  type AccountingTransaction,
  type AccountType
} from './accounting-types';

export interface TAccount {
  id: string;
  name: string;
  type: AccountType;
  debits: AccountingTransaction[];
  credits: AccountingTransaction[];
}

export interface TAccountsVisualizationProps {
  accounts?: TAccount[];
  showAccountingEquation?: boolean;
  showBalances?: boolean;
  interactive?: boolean;
  className?: string;
  title?: string;
}

export function TAccountsVisualization({
  accounts = [],
  showAccountingEquation = true,
  showBalances = true,
  interactive = false,
  className,
  title = 'T-Accounts Visualization'
}: TAccountsVisualizationProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [highlightEquation, setHighlightEquation] = useState(false);

  const { totalAssets, totalLiabilities, totalEquity } = useMemo(() => {
    const calculateBalance = (account: TAccount) => {
      const debitTotal = account.debits.reduce((sum, transaction) => sum + transaction.amount, 0);
      const creditTotal = account.credits.reduce((sum, transaction) => sum + transaction.amount, 0);
      return getNormalBalanceSide(account.type) === 'debit'
        ? debitTotal - creditTotal
        : creditTotal - debitTotal;
    };

    const totals = accounts.reduce(
      (acc, account) => {
        const balance = calculateBalance(account);
        if (account.type === 'asset') acc.totalAssets += balance;
        if (account.type === 'liability') acc.totalLiabilities += balance;
        if (account.type === 'equity' || account.type === 'revenue' || account.type === 'expense') {
          acc.totalEquity += account.type === 'expense' ? -balance : balance;
        }
        return acc;
      },
      { totalAssets: 0, totalLiabilities: 0, totalEquity: 0 }
    );

    return totals;
  }, [accounts]);

  const isEquationBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  const sections: Array<{
    type: AccountType;
    label: string;
    indicatorClass: string;
    labelClass: string;
  }> = [
    { type: 'asset', label: 'Assets', indicatorClass: 'bg-blue-600', labelClass: 'text-blue-600' },
    {
      type: 'liability',
      label: 'Liabilities',
      indicatorClass: 'bg-red-600',
      labelClass: 'text-red-600'
    },
    {
      type: 'equity',
      label: 'Equity',
      indicatorClass: 'bg-purple-600',
      labelClass: 'text-purple-600'
    },
    {
      type: 'revenue',
      label: 'Revenue',
      indicatorClass: 'bg-green-600',
      labelClass: 'text-green-600'
    },
    {
      type: 'expense',
      label: 'Expenses',
      indicatorClass: 'bg-orange-500',
      labelClass: 'text-orange-600'
    }
  ];

  const renderTAccount = (account: TAccount) => {
    const totalDebits = account.debits.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalCredits = account.credits.reduce((sum, transaction) => sum + transaction.amount, 0);
    const normalBalance = getNormalBalanceSide(account.type);
    const balance =
      normalBalance === 'debit' ? totalDebits - totalCredits : totalCredits - totalDebits;
    const isSelected = selectedAccount === account.id;

    return (
      <Card
        key={account.id}
        className={cn(
          'transition-all duration-200',
          isSelected && 'ring-2 ring-blue-500 shadow-lg',
          interactive && 'cursor-pointer hover:shadow-md'
        )}
        onClick={() => {
          if (!interactive) return;
          setSelectedAccount(isSelected ? null : account.id);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">{account.name}</CardTitle>
            <Badge className={getAccountTypeColor(account.type)}>
              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-md border-2 border-gray-700">
            <div className="grid grid-cols-2 border-b-2 border-gray-700">
              <div className="border-r-2 border-gray-700 bg-blue-50 p-2 text-center text-sm font-medium text-blue-800">
                Debits
              </div>
              <div className="bg-red-50 p-2 text-center text-sm font-medium text-red-800">
                Credits
              </div>
            </div>
            <div className="grid min-h-[120px] grid-cols-2">
              <div className="border-r-2 border-gray-700 p-2">
                <div className="space-y-1">
                  {account.debits.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between text-xs">
                      <span className="mr-1 flex-1 truncate">{transaction.description}</span>
                      <span className="font-mono">{formatCurrency(transaction.amount)}</span>
                    </div>
                  ))}
                  {account.debits.length === 0 && (
                    <div className="py-4 text-center text-xs text-gray-400">No debits</div>
                  )}
                </div>
              </div>
              <div className="p-2">
                <div className="space-y-1">
                  {account.credits.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between text-xs">
                      <span className="mr-1 flex-1 truncate">{transaction.description}</span>
                      <span className="font-mono">{formatCurrency(transaction.amount)}</span>
                    </div>
                  ))}
                  {account.credits.length === 0 && (
                    <div className="py-4 text-center text-xs text-gray-400">No credits</div>
                  )}
                </div>
              </div>
            </div>
            {(account.debits.length > 0 || account.credits.length > 0) && (
              <div className="grid grid-cols-2 border-t border-gray-400 bg-gray-50">
                <div className="border-r border-gray-400 p-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(totalDebits)}</span>
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Total:</span>
                    <span className="font-mono">{formatCurrency(totalCredits)}</span>
                  </div>
                </div>
              </div>
            )}
            {showBalances && (account.debits.length > 0 || account.credits.length > 0) && (
              <div className="border-t border-gray-400 bg-gray-100 p-2">
                <div className="text-center text-xs font-medium">
                  Balance:{' '}
                  <span
                    className={cn(
                      'ml-1 font-mono',
                      balance >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                    data-testid={`account-balance-${account.id}`}
                  >
                    {formatCurrency(Math.abs(balance))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const equationBadgeClasses = cn(
    isEquationBalanced ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200',
    'border'
  );

  return (
    <div className={cn('w-full space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
          {interactive && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighlightEquation((value) => !value)}
              >
                {highlightEquation ? 'Hide' : 'Show'} Equation
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {showAccountingEquation && (
            <Card
              className={cn(
                'mb-6 transition-all duration-300',
                highlightEquation && 'ring-2 ring-yellow-400 shadow-lg',
                !isEquationBalanced && 'border-red-200 bg-red-50'
              )}
            >
              <CardContent className="p-4">
                <h3 className="mb-4 text-center text-lg font-semibold">Accounting Equation</h3>
                <div className="flex flex-wrap items-center justify-center gap-4 text-lg font-mono">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">ASSETS</div>
                    <div className="text-2xl">{formatCurrency(totalAssets)}</div>
                  </div>
                  <div className="text-2xl font-bold">=</div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">LIABILITIES</div>
                    <div className="text-2xl">{formatCurrency(totalLiabilities)}</div>
                  </div>
                  <div className="text-xl">+</div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">EQUITY</div>
                    <div className="text-2xl">{formatCurrency(totalEquity)}</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge className={equationBadgeClasses} data-testid="equation-status">
                    {isEquationBalanced ? '✓ BALANCED' : '⚠ NOT BALANCED'}
                  </Badge>
                  <div className="mt-1 text-xs text-gray-600">
                    Difference: {formatCurrency(Math.abs(totalAssets - (totalLiabilities + totalEquity)))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {sections.map(({ type, label, indicatorClass, labelClass }) => {
              const sectionAccounts = accounts.filter((account) => account.type === type);
              if (sectionAccounts.length === 0) {
                return null;
              }
              return (
                <section key={type}>
                  <h3 className={cn('mb-3 flex items-center text-lg font-semibold', labelClass)}>
                    <span className={cn('mr-2 h-4 w-4 rounded', indicatorClass)} />
                    {label}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sectionAccounts.map(renderTAccount)}
                  </div>
                </section>
              );
            })}
          </div>

          {interactive && selectedAccount && (
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="mb-2 font-semibold text-blue-800">
                  Selected Account: {accounts.find((account) => account.id === selectedAccount)?.name}
                </h4>
                <p className="text-sm text-blue-700">
                  Click a different account to compare balances or click the selected card again to
                  clear the highlight.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
