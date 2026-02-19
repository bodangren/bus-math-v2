import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import {
  formatCurrency,
  getAccountTypeColor,
  getNormalBalanceSide,
  type AccountingTransaction,
  type AccountType
} from './accounting-types';

export interface TAccountSimpleProps {
  accountName: string;
  accountType: AccountType;
  debits?: AccountingTransaction[];
  credits?: AccountingTransaction[];
  showBalance?: boolean;
  showFormulas?: boolean;
  className?: string;
  title?: string;
}

export function TAccountSimple({
  accountName,
  accountType,
  debits = [],
  credits = [],
  showBalance = true,
  showFormulas = false,
  className,
  title
}: TAccountSimpleProps) {
  const totalDebits = debits.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalCredits = credits.reduce((sum, transaction) => sum + transaction.amount, 0);
  const normalBalanceSide = getNormalBalanceSide(accountType);
  const balance =
    normalBalanceSide === 'debit' ? totalDebits - totalCredits : totalCredits - totalDebits;

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-center">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-xl font-bold text-gray-800">{accountName}</h3>
          <Badge className={getAccountTypeColor(accountType)}>
            {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
          </Badge>
        </div>

        <div className="overflow-hidden rounded-lg border-2 border-gray-800">
          <div className="grid grid-cols-2 border-b-2 border-gray-800">
            <div className="border-r-2 border-gray-800 bg-blue-50 p-3 text-center font-semibold text-blue-800">
              Debits
            </div>
            <div className="bg-red-50 p-3 text-center font-semibold text-red-800">Credits</div>
          </div>

          <div className="grid min-h-[200px] grid-cols-2">
            <div className="border-r-2 border-gray-800 p-4">
              <div className="space-y-3">
                {debits.map((transaction) => (
                  <div key={transaction.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.date}
                        {transaction.reference && ` • ${transaction.reference}`}
                      </div>
                    </div>
                    <div className="ml-2 text-right font-mono text-sm">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
                {debits.length === 0 && (
                  <div className="py-8 text-center text-gray-400">No debit transactions</div>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {credits.map((transaction) => (
                  <div key={transaction.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.date}
                        {transaction.reference && ` • ${transaction.reference}`}
                      </div>
                    </div>
                    <div className="ml-2 text-right font-mono text-sm">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
                {credits.length === 0 && (
                  <div className="py-8 text-center text-gray-400">No credit transactions</div>
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

          {showBalance && (debits.length > 0 || credits.length > 0) && (
            <div className="border-t border-gray-400 bg-gray-100">
              <div className="p-3 text-center">
                <div className="text-lg font-semibold">
                  Account Balance:
                  <span
                    className={cn(
                      'ml-2 font-mono',
                      balance >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                    data-testid="account-balance"
                  >
                    {formatCurrency(Math.abs(balance))}
                    {balance < 0 && ' (Credit Balance)'}
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

        {showFormulas && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-800">Balance Calculation:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              {normalBalanceSide === 'debit' ? (
                <>
                  <div>• Asset/Expense accounts have normal DEBIT balances</div>
                  <div>• Balance = Total Debits - Total Credits</div>
                  <div>
                    • {formatCurrency(totalDebits)} - {formatCurrency(totalCredits)} ={' '}
                    {formatCurrency(balance)}
                  </div>
                </>
              ) : (
                <>
                  <div>• Liability/Equity/Revenue accounts have normal CREDIT balances</div>
                  <div>• Balance = Total Credits - Total Debits</div>
                  <div>
                    • {formatCurrency(totalCredits)} - {formatCurrency(totalDebits)} ={' '}
                    {formatCurrency(balance)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
