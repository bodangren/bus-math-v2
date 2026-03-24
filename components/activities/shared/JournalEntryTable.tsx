'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PracticeMode } from '@/lib/practice/engine/types';

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
  scenarioPanel?: ReactNode;
  showDates?: boolean;
  defaultValue?: JournalEntryLine[];
  value?: JournalEntryLine[];
  onValueChange?: (lines: JournalEntryLine[]) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  rowFeedback?: Record<string, JournalEntryRowFeedback>;
  mode?: PracticeMode;
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

function getLineSide(line: JournalEntryLine) {
  if (toNumber(line.debit) > 0 && toNumber(line.credit) === 0) {
    return 'debit';
  }

  if (toNumber(line.credit) > 0 && toNumber(line.debit) === 0) {
    return 'credit';
  }

  return 'neutral';
}

function renderAmount(value: string | number | undefined) {
  if (value === '' || value === undefined) {
    return '—';
  }

  return formatAccountingAmount(value);
}

export function JournalEntryTable({
  title,
  description,
  availableAccounts,
  expectedLineCount,
  scenarioPanel,
  showDates = true,
  defaultValue,
  value,
  onValueChange,
  readOnly = false,
  teacherView = false,
  rowFeedback = {},
  mode = 'guided_practice',
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

  const rowPrompts =
    mode === 'teaching'
      ? ['1. Record the debit side first.', '2. Mirror the credit on the opposite side.', '3. Confirm the entry balances.']
      : [];

  return (
    <Card data-layout="general-journal" className="w-full overflow-hidden border-border/70 bg-gradient-to-b from-background to-muted/10 shadow-sm">
      <CardHeader className="space-y-3 border-b border-border/70 bg-muted/20 px-6 py-6 text-center">
        <div className="space-y-1">
          <CardTitle className="text-pretty text-3xl font-semibold uppercase tracking-[0.24em]">{title}</CardTitle>
          {description && <CardDescription className="text-sm uppercase tracking-[0.18em]">{description}</CardDescription>}
        </div>
        {scenarioPanel && (
          <div className="mx-auto w-full max-w-5xl rounded-2xl border border-border/70 bg-card p-4 text-left shadow-sm">
            {scenarioPanel}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
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

      <CardContent className="space-y-4 px-6 py-6">
        {mode === 'teaching' && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
            <div className="font-semibold uppercase tracking-[0.18em] text-blue-700">Teaching mode</div>
            <div className="mt-1 flex flex-wrap gap-3">
              {rowPrompts.map((prompt) => (
                <span key={prompt} className="rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-medium">
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[920px] overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm" data-layout="general-journal">
            <div className="grid grid-cols-[88px_minmax(240px,1.2fr)_88px_120px_120px_minmax(160px,0.8fr)_150px] border-b border-border/70 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {showDates && <div>Date</div>}
              <div>Account title</div>
              <div>PR</div>
              <div className="text-right">Debit</div>
              <div className="text-right">Credit</div>
              <div>Memo</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-border/70">
              {normalizedLines.map((line, index) => {
                const feedback = rowFeedback[line.id];
                const lineSide = getLineSide(line);
                const previousDate = index > 0 ? normalizedLines[index - 1]?.date ?? '' : '';
                const showDateCell = !showDates || index === 0 || line.date !== previousDate;

                return (
                  <div
                    key={line.id}
                    data-line-id={line.id}
                    data-line-side={lineSide}
                    className={cn(
                      'grid grid-cols-[88px_minmax(240px,1.2fr)_88px_120px_120px_minmax(160px,0.8fr)_150px] items-start gap-3 px-4 py-4 transition-colors',
                      teacherView && feedback?.status === 'correct' && 'bg-emerald-50/60',
                      teacherView && feedback?.status === 'incorrect' && 'bg-rose-50/70',
                      teacherView && feedback?.status === 'partial' && 'bg-amber-50/70',
                      lineSide === 'debit' && 'bg-blue-50/[0.04]',
                      lineSide === 'credit' && 'bg-rose-50/[0.04]',
                    )}
                  >
                    {showDates ? (
                      <div className={cn('pt-1 text-sm text-muted-foreground', !showDateCell && 'text-transparent')} aria-hidden={!showDateCell}>
                        {showDateCell ? line.date || '—' : '—'}
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <div
                        className={cn(
                          'rounded-xl border border-border/80 bg-background px-3 py-2 shadow-inner',
                          lineSide === 'credit' && 'pl-6',
                        )}
                      >
                        {readOnly ? (
                          <span className="block text-sm font-medium text-foreground">
                            {availableAccounts.find((account) => account.id === line.accountId)?.label ?? line.accountId ?? '—'}
                          </span>
                        ) : (
                          <select
                            className="min-h-11 w-full rounded-md border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:outline-none focus-visible:ring-0"
                            value={line.accountId ?? ''}
                            aria-label={`Account for line ${index + 1}`}
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
                      </div>
                      {mode === 'teaching' && (
                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {lineSide === 'credit' ? 'Credit line' : 'Debit line'}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {index + 1}
                    </div>

                    <div>
                      {readOnly ? (
                        <div className="pt-2 text-right font-mono text-sm tabular-nums">{renderAmount(line.debit)}</div>
                      ) : (
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="h-11 w-full text-right tabular-nums"
                          aria-label={`Debit for line ${index + 1}`}
                          value={line.debit ?? ''}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, debit: event.target.value, credit: event.target.value ? '' : line.credit };
                            updateLines(nextLines);
                          }}
                        />
                      )}
                    </div>

                    <div>
                      {readOnly ? (
                        <div className="pt-2 text-right font-mono text-sm tabular-nums">{renderAmount(line.credit)}</div>
                      ) : (
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="h-11 w-full text-right tabular-nums"
                          aria-label={`Credit for line ${index + 1}`}
                          value={line.credit ?? ''}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, credit: event.target.value, debit: event.target.value ? '' : line.debit };
                            updateLines(nextLines);
                          }}
                        />
                      )}
                    </div>

                    <div className="pt-2 text-sm text-muted-foreground">
                      {readOnly ? <span>{line.memo || '—'}</span> : (
                        <Input
                          type="text"
                          value={line.memo ?? ''}
                          aria-label={`Memo for line ${index + 1}`}
                          onChange={(event) => {
                            const nextLines = [...normalizedLines];
                            nextLines[index] = { ...line, memo: event.target.value };
                            updateLines(nextLines);
                          }}
                        />
                      )}
                    </div>

                    <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                      {feedback ? (
                        <div
                          className={cn(
                            'font-medium',
                            feedback.status === 'correct' && 'text-emerald-700',
                            feedback.status === 'incorrect' && 'text-rose-700',
                            feedback.status === 'partial' && 'text-amber-700',
                          )}
                        >
                          {feedback.message ?? feedback.status}
                        </div>
                      ) : (
                        <div>{index < expectedLineCount ? `Line ${index + 1}` : 'Optional'}</div>
                      )}
                      {teacherView && feedback?.misconceptionTags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {feedback.misconceptionTags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/20 px-4 py-3 text-sm">
          <div className="flex flex-wrap gap-3">
            <span>Debit total: {formatAccountingAmount(totalDebit)}</span>
            <span>Credit total: {formatAccountingAmount(totalCredit)}</span>
          </div>
          <div
            aria-live="polite"
            className={cn('font-medium', balanced ? 'text-emerald-700' : 'text-rose-700')}
            data-balance-state={balanced ? 'balanced' : 'out-of-balance'}
          >
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
          <div className="rounded-2xl border border-border/80 bg-background p-3 text-sm text-muted-foreground">
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
