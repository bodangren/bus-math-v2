'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PracticeMode } from '@/lib/practice/engine/types';

import { formatAccountingAmount } from './utils';

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

export interface PostingBalanceListProps {
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

function getRowStatusClasses(status?: PostingBalanceFeedback['status']) {
  if (status === 'correct') {
    return 'border-emerald-500/40 bg-emerald-50/70';
  }

  if (status === 'incorrect') {
    return 'border-destructive/30 bg-destructive/10';
  }

  if (status === 'partial') {
    return 'border-amber-500/40 bg-amber-50/80';
  }

  return 'border-border bg-background';
}

function formatNormalSide(normalSide: PostingBalanceRow['normalSide']) {
  return `${normalSide[0].toUpperCase()}${normalSide.slice(1)} balance`;
}

export function PostingBalanceList({
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
}: PostingBalanceListProps) {
  const [internalValues, setInternalValues] = useState<Record<string, string>>(defaultValues ?? {});
  const currentValues = values ?? internalValues;

  useEffect(() => {
    if (values === undefined && defaultValues) {
      setInternalValues(defaultValues);
    }
  }, [defaultValues, values]);

  const rowsWithNotes = useMemo(
    () => rows.filter((row) => row.netPostingCue.toLowerCase().includes('no postings')),
    [rows],
  );

  const updateValues = (nextValues: Record<string, string>) => {
    if (values === undefined) {
      setInternalValues(nextValues);
    }
    onValueChange?.(nextValues);
  };

  const [announcement, setAnnouncement] = useState('');
  const misconceptionTags = useMemo(
    () => Array.from(new Set(Object.values(rowFeedback).flatMap((feedback) => feedback?.misconceptionTags ?? []))),
    [rowFeedback],
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Target rows: {rows.length}</Badge>
          <Badge variant="outline">Reference lines: {referenceLines.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{referenceTitle}</Badge>
            <span className="text-sm text-muted-foreground">Read the posting trail before solving ending balances.</span>
          </div>
          <div className="mt-4 divide-y divide-border rounded-xl border bg-background/90">
            {referenceLines.map((line) => (
              <div
                key={line.id}
                className="grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium">{line.date} • {line.accountLabel}</div>
                </div>
                <div className="font-mono text-sm text-muted-foreground">{line.effectLabel}</div>
              </div>
            ))}
          </div>
          {rowsWithNotes.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">Some ending balances stay unchanged.</p>
          )}
        </div>

        <div className="hidden md:block">
          <div className="overflow-hidden rounded-2xl border bg-background/90">
            <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] border-b bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <div>Account</div>
              <div>Starting</div>
              <div>Net cue</div>
              <div className="text-right">Ending balance</div>
              <div>Status</div>
            </div>
            <div className="divide-y divide-border">
              {rows.map((row) => {
                const feedback = rowFeedback[row.id];
                const editable = !readOnly;
                const value = currentValues[row.id] ?? String(row.value ?? '');
                return (
                  <div
                    key={row.id}
                    className={cn(
                      'grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-3 px-4 py-4 transition-colors focus-within:bg-accent/15',
                      getRowStatusClasses(feedback?.status),
                    )}
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{row.accountLabel}</div>
                      {mode === 'guided_practice' && (
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {formatNormalSide(row.normalSide)}
                        </div>
                      )}
                    </div>
                    <div className="tabular-nums text-muted-foreground">{formatAccountingAmount(row.startingBalance)}</div>
                    <div className="text-muted-foreground">{row.netPostingCue}</div>
                    <div className="space-y-2">
                      {editable ? (
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="w-28 text-right tabular-nums"
                          aria-label={`${row.accountLabel} ending balance`}
                          placeholder={row.placeholder ?? '0'}
                          value={value}
                          onChange={(event) => {
                            const nextValues = { ...currentValues, [row.id]: event.target.value };
                            updateValues(nextValues);
                            setAnnouncement(`${row.accountLabel} ending balance entered ${event.target.value || '0'}`);
                          }}
                        />
                      ) : (
                        <div className="w-28 rounded-md px-3 py-2 text-right tabular-nums">
                          {value === '' ? '—' : formatAccountingAmount(value)}
                        </div>
                      )}
                      {teacherView && feedback?.message && (
                        <div className="text-xs text-muted-foreground">{feedback.message}</div>
                      )}
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {feedback?.status ? (
                        <div className={cn('font-medium', feedback.status === 'correct' && 'text-emerald-700', feedback.status === 'incorrect' && 'text-destructive', feedback.status === 'partial' && 'text-amber-700')}>
                          {feedback.message ?? feedback.status}
                        </div>
                      ) : (
                        <div>Enter the ending amount.</div>
                      )}
                      {feedback?.misconceptionTags?.length ? (
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

        <div className="space-y-3 md:hidden">
          {rows.map((row) => {
            const feedback = rowFeedback[row.id];
            const editable = !readOnly;
            const value = currentValues[row.id] ?? String(row.value ?? '');
            return (
              <div
                key={row.id}
                className={cn(
                  'space-y-3 rounded-2xl border px-4 py-4 transition-colors focus-within:bg-accent/15',
                  getRowStatusClasses(feedback?.status),
                )}
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-foreground">{row.accountLabel}</div>
                  {mode === 'guided_practice' && (
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {formatNormalSide(row.normalSide)}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Starting</div>
                    <div className="tabular-nums">{formatAccountingAmount(row.startingBalance)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Net cue</div>
                    <div className="text-muted-foreground">{row.netPostingCue}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {editable ? (
                    <Input
                      type="text"
                      inputMode="decimal"
                      className="w-full text-right tabular-nums"
                      aria-label={`${row.accountLabel} ending balance`}
                      placeholder={row.placeholder ?? '0'}
                      value={value}
                      onChange={(event) => {
                        const nextValues = { ...currentValues, [row.id]: event.target.value };
                        updateValues(nextValues);
                        setAnnouncement(`${row.accountLabel} ending balance entered ${event.target.value || '0'}`);
                      }}
                    />
                  ) : (
                    <div className="rounded-md border bg-background px-3 py-2 text-right tabular-nums">
                      {value === '' ? '—' : formatAccountingAmount(value)}
                    </div>
                  )}
                  {teacherView && feedback?.message && (
                    <div className="text-xs text-muted-foreground">{feedback.message}</div>
                  )}
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {feedback?.status ? (
                    <div className={cn('font-medium', feedback.status === 'correct' && 'text-emerald-700', feedback.status === 'incorrect' && 'text-destructive', feedback.status === 'partial' && 'text-amber-700')}>
                      {feedback.message ?? feedback.status}
                    </div>
                  ) : (
                    <div>Enter the ending amount.</div>
                  )}
                  {feedback?.misconceptionTags?.length ? (
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

        {teacherView && misconceptionTags.length > 0 && (
          <div className="rounded-2xl border bg-muted/20 p-3 text-sm">
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

        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            {teacherView
              ? 'Teacher review keeps the submitted endings visible.'
              : 'Work from the posting trail, not from the answer field first.'}
          </div>
          <div className="rounded-md bg-muted/60 px-3 py-1 font-mono text-xs text-muted-foreground">
            {announcement || ' '}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
