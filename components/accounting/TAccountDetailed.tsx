'use client';

import { useMemo, useState } from 'react';
import { Calculator, Eye, EyeOff, Info } from 'lucide-react';

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

export interface TAccountDetailedProps {
  accountName: string;
  accountType: AccountType;
  accountNumber?: string;
  debits?: AccountingTransaction[];
  credits?: AccountingTransaction[];
  beginningBalance?: number;
  showBalance?: boolean;
  showFormulas?: boolean;
  showJournalReferences?: boolean;
  showRunningBalance?: boolean;
  interactive?: boolean;
  className?: string;
  title?: string;
}

const categoryColors: Record<string, string> = {
  operating: 'bg-green-100 text-green-700',
  investing: 'bg-blue-100 text-blue-700',
  financing: 'bg-purple-100 text-purple-700',
  adjustment: 'bg-yellow-100 text-yellow-700',
  closing: 'bg-gray-100 text-gray-700'
};

export function TAccountDetailed({
  accountName,
  accountType,
  accountNumber,
  debits = [],
  credits = [],
  beginningBalance = 0,
  showBalance = true,
  showFormulas = false,
  showJournalReferences = true,
  showRunningBalance = false,
  interactive = true,
  className,
  title
}: TAccountDetailedProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCalculations, setShowCalculations] = useState(showFormulas);

  const normalBalanceSide = getNormalBalanceSide(accountType);
  const totalDebits = debits.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalCredits = credits.reduce((sum, transaction) => sum + transaction.amount, 0);
  const endingBalance =
    normalBalanceSide === 'debit'
      ? beginningBalance + totalDebits - totalCredits
      : beginningBalance + totalCredits - totalDebits;

  const combinedTransactions = useMemo(
    () =>
      [...debits.map((transaction) => ({ ...transaction, side: 'debit' as const })), ...credits.map((transaction) => ({ ...transaction, side: 'credit' as const }))]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [credits, debits]
  );

  const getRunningBalance = (transactionId: string, side: 'debit' | 'credit') => {
    let runningBalance = beginningBalance;
    for (const entry of combinedTransactions) {
      const amount = entry.amount;
      const isDebit = entry.side === 'debit';
      if (normalBalanceSide === 'debit') {
        runningBalance += isDebit ? amount : -amount;
      } else {
        runningBalance += isDebit ? -amount : amount;
      }
      if (entry.id === transactionId && entry.side === side) {
        break;
      }
    }
    return runningBalance;
  };

  return (
    <Card className={cn('w-full max-w-4xl', className)}>
      {title && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {interactive && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDetails((value) => !value)}>
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCalculations((value) => !value)}>
                  <Calculator className="h-4 w-4" />
                  Formulas
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold text-gray-800">{accountName}</h3>
            {accountNumber && (
              <Badge variant="outline" className="text-xs">
                #{accountNumber}
              </Badge>
            )}
          </div>
          <Badge className={getAccountTypeColor(accountType)}>
            {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
          </Badge>
          {beginningBalance !== 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Beginning Balance: {formatCurrency(beginningBalance)}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border-2 border-gray-800">
          <div className="grid grid-cols-2 border-b-2 border-gray-800">
            <div className="border-r-2 border-gray-800 bg-blue-50 p-3 text-center font-semibold text-blue-800">
              Debits {normalBalanceSide === 'debit' && <span className="text-xs">(+)</span>}
            </div>
            <div className="bg-red-50 p-3 text-center font-semibold text-red-800">
              Credits {normalBalanceSide === 'credit' && <span className="text-xs">(+)</span>}
            </div>
          </div>

          {beginningBalance !== 0 && (
            <div className="grid grid-cols-2 border-b border-gray-300">
              {normalBalanceSide === 'debit' ? (
                <>
                  <div className="border-r-2 border-gray-800 bg-blue-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Beginning Balance</span>
                      <span className="font-mono text-sm font-semibold">
                        {formatCurrency(beginningBalance)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3" />
                </>
              ) : (
                <>
                  <div className="border-r-2 border-gray-800 p-3" />
                  <div className="bg-red-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Beginning Balance</span>
                      <span className="font-mono text-sm font-semibold">
                        {formatCurrency(beginningBalance)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid min-h-[300px] grid-cols-2">
            <div className="border-r-2 border-gray-800 p-4">
              <div className="space-y-3">
                {debits.map((transaction) => (
                  <div key={transaction.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{transaction.description}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {transaction.date}
                          {showJournalReferences && transaction.reference && ` • ${transaction.reference}`}
                        </div>
                        {showDetails && transaction.category && (
                          <Badge className={cn('mt-1 text-xs', categoryColors[transaction.category] ?? 'bg-gray-50 text-gray-600')}>
                            {transaction.category}
                          </Badge>
                        )}
                        {showDetails && transaction.journalEntry && (
                          <div className="mt-1 text-xs text-blue-600">JE: {transaction.journalEntry}</div>
                        )}
                      </div>
                      <div className="ml-2 text-right">
                        <div className="font-mono text-sm font-semibold">
                          {formatCurrency(transaction.amount)}
                        </div>
                        {showRunningBalance && (
                          <div className="mt-1 text-xs text-gray-500" data-testid={`running-balance-${transaction.id}`}>
                            Bal: {formatCurrency(getRunningBalance(transaction.id, 'debit'))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {debits.length === 0 && (
                  <div className="py-12 text-center text-gray-400">No debit transactions</div>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {credits.map((transaction) => (
                  <div key={transaction.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{transaction.description}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {transaction.date}
                          {showJournalReferences && transaction.reference && ` • ${transaction.reference}`}
                        </div>
                        {showDetails && transaction.category && (
                          <Badge className={cn('mt-1 text-xs', categoryColors[transaction.category] ?? 'bg-gray-50 text-gray-600')}>
                            {transaction.category}
                          </Badge>
                        )}
                        {showDetails && transaction.journalEntry && (
                          <div className="mt-1 text-xs text-blue-600">JE: {transaction.journalEntry}</div>
                        )}
                      </div>
                      <div className="ml-2 text-right">
                        <div className="font-mono text-sm font-semibold">
                          {formatCurrency(transaction.amount)}
                        </div>
                        {showRunningBalance && (
                          <div className="mt-1 text-xs text-gray-500" data-testid={`running-balance-${transaction.id}`}>
                            Bal: {formatCurrency(getRunningBalance(transaction.id, 'credit'))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {credits.length === 0 && (
                  <div className="py-12 text-center text-gray-400">No credit transactions</div>
                )}
              </div>
            </div>
          </div>

          {(debits.length > 0 || credits.length > 0) && (
            <div className="grid grid-cols-2 border-t-2 border-gray-800 bg-gray-50">
              <div className="border-r-2 border-gray-800 p-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Debits:</span>
                  <span className="font-mono">{formatCurrency(totalDebits)}</span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Credits:</span>
                  <span className="font-mono">{formatCurrency(totalCredits)}</span>
                </div>
              </div>
            </div>
          )}

          {showBalance && (
            <div className="border-t border-gray-400 bg-gray-100">
              <div className="p-3 text-center">
                <div className="text-lg font-semibold">
                  Ending Balance:
                  <span className={cn('ml-2 font-mono', endingBalance >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(Math.abs(endingBalance))}
                    {endingBalance < 0 && ' (Abnormal Balance)'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Normal balance side:{' '}
                  {normalBalanceSide.charAt(0).toUpperCase() + normalBalanceSide.slice(1)}
                </div>
              </div>
            </div>
          )}
        </div>

        {showDetails && (debits.length > 0 || credits.length > 0) && (
          <div className="mt-6 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="font-semibold text-blue-800">Transaction Count</div>
              <div className="text-blue-700">
                {debits.length} Debits • {credits.length} Credits
              </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="font-semibold text-green-800">Activity Period</div>
              <div className="text-green-700">
                {combinedTransactions.length > 0
                  ? `${combinedTransactions[0].date} - ${combinedTransactions[combinedTransactions.length - 1].date}`
                  : 'No transactions'}
              </div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
              <div className="font-semibold text-purple-800">Net Activity</div>
              <div className="text-purple-700">
                {formatCurrency(Math.abs(endingBalance - beginningBalance))}
              </div>
            </div>
          </div>
        )}

        {showCalculations && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Balance Calculation:</h4>
            </div>
            <div className="space-y-1 text-sm text-blue-700">
              {normalBalanceSide === 'debit' ? (
                <>
                  <div>• Asset/Expense accounts have normal DEBIT balances</div>
                  <div>• Ending Balance = Beginning Balance + Total Debits - Total Credits</div>
                  <div>
                    • {formatCurrency(beginningBalance)} + {formatCurrency(totalDebits)} -{' '}
                    {formatCurrency(totalCredits)} = {formatCurrency(endingBalance)}
                  </div>
                </>
              ) : (
                <>
                  <div>• Liability/Equity/Revenue accounts have normal CREDIT balances</div>
                  <div>• Ending Balance = Beginning Balance + Total Credits - Total Debits</div>
                  <div>
                    • {formatCurrency(beginningBalance)} + {formatCurrency(totalCredits)} -{' '}
                    {formatCurrency(totalDebits)} = {formatCurrency(endingBalance)}
                  </div>
                </>
              )}
              {endingBalance < 0 && (
                <div className="font-medium text-red-600">
                  ⚠️ This account shows an abnormal balance (negative for {normalBalanceSide}{' '}
                  accounts)
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
