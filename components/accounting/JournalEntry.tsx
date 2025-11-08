'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, Check, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import {
  formatCurrency,
  getAccountTypeColor,
  type JournalEntryLine
} from './accounting-types';

export interface JournalEntryProps {
  entryNumber: string;
  date: string;
  description: string;
  lines: JournalEntryLine[];
  reference?: string;
  showValidation?: boolean;
  showExplanation?: boolean;
  showAccountTypes?: boolean;
  interactive?: boolean;
  className?: string;
  title?: string;
}

const ACCOUNT_TYPE_SYMBOLS: Record<JournalEntryLine['accountType'], string> = {
  asset: 'A',
  liability: 'L',
  equity: 'E',
  revenue: 'R',
  expense: 'X'
};

export function JournalEntry({
  entryNumber,
  date,
  description,
  lines,
  reference,
  showValidation = true,
  showExplanation = false,
  showAccountTypes = true,
  interactive = true,
  className,
  title
}: JournalEntryProps) {
  const [showDetails, setShowDetails] = useState(showExplanation);

  const { totalDebits, totalCredits, isBalanced } = useMemo(() => {
    const debits = lines.reduce((sum, line) => sum + (line.debit ?? 0), 0);
    const credits = lines.reduce((sum, line) => sum + (line.credit ?? 0), 0);
    return {
      totalDebits: debits,
      totalCredits: credits,
      isBalanced: Math.abs(debits - credits) < 0.01
    };
  }, [lines]);

  return (
    <Card className={cn('w-full max-w-4xl', className)}>
      {title && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {interactive && (
              <Button variant="outline" size="sm" onClick={() => setShowDetails((value) => !value)}>
                <Info className="h-4 w-4" />
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-6">
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm font-medium text-gray-500">Entry Number</div>
              <div className="text-lg font-semibold text-gray-800">#{entryNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Date</div>
              <div className="text-lg font-semibold text-gray-800">{date}</div>
            </div>
            <div className="flex items-center gap-2">
              {showValidation && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    isBalanced ? 'text-green-600' : 'text-red-600'
                  )}
                  data-testid="journal-validation"
                >
                  {isBalanced ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {isBalanced ? 'Balanced' : 'Unbalanced'}
                </div>
              )}
              {reference && (
                <Badge variant="outline" className="text-xs">
                  Ref: {reference}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-500">Description</div>
            <div className="text-gray-800">{description}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-300">
          <div className="border-b border-gray-300 bg-gray-100">
            <div className="grid grid-cols-12 gap-4 p-3 font-semibold text-gray-700">
              <div className="col-span-1 text-center">Type</div>
              <div className="col-span-4">Account</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2 text-right">Debit</div>
              <div className="col-span-2 text-right">Credit</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50">
                <div className="col-span-1 flex justify-center">
                  {showAccountTypes && (
                    <Badge
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs',
                        getAccountTypeColor(line.accountType)
                      )}
                    >
                      {ACCOUNT_TYPE_SYMBOLS[line.accountType]}
                    </Badge>
                  )}
                </div>
                <div className="col-span-4">
                  <div className="font-medium text-gray-800">{line.account}</div>
                  {showAccountTypes && (
                    <div className="mt-1 text-xs text-gray-500">
                      {line.accountType.charAt(0).toUpperCase() + line.accountType.slice(1)}
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-gray-600">{line.description ?? description}</div>
                </div>
                <div className="col-span-2 text-right">
                  {line.debit !== undefined && (
                    <div className="font-mono font-semibold text-gray-800">
                      {formatCurrency(line.debit)}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  {line.credit !== undefined && (
                    <div className="font-mono font-semibold text-gray-800">
                      {formatCurrency(line.credit)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-800 bg-gray-100">
            <div className="grid grid-cols-12 gap-4 p-3">
              <div className="col-span-8 text-right font-semibold text-gray-700">TOTALS:</div>
              <div className="col-span-2 text-right">
                <div
                  className={cn(
                    'text-lg font-bold font-mono',
                    isBalanced ? 'text-gray-800' : 'text-red-600'
                  )}
                >
                  {formatCurrency(totalDebits)}
                </div>
              </div>
              <div className="col-span-2 text-right">
                <div
                  className={cn(
                    'text-lg font-bold font-mono',
                    isBalanced ? 'text-gray-800' : 'text-red-600'
                  )}
                >
                  {formatCurrency(totalCredits)}
                </div>
              </div>
            </div>
          </div>
          {showValidation && (
            <div
              className={cn(
                'border-t border-gray-300 p-3 text-center',
                isBalanced ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {isBalanced ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">Entry is balanced - debits equal credits</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">
                      Entry is unbalanced - difference:{' '}
                      {formatCurrency(Math.abs(totalDebits - totalCredits))}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Accounting Equation Impact</h4>
              </div>
              <div className="grid gap-4 text-sm text-blue-700 md:grid-cols-3">
                {['asset', 'liability', 'equity'].map((type) => {
                  const relatedLines = lines.filter((line) => line.accountType === type);
                  if (type === 'equity') {
                    const expanded = lines.filter((line) =>
                      ['equity', 'revenue', 'expense'].includes(line.accountType)
                    );
                    return (
                      <div key={type} className="rounded border bg-white p-3">
                        <div className="font-medium text-purple-800">Equity & Performance</div>
                        <div className="mt-1 space-y-1 text-xs text-purple-600">
                          {expanded.map((line) => (
                            <div key={line.id}>
                              {line.account}:{' '}
                              {line.accountType === 'expense'
                                ? line.debit
                                  ? `-${formatCurrency(line.debit)}`
                                  : `+${formatCurrency(line.credit ?? 0)}`
                                : line.credit
                                  ? `+${formatCurrency(line.credit)}`
                                  : `-${formatCurrency(line.debit ?? 0)}`}
                            </div>
                          ))}
                          {expanded.length === 0 && <div>No equity activity</div>}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={type} className="rounded border bg-white p-3">
                      <div
                        className={cn(
                          'font-medium',
                          type === 'asset' ? 'text-blue-800' : 'text-red-800'
                        )}
                      >
                        {type === 'asset' ? 'Assets' : 'Liabilities'}
                      </div>
                      <div className="mt-1 space-y-1 text-xs text-gray-600">
                        {relatedLines.length > 0 ? (
                          relatedLines.map((line) => (
                            <div key={line.id}>
                              {line.account}:{' '}
                              {line.debit
                                ? `+${formatCurrency(line.debit)}`
                                : `-${formatCurrency(line.credit ?? 0)}`}
                            </div>
                          ))
                        ) : (
                          <div>No {type} impact</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <h4 className="mb-2 font-semibold text-green-800">Transaction Analysis</h4>
              <div>• Accounts affected: {lines.length}</div>
              <div>• Total value: {formatCurrency(Math.max(totalDebits, totalCredits))}</div>
              <div>
                • Account types:{' '}
                {[...new Set(lines.map((line) => line.accountType))].join(', ') || 'None'}
              </div>
              {isBalanced && (
                <div className="mt-2 font-medium text-green-800">
                  ✓ The accounting equation remains in balance
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
