'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, Check, Eye, EyeOff, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import {
  formatCurrency,
  getAccountTypeColor,
  type TrialBalanceAccount
} from './accounting-types';

export interface TrialBalanceProps {
  companyName: string;
  periodEnding: string;
  accounts: TrialBalanceAccount[];
  showAccountNumbers?: boolean;
  showAccountTypes?: boolean;
  showValidation?: boolean;
  showSummary?: boolean;
  groupByType?: boolean;
  interactive?: boolean;
  className?: string;
  title?: string;
}

const GROUP_ORDER: TrialBalanceAccount['accountType'][] = [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense'
];

export function TrialBalance({
  companyName,
  periodEnding,
  accounts,
  showAccountNumbers = true,
  showAccountTypes = false,
  showValidation = true,
  showSummary = true,
  groupByType = false,
  interactive = true,
  className,
  title
}: TrialBalanceProps) {
  const [showDetails, setShowDetails] = useState(showSummary);
  const [groupedView, setGroupedView] = useState(groupByType);

  const { totalDebits, totalCredits, isBalanced } = useMemo(() => {
    const debits = accounts.reduce((sum, account) => sum + (account.debitBalance ?? 0), 0);
    const credits = accounts.reduce((sum, account) => sum + (account.creditBalance ?? 0), 0);
    return { totalDebits: debits, totalCredits: credits, isBalanced: Math.abs(debits - credits) < 0.01 };
  }, [accounts]);

  const sortedAccounts = useMemo(() => {
    if (showAccountNumbers) {
      return [...accounts].sort((a, b) => (a.accountNumber ?? '').localeCompare(b.accountNumber ?? ''));
    }
    return [...accounts].sort((a, b) => a.accountName.localeCompare(b.accountName));
  }, [accounts, showAccountNumbers]);

  const groupedAccounts = useMemo(() => {
    if (!groupedView) {
      return [{ type: 'all', accounts: sortedAccounts }];
    }
    const groups = GROUP_ORDER.map((type) => ({
      type,
      accounts: sortedAccounts.filter((account) => account.accountType === type)
    })).filter((group) => group.accounts.length > 0);
    return groups;
  }, [groupedView, sortedAccounts]);

  const getTypeTotal = (type: TrialBalanceAccount['accountType'], side: 'debit' | 'credit') => {
    return accounts
      .filter((account) => account.accountType === type)
      .reduce((sum, account) => {
        const value = side === 'debit' ? account.debitBalance : account.creditBalance;
        return sum + (value ?? 0);
      }, 0);
  };

  const columnClasses = cn(
    'grid gap-4 p-3 font-semibold text-gray-700',
    showAccountNumbers
      ? showAccountTypes
        ? 'grid-cols-9'
        : 'grid-cols-8'
      : showAccountTypes
        ? 'grid-cols-7'
        : 'grid-cols-6'
  );

  const rowClasses = cn(
    'grid gap-4 p-3 hover:bg-gray-50',
    showAccountNumbers
      ? showAccountTypes
        ? 'grid-cols-9'
        : 'grid-cols-8'
      : showAccountTypes
        ? 'grid-cols-7'
        : 'grid-cols-6'
  );

  return (
    <Card className={cn('w-full max-w-5xl', className)}>
      {title && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {interactive && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setGroupedView((value) => !value)}>
                  {groupedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {groupedView ? 'List View' : 'Group View'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDetails((value) => !value)}>
                  <Info className="h-4 w-4" />
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{companyName}</h2>
          <h3 className="mt-1 text-xl font-semibold text-gray-700">Trial Balance</h3>
          <div className="mt-1 text-lg text-gray-600">As of {periodEnding}</div>
        </div>

        {showValidation && (
          <div
            className={cn(
              'mb-6 rounded-lg border p-3 text-center',
              isBalanced ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'
            )}
            data-testid="trial-balance-status"
          >
            <div className="flex items-center justify-center gap-2">
              {isBalanced ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <span className="font-semibold">
                {isBalanced
                  ? 'Trial balance is balanced'
                  : `Trial balance out of balance by ${formatCurrency(Math.abs(totalDebits - totalCredits))}`}
              </span>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="border-b border-gray-300 bg-gray-100">
            <div className={columnClasses}>
              {showAccountNumbers && <div className="text-center">Account #</div>}
              <div className={showAccountNumbers ? 'col-span-3' : 'col-span-2'}>Account Name</div>
              {showAccountTypes && <div className="text-center">Type</div>}
              <div className="col-span-2 text-right">Debit Balance</div>
              <div className="col-span-2 text-right">Credit Balance</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {groupedAccounts.map((group) => (
              <div key={group.type}>
                {groupedView && group.type !== 'all' && (
                  <div className="border-b border-gray-200 bg-gray-50">
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getAccountTypeColor(group.type as TrialBalanceAccount['accountType'])}>
                          {group.type.charAt(0).toUpperCase() + group.type.slice(1)} Accounts
                        </Badge>
                        <span className="text-sm text-gray-600">
                          ({group.accounts.length} accounts)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {group.accounts.map((account) => (
                  <div key={account.id} className={rowClasses}>
                    {showAccountNumbers && (
                      <div className="text-center font-mono text-sm text-gray-600">
                        {account.accountNumber ?? '—'}
                      </div>
                    )}
                    <div className={showAccountNumbers ? 'col-span-3' : 'col-span-2'}>
                      <div className="font-medium text-gray-800">{account.accountName}</div>
                      {showAccountTypes && (
                        <Badge className={cn('mt-1 text-xs', getAccountTypeColor(account.accountType))}>
                          {account.accountType}
                        </Badge>
                      )}
                    </div>
                    {showAccountTypes && (
                      <div className="text-center text-sm text-gray-600 capitalize">{account.accountType}</div>
                    )}
                    <div className="col-span-2 text-right">
                      {account.debitBalance ? (
                        <div className="font-mono font-semibold text-gray-800">
                          {formatCurrency(account.debitBalance)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      {account.creditBalance ? (
                        <div className="font-mono font-semibold text-gray-800">
                          {formatCurrency(account.creditBalance)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                ))}
                {groupedView && group.type !== 'all' && showDetails && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className={rowClasses}>
                      {showAccountNumbers && <div />}
                      <div className={showAccountNumbers ? 'col-span-3' : 'col-span-2'}>
                        {group.type.charAt(0).toUpperCase() + group.type.slice(1)} Subtotal
                      </div>
                      {showAccountTypes && <div />}
                      <div className="col-span-2 text-right font-mono">
                        {formatCurrency(getTypeTotal(group.type as TrialBalanceAccount['accountType'], 'debit'))}
                      </div>
                      <div className="col-span-2 text-right font-mono">
                        {formatCurrency(getTypeTotal(group.type as TrialBalanceAccount['accountType'], 'credit'))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-800 bg-gray-100">
            <div className={rowClasses}>
              {showAccountNumbers && <div />}
              <div className={showAccountNumbers ? 'col-span-3' : 'col-span-2'}>TOTALS:</div>
              {showAccountTypes && <div />}
              <div className="col-span-2 text-right font-mono">
                <span className={cn(isBalanced ? 'text-gray-800' : 'text-red-600')}>
                  {formatCurrency(totalDebits)}
                </span>
              </div>
              <div className="col-span-2 text-right font-mono">
                <span className={cn(isBalanced ? 'text-gray-800' : 'text-red-600')}>
                  {formatCurrency(totalCredits)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{accounts.length}</div>
                <div className="text-sm text-blue-600">Total Accounts</div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-800">
                  {formatCurrency(Math.max(totalDebits, totalCredits))}
                </div>
                <div className="text-sm text-green-600">Total Activity</div>
              </div>
              <div
                className={cn(
                  'rounded-lg border p-4 text-center',
                  isBalanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                )}
              >
                <div
                  className={cn(
                    'text-2xl font-bold',
                    isBalanced ? 'text-green-800' : 'text-red-800'
                  )}
                >
                  {formatCurrency(Math.abs(totalDebits - totalCredits))}
                </div>
                <div className={cn('text-sm', isBalanced ? 'text-green-600' : 'text-red-600')}>
                  {isBalanced ? 'Perfect Balance' : 'Out of Balance'}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-3 font-semibold text-gray-800">Account Type Breakdown</h4>
              <div className="grid gap-4 text-sm md:grid-cols-5">
                {GROUP_ORDER.map((type) => {
                  const typeAccounts = accounts.filter((account) => account.accountType === type);
                  if (typeAccounts.length === 0) {
                    return (
                      <div key={type} className="rounded border bg-white p-3 text-center text-gray-500">
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                        <div className="text-xs text-gray-400">No accounts</div>
                      </div>
                    );
                  }
                  return (
                    <div key={type} className="rounded border bg-white p-3">
                      <div className="font-medium text-gray-800 capitalize">
                        {type === 'equity' ? 'Equity' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        <div>{typeAccounts.length} accounts</div>
                        <div>Debits: {formatCurrency(getTypeTotal(type, 'debit'))}</div>
                        <div>Credits: {formatCurrency(getTypeTotal(type, 'credit'))}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Trial Balance Purpose</h4>
              </div>
              <div className="space-y-1 text-sm text-blue-700">
                <div>• Verifies that total debits equal total credits in the general ledger</div>
                <div>• Detects mathematical errors when posting journal entries</div>
                <div>• Summarizes all account balances at a point in time</div>
                <div>• Serves as a starting point for financial statements</div>
                {!isBalanced && (
                  <div className="mt-2 font-medium text-red-700">
                    ⚠ Review recent journal entries to locate the discrepancy.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
