'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PracticeMode } from '@/lib/practice/engine/types';

import { formatAccountingAmount } from './utils';
import { TeachingModePanel } from './TeachingModePanel';

export interface PostingBalanceReferenceLine {
  id: string;
  date: string;
  accountLabel: string;
  effectLabel: string;
}

export interface PostingBalanceRow {
  id: string;
  accountLabel: string;
  startingBalance: number | string;
  normalSide: 'debit' | 'credit';
  netPostingCue: string;
  value?: number | string;
  placeholder?: string;
  note?: string;
}

export interface PostingBalanceFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  message?: string;
  misconceptionTags?: string[];
  selectedLabel?: string;
  expectedLabel?: string;
}

export interface TAccountInteractiveProps {
  title: string;
  description?: string;
  referenceTitle?: string;
  referenceLines: PostingBalanceReferenceLine[];
  rows: PostingBalanceRow[];
  mode?: PracticeMode;
  defaultValues?: Record<string, string>;
  values?: Record<string, string>;
  onValueChange?: (values: Record<string, string>) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  rowFeedback?: Partial<Record<string, PostingBalanceFeedback>>;
}

function getRowTone(status?: PostingBalanceFeedback['status']) {
  if (status === 'correct') {
    return 'border-emerald-300 bg-emerald-50/70';
  }

  if (status === 'incorrect') {
    return 'border-rose-300 bg-rose-50/80';
  }

  if (status === 'partial') {
    return 'border-amber-300 bg-amber-50/80';
  }

  return 'border-border/70 bg-background';
}

function formatNormalSide(normalSide: PostingBalanceRow['normalSide']) {
  return `${normalSide[0].toUpperCase()}${normalSide.slice(1)} balance`;
}

function formatPlainAmount(value: number | string | undefined) {
  if (value === '' || value === undefined) {
    return '—';
  }

  return formatAccountingAmount(value);
}

export function TAccountInteractive({
  title,
  description,
  referenceTitle = 'Posting reference',
  referenceLines,
  rows,
  mode = 'guided_practice',
  defaultValues,
  values,
  onValueChange,
  readOnly = false,
  teacherView = false,
  rowFeedback = {},
}: TAccountInteractiveProps) {
  const [internalValues, setInternalValues] = useState<Record<string, string>>(defaultValues ?? {});
  const currentValues = values ?? internalValues;

  useEffect(() => {
    if (values === undefined && defaultValues) {
      setInternalValues(defaultValues);
    }
  }, [defaultValues, values]);

  const updateValues = (nextValues: Record<string, string>) => {
    if (values === undefined) {
      setInternalValues(nextValues);
    }
    onValueChange?.(nextValues);
  };

  const rowsWithNotes = useMemo(() => rows.filter((row) => row.netPostingCue.toLowerCase().includes('no postings')), [rows]);
  const misconceptionTags = useMemo(
    () => Array.from(new Set(Object.values(rowFeedback).flatMap((feedback) => feedback?.misconceptionTags ?? []))),
    [rowFeedback],
  );
  const teachingSteps = useMemo(
    () => [
      'Read the posting trail before solving each ending balance.',
      'Move the posting cue to the normal side first.',
      'Check the ending balance against the T-account board.',
    ],
    [],
  );

  return (
    <Card className="w-full overflow-hidden border-border/70 bg-gradient-to-b from-background to-muted/10 shadow-sm">
      <CardHeader className="space-y-3 border-b border-border/70 bg-muted/20 px-6 py-6 text-center">
        <div className="space-y-1">
          <CardTitle className="text-pretty text-3xl font-semibold uppercase tracking-[0.24em]">{title}</CardTitle>
          {description && <CardDescription className="text-sm uppercase tracking-[0.18em]">{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary">Target rows: {rows.length}</Badge>
          <Badge variant="outline">Reference lines: {referenceLines.length}</Badge>
          <Badge variant="secondary" className="bg-sky-50 text-sky-900">
            T-account board
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 py-6" data-layout="t-account-board">
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{referenceTitle}</Badge>
            <span className="text-sm text-muted-foreground">Read the posting trail before solving ending balances.</span>
          </div>
          <div className="mt-4 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-white">
            {referenceLines.map((line) => (
              <div key={line.id} className="grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {line.date} • {line.accountLabel}
                  </div>
                </div>
                <div className="font-mono text-sm text-muted-foreground">{line.effectLabel}</div>
              </div>
            ))}
          </div>
          {rowsWithNotes.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">Some ending balances stay unchanged.</p>
          )}
        </div>

        {mode === 'teaching' && (
          <TeachingModePanel
            title="Posting walkthrough"
            summary="Trace each posting from the trail into the T-account and verify the ending balance."
            steps={teachingSteps}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {rows.map((row) => {
            const feedback = rowFeedback[row.id];
            const editable = !readOnly;
            const value = currentValues[row.id] ?? String(row.value ?? '');
            const sideIsDebit = row.normalSide === 'debit';
            const sideTone = sideIsDebit ? 'bg-sky-50/55' : 'bg-rose-50/55';
            const normalSideLabel = formatNormalSide(row.normalSide);

            return (
              <section
                key={row.id}
                className={cn(
                  'overflow-hidden rounded-[1.4rem] border border-border/80 bg-white shadow-sm',
                  getRowTone(feedback?.status),
                )}
                data-t-account-id={row.id}
                data-normal-side={row.normalSide}
              >
                <div className="border-b border-border/70 bg-muted/20 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-base font-semibold text-foreground">{row.accountLabel}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{normalSideLabel}</div>
                    </div>
                    <Badge variant="outline">Starting {formatPlainAmount(row.startingBalance)}</Badge>
                  </div>
                  {mode === 'teaching' && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-white/80 px-3 py-2 text-xs text-blue-900">
                      {row.normalSide === 'debit' ? 'Debit increases assets and expenses.' : 'Credit increases liabilities, equity, and revenue.'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 border-b border-border/70">
                  <div className={cn('min-h-36 border-r border-border/70 p-4', sideIsDebit ? sideTone : 'bg-blue-50/20')}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Debit side</div>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg border border-sky-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm">
                        {sideIsDebit ? row.netPostingCue : 'Mirror the posting on this side only if it increases a debit balance.'}
                      </div>
                    </div>
                  </div>
                  <div className={cn('min-h-36 p-4', sideIsDebit ? 'bg-rose-50/20' : sideTone)}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Credit side</div>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg border border-rose-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm">
                        {!sideIsDebit ? row.netPostingCue : 'Mirror the posting on this side only if it increases a credit balance.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-b border-border/70 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.75fr)] md:items-center">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Posting cue</div>
                    <div className="text-sm text-foreground">{row.netPostingCue}</div>
                    {row.note && <div className="text-xs text-muted-foreground">{row.note}</div>}
                  </div>
                  <div className="space-y-1 md:text-right">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ending balance</div>
                    {editable ? (
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="w-full text-right tabular-nums md:w-44"
                        aria-label={`${row.accountLabel} ending balance`}
                        placeholder={row.placeholder ?? '0'}
                        value={value}
                        onChange={(event) => {
                          const nextValues = { ...currentValues, [row.id]: event.target.value };
                          updateValues(nextValues);
                        }}
                      />
                    ) : (
                      <div className="rounded-md border border-border/70 bg-background px-3 py-2 text-right font-mono text-sm tabular-nums">
                        {value === '' ? '—' : formatAccountingAmount(value)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <div className="text-sm text-muted-foreground">
                    {teacherView ? 'Teacher review keeps the submitted ending visible.' : 'Work from the posting trail, not the answer field first.'}
                  </div>
                  <div className="rounded-md bg-muted/60 px-3 py-1 text-xs font-mono text-muted-foreground">
                    {feedback?.message ?? (teacherView ? 'Awaiting review' : ' ')}
                  </div>
                </div>

                {teacherView && (
                  <div className="border-t border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-3">
                      <span>Selected: {feedback?.selectedLabel ?? '—'}</span>
                      <span>Expected: {feedback?.expectedLabel ?? '—'}</span>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {teacherView && misconceptionTags.length > 0 && (
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3 text-sm">
            <div className="mb-2 font-medium text-muted-foreground">Review tags</div>
            <div className="flex flex-wrap gap-2">
              {misconceptionTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
