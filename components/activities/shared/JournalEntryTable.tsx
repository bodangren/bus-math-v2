'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { formatAccountingAmount, toNumber } from './utils';

export interface JournalEntryAccountOption {
  id: string;
  label: string;
}

export interface JournalEntryLine {
  id: string;
  date?: string;
  accountId?: string;
  debit?: string | number;
  credit?: string | number;
  memo?: string;
}

export interface JournalEntryRowFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  message?: string;
  misconceptionTags?: string[];
}

export interface JournalEntryTableProps {
  title: string;
  description?: string;
  availableAccounts: JournalEntryAccountOption[];
  expectedLineCount: number;
  showDates?: boolean;
  defaultValue?: JournalEntryLine[];
  value?: JournalEntryLine[];
  onValueChange?: (lines: JournalEntryLine[]) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  rowFeedback?: Record<string, JournalEntryRowFeedback>;
}

function createBlankLine(index: number): JournalEntryLine {
  return {
    id: `line-${index + 1}`,
    date: '',
    accountId: '',
    debit: '',
    credit: '',
    memo: '',
  };
}

export function JournalEntryTable({
  title,
  description,
  availableAccounts,
  expectedLineCount,
  showDates = true,
  defaultValue,
  value,
  onValueChange,
  readOnly = false,
  teacherView = false,
  rowFeedback = {},
}: JournalEntryTableProps) {
  const [internalValue, setInternalValue] = useState<JournalEntryLine[]>(
    defaultValue ?? Array.from({ length: expectedLineCount }, (_, index) => createBlankLine(index)),
  );
  const lines = value ?? internalValue;

  useEffect(() => {
    if (value === undefined && defaultValue) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const normalizedLines = useMemo(() => {
    const nextLines = [...lines];
    while (nextLines.length < expectedLineCount) {
      nextLines.push(createBlankLine(nextLines.length));
    }
    return nextLines;
  }, [expectedLineCount, lines]);

  const updateLines = (nextLines: JournalEntryLine[]) => {
    if (value === undefined) {
      setInternalValue(nextLines);
    }
    onValueChange?.(nextLines);
  };

  const totalDebit = normalizedLines.reduce((sum, line) => sum + toNumber(line.debit), 0);
  const totalCredit = normalizedLines.reduce((sum, line) => sum + toNumber(line.credit), 0);
  const difference = totalDebit - totalCredit;
  const balanced = difference === 0;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Expected lines: {expectedLineCount}</Badge>
          <Badge variant={balanced ? 'default' : 'destructive'}>
            {balanced ? 'Balanced' : `Out by ${formatAccountingAmount(Math.abs(difference))}`}
          </Badge>
          {teacherView &&
            Object.entries(rowFeedback).map(([rowId, feedback]) => (
              <Badge
                key={rowId}
                variant={feedback.status === 'correct' ? 'default' : feedback.status === 'incorrect' ? 'destructive' : 'secondary'}
              >
                {rowId}: {feedback.message ?? feedback.status}
              </Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b">
                {showDates && <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Account</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Debit</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Credit</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Memo</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {normalizedLines.map((line, index) => {
                const feedback = rowFeedback[line.id];
                return (
                  <tr
                    key={line.id}
                    className={cn(
                      'border-b last:border-b-0',
                      teacherView && feedback?.status === 'correct' && 'bg-emerald-50/60',
                      teacherView && feedback?.status === 'incorrect' && 'bg-destructive/10',
                      teacherView && feedback?.status === 'partial' && 'bg-amber-50/70'
                    )}
                  >
                    {showDates && (
                      <td className="px-3 py-2 align-top">
                        {readOnly ? (
                          <span>{line.date || '—'}</span>
                        ) : (
                          <Input
                            type="text"
                            value={line.date ?? ''}
                            onChange={(event) => {
                              const nextLines = [...normalizedLines];
                              nextLines[index] = { ...line, date: event.target.value };
                              updateLines(nextLines);
                            }}
                            className="w-28"
                            placeholder="MM/DD"
                          />
                        )}
                      </td>
                    )}
                    <td className="px-3 py-2 align-top">
                      {readOnly ? (
                        <span>{availableAccounts.find((account) => account.id === line.accountId)?.label ?? line.accountId ?? '—'}</span>
                      ) : (
                        <select
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={line.accountId ?? ''}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, accountId: event.target.value };
                            updateLines(nextLines);
                          }}
                        >
                          <option value="">Select account</option>
                          {availableAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {readOnly ? (
                        <span className="tabular-nums">{formatAccountingAmount(line.debit)}</span>
                      ) : (
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="w-28 text-right tabular-nums"
                          value={line.debit ?? ''}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, debit: event.target.value, credit: event.target.value ? '' : line.credit };
                            updateLines(nextLines);
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {readOnly ? (
                        <span className="tabular-nums">{formatAccountingAmount(line.credit)}</span>
                      ) : (
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="w-28 text-right tabular-nums"
                          value={line.credit ?? ''}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, credit: event.target.value, debit: event.target.value ? '' : line.debit };
                            updateLines(nextLines);
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {readOnly ? (
                        <span>{line.memo || '—'}</span>
                      ) : (
                        <Input
                          type="text"
                          value={line.memo ?? ''}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, memo: event.target.value };
                            updateLines(nextLines);
                          }}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-muted-foreground">
                      {feedback ? feedback.message ?? feedback.status : index < expectedLineCount ? `Line ${index + 1}` : 'Optional'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
          <div className="flex flex-wrap gap-3">
            <span>Debit total: {formatAccountingAmount(totalDebit)}</span>
            <span>Credit total: {formatAccountingAmount(totalCredit)}</span>
          </div>
          <div aria-live="polite" className={cn('font-medium', balanced ? 'text-emerald-700' : 'text-destructive')}>
            {balanced ? 'Journal entry balances.' : `Difference: ${formatAccountingAmount(Math.abs(difference))}`}
          </div>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => updateLines([...normalizedLines, createBlankLine(normalizedLines.length)])}
            >
              Add line
            </Button>
          )}
        </div>
        {teacherView && (
          <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-3">
              <span>Balanced: {balanced ? 'yes' : 'no'}</span>
              <span>Rows scored: {Object.keys(rowFeedback).length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
