'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PracticeMode } from '@/lib/practice/engine/types';
import { cn } from '@/lib/utils';

import { formatAccountingAmount, toNumber } from './utils';
import { TeachingModePanel } from './TeachingModePanel';

export interface StatementLayoutRow {
  id: string;
  label: string;
  kind: 'editable' | 'prefilled' | 'computed' | 'subtotal';
  editableField?: 'amount' | 'label';
  value?: number | string;
  placeholder?: string;
  sumOf?: string[];
  note?: string;
}

export interface StatementLayoutSection {
  id: string;
  label: string;
  description?: string;
  rows: StatementLayoutRow[];
}

export interface StatementLayoutFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  message?: string;
  misconceptionTags?: string[];
}

export interface StatementLayoutSummaryItem {
  label: string;
  value: string;
}

export interface StatementLayoutProps {
  title: string;
  description?: string;
  sections: StatementLayoutSection[];
  defaultValues?: Record<string, string>;
  values?: Record<string, string>;
  onValueChange?: (values: Record<string, string>) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  rowFeedback?: Record<string, StatementLayoutFeedback>;
  scenarioPanel?: ReactNode;
  scaffoldText?: string;
  reviewSummary?: StatementLayoutSummaryItem[];
  mode?: PracticeMode;
}

function getRowStatusClasses(status?: StatementLayoutFeedback['status']) {
  if (status === 'correct') {
    return 'border-emerald-500/40 bg-emerald-500/5';
  }

  if (status === 'incorrect') {
    return 'border-destructive/30 bg-destructive/5';
  }

  if (status === 'partial') {
    return 'border-amber-500/40 bg-amber-500/5';
  }

  return 'border-border bg-background';
}

function SummaryChip({ label, value }: StatementLayoutSummaryItem) {
  return (
    <div className="min-w-0 rounded-none border border-border bg-secondary/30 px-3 py-2">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-xs font-mono font-bold text-foreground">{value}</div>
    </div>
  );
}

function isLabelEditableRow(row: StatementLayoutRow) {
  return row.kind === 'editable' && row.editableField === 'label';
}

function isAmountEditableRow(row: StatementLayoutRow) {
  return row.kind === 'editable' && row.editableField !== 'label';
}

function formatStatementAmount(value: number | string | '' | null | undefined) {
  if (value === '' || value === null || value === undefined) {
    return '—';
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(numericValue) && numericValue < 0) {
    return `(${formatAccountingAmount(Math.abs(numericValue))})`;
  }

  return formatAccountingAmount(value);
}

function getRowRule(row: StatementLayoutRow, index: number, rows: StatementLayoutRow[]) {
  if (row.kind !== 'subtotal') {
    return 'none';
  }

  return index === rows.length - 1 ? 'double' : 'single';
}

export function StatementLayout({
  title,
  description,
  sections,
  defaultValues,
  values,
  onValueChange,
  readOnly = false,
  teacherView = false,
  rowFeedback = {},
  scenarioPanel,
  scaffoldText,
  reviewSummary,
  mode = 'guided_practice',
}: StatementLayoutProps) {
  const [internalValues, setInternalValues] = useState<Record<string, string>>(defaultValues ?? {});
  const currentValues = values ?? internalValues;
  const [announcement, setAnnouncement] = useState('');

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

  const rowCount = useMemo(() => sections.reduce((sum, section) => sum + section.rows.length, 0), [sections]);
  const rowLookup = useMemo(() => {
    return new Map(sections.flatMap((section) => section.rows.map((row) => [row.id, row] as const)));
  }, [sections]);
  const teachingSteps = useMemo(
    () => [
      'Read the section heading, then trace the line items from top to bottom.',
      'Fill each line item before you move to the subtotal line.',
      'Use the inner amount for row work and the outer total column for the final total.',
    ],
    [],
  );

  const resolvedReviewSummary = useMemo(() => {
    if (reviewSummary && reviewSummary.length > 0) {
      return reviewSummary;
    }

    if (!teacherView) {
      return [];
    }

    const editableRowCount = sections.reduce(
      (sum, section) => sum + section.rows.filter((row) => row.kind === 'editable').length,
      0,
    );
    const reviewCount = Object.values(rowFeedback).filter((feedback) => feedback.status !== 'correct').length;

    return [
      { label: 'Rows', value: String(rowCount) },
      { label: 'Editable', value: String(editableRowCount) },
      { label: 'Needs review', value: String(reviewCount) },
    ];
  }, [reviewSummary, teacherView, sections, rowCount, rowFeedback]);

  const computeSubtotal = (row: StatementLayoutRow) => {
    if (!row.sumOf?.length) {
      return row.value ?? '';
    }

    return row.sumOf.reduce((sum, rowId) => sum + toNumber(currentValues[rowId] ?? rowLookup.get(rowId)?.value ?? 0), 0);
  };

  const renderAmountValue = (row: StatementLayoutRow) => {
    if (row.kind === 'subtotal') {
      const subtotal = computeSubtotal(row);
      return subtotal === '' ? '' : subtotal;
    }

    if (isLabelEditableRow(row)) {
      return row.value ?? '';
    }

    if (isAmountEditableRow(row)) {
      return currentValues[row.id] ?? '';
    }

    return row.value ?? '';
  };

  const renderDisplayValue = (row: StatementLayoutRow, value: number | string | '') => {
    if (isLabelEditableRow(row) || isAmountEditableRow(row)) {
      return formatStatementAmount(value);
    }

    return formatStatementAmount(value);
  };

  const renderRow = (
    row: StatementLayoutRow,
    rowIndex: number,
    rows: StatementLayoutRow[],
    rowFeedbackForRow?: StatementLayoutFeedback,
    variant: 'desktop' | 'mobile' = 'desktop',
  ) => {
    const value = renderAmountValue(row);
    const formattedValue = renderDisplayValue(row, value);
    const statusClass = getRowStatusClasses(rowFeedbackForRow?.status);
    const noteId = row.note ? `${row.id}-note${variant === 'mobile' ? '-mobile' : ''}` : undefined;
    const feedbackId = teacherView && rowFeedbackForRow?.message ? `${row.id}-feedback${variant === 'mobile' ? '-mobile' : ''}` : undefined;
    const describedBy = [noteId, feedbackId].filter(Boolean).join(' ') || undefined;
    const rowRule = getRowRule(row, rowIndex, rows);
    const isSubtotal = row.kind === 'subtotal';

    if (variant === 'desktop') {
      return (
        <div
          key={row.id}
          data-row-id={row.id}
          data-row-kind={row.kind}
          data-row-rule={rowRule}
          className={cn(
            'grid items-start gap-3 px-4 transition-colors duration-150',
            teacherView
              ? 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.82fr)_minmax(0,0.82fr)_minmax(0,1.15fr)]'
              : 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.82fr)_minmax(0,0.82fr)]',
            isSubtotal && 'border-t border-border bg-secondary/40 font-bold',
            row.kind === 'prefilled' && 'bg-secondary/10',
            row.kind === 'editable' && 'bg-background',
            statusClass,
            !teacherView && row.kind === 'editable' && 'hover:bg-secondary/50 focus-within:bg-secondary/50',
            teacherView && rowFeedbackForRow && 'focus-within:bg-secondary/50',
            row.kind === 'editable' ? 'py-4' : 'py-3',
          )}
        >
          <div className={cn('space-y-1 py-0.5', isSubtotal ? 'pl-2' : 'pl-6')}>
            {isLabelEditableRow(row) && !readOnly ? (
              <div className="rounded-none border border-border bg-background px-2 py-1 focus-within:border-foreground">
                <Input
                  type="text"
                  inputMode="text"
                  className="h-10 border-0 bg-transparent px-0 text-left focus-visible:ring-0 font-mono text-xs uppercase"
                  aria-label={row.label}
                  aria-describedby={describedBy}
                  placeholder={row.placeholder ?? row.label}
                  value={currentValues[row.id] ?? ''}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateValues({
                      ...currentValues,
                      [row.id]: nextValue,
                    });
                    setAnnouncement(`${row.label} updated`);
                  }}
                />
              </div>
            ) : (
              <div className={cn('text-[11px] font-mono uppercase tracking-tight', isSubtotal ? 'font-bold text-foreground' : 'text-foreground/90', row.kind === 'prefilled' && 'text-muted-foreground')}>
                {isLabelEditableRow(row) ? currentValues[row.id] ?? row.placeholder ?? '—' : row.label}
              </div>
            )}
            {row.note && (
              <div id={noteId} className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                {row.note}
              </div>
            )}
          </div>
          <div className="flex justify-end py-0.5">
            {isSubtotal ? (
              <span aria-hidden className="inline-flex min-h-10 min-w-32 items-center justify-end px-2 py-1 text-right font-mono text-xs md:min-w-36">
                &nbsp;
              </span>
            ) : isAmountEditableRow(row) && !readOnly ? (
              <div className="w-32 rounded-none border border-border bg-background px-2 py-1 focus-within:border-foreground md:w-36">
                <Input
                  type="text"
                  inputMode="decimal"
                  className="h-10 border-0 bg-transparent px-0 text-right font-mono text-xs focus-visible:ring-0"
                  aria-label={row.label}
                  aria-describedby={describedBy}
                  placeholder={row.placeholder ?? '0'}
                  value={currentValues[row.id] ?? ''}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateValues({
                      ...currentValues,
                      [row.id]: nextValue,
                    });
                    setAnnouncement(`${row.label} updated`);
                  }}
                />
              </div>
            ) : (
              <span
                className={cn(
                  'inline-flex min-h-10 min-w-32 items-center justify-end px-2 py-1 text-right font-mono text-xs text-foreground md:min-w-36',
                  row.kind === 'prefilled' && 'text-muted-foreground',
                )}
              >
                {formattedValue === '' ? '—' : formattedValue}
              </span>
            )}
          </div>
          <div className="flex justify-end py-0.5">
            {isSubtotal ? (
              <span
                className={cn(
                  'inline-flex min-h-10 min-w-32 items-center justify-end px-2 py-1 text-right font-mono text-xs text-foreground md:min-w-36',
                  rowRule === 'single' && 'border-t border-border',
                  rowRule === 'double' && 'border-t border-foreground font-bold',
                )}
              >
                {formattedValue === '' ? '—' : formattedValue}
              </span>
            ) : (
              <span aria-hidden className="inline-flex min-h-10 min-w-32 items-center justify-end px-2 py-1 text-right font-mono text-xs md:min-w-36">
                &nbsp;
              </span>
            )}
          </div>
          {teacherView && (
            <div className="space-y-2 py-0.5">
              {rowFeedbackForRow ? (
                <>
                  <div
                    id={feedbackId}
                    className={cn(
                      'text-[10px] font-mono uppercase tracking-widest',
                      rowFeedbackForRow.status === 'correct' && 'text-emerald-500',
                      rowFeedbackForRow.status === 'incorrect' && 'text-destructive',
                      rowFeedbackForRow.status === 'partial' && 'text-amber-500',
                    )}
                  >
                    {rowFeedbackForRow.message ?? rowFeedbackForRow.status}
                  </div>
                  {rowFeedbackForRow.misconceptionTags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {rowFeedbackForRow.misconceptionTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">No review.</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <article
        key={row.id}
        data-row-id={row.id}
        data-row-kind={row.kind}
        data-row-rule={rowRule}
        className={cn(
          'space-y-3 rounded-none border px-4 py-4 transition-colors duration-150',
          isSubtotal && 'border-t border-border bg-secondary/40 font-bold',
          row.kind === 'prefilled' && 'bg-secondary/10',
          row.kind === 'editable' && 'bg-background',
          statusClass,
          row.kind === 'editable' && 'hover:bg-secondary/50 focus-within:bg-secondary/50',
        )}
      >
        <div className="space-y-1">
          {isLabelEditableRow(row) && !readOnly ? (
            <div className="rounded-none border border-border bg-background px-2 py-1 focus-within:border-foreground">
              <Input
                type="text"
                inputMode="text"
                className="h-10 border-0 bg-transparent px-0 text-left focus-visible:ring-0 font-mono text-xs uppercase"
                aria-label={row.label}
                aria-describedby={describedBy}
                placeholder={row.placeholder ?? row.label}
                value={currentValues[row.id] ?? ''}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateValues({
                    ...currentValues,
                    [row.id]: nextValue,
                  });
                  setAnnouncement(`${row.label} updated`);
                }}
              />
            </div>
          ) : (
            <div className={cn('text-xs font-mono uppercase tracking-tight', isSubtotal ? 'font-bold text-foreground' : 'text-foreground/90', row.kind === 'prefilled' && 'text-muted-foreground')}>
              {isLabelEditableRow(row) ? currentValues[row.id] ?? row.placeholder ?? '—' : row.label}
            </div>
          )}
          {row.note && (
            <div id={noteId} className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              {row.note}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {isAmountEditableRow(row) && !readOnly ? (
            <div className="rounded-none border border-border bg-background px-2 py-1 focus-within:border-foreground">
              <Input
                type="text"
                inputMode="decimal"
                className="h-10 border-0 bg-transparent px-0 text-right font-mono text-xs focus-visible:ring-0"
                aria-label={row.label}
                aria-describedby={describedBy}
                placeholder={row.placeholder ?? '0'}
                value={currentValues[row.id] ?? ''}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateValues({
                    ...currentValues,
                    [row.id]: nextValue,
                  });
                  setAnnouncement(`${row.label} updated`);
                }}
              />
            </div>
          ) : (
            <div
              className={cn(
                'flex min-h-10 items-center justify-end px-2 py-1 text-right font-mono text-xs',
                row.kind === 'prefilled' && 'text-muted-foreground',
                row.kind === 'subtotal' && 'font-bold text-foreground',
              )}
            >
              {formattedValue === '' ? '—' : formattedValue}
            </div>
          )}
        </div>
        {teacherView && (
          <div className="space-y-2">
            {rowFeedbackForRow ? (
              <>
                <div
                  id={feedbackId}
                  className={cn(
                    'text-[10px] font-mono uppercase tracking-widest',
                    rowFeedbackForRow.status === 'correct' && 'text-emerald-500',
                    rowFeedbackForRow.status === 'incorrect' && 'text-destructive',
                    rowFeedbackForRow.status === 'partial' && 'text-amber-500',
                  )}
                >
                  {rowFeedbackForRow.message ?? rowFeedbackForRow.status}
                </div>
                {rowFeedbackForRow.misconceptionTags?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {rowFeedbackForRow.misconceptionTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[9px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">No review.</div>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <div data-layout="statement-sheet" className="w-full bg-background border border-border">
      <div className="space-y-4 border-b border-border bg-secondary/10 px-6 py-10 text-center">
        <div className="space-y-2">
          <h2 className="text-balance text-2xl font-bold uppercase tracking-[0.3em] font-display">{title}</h2>
          {description && <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{description}</p>}
        </div>
        {scenarioPanel && <div className="mx-auto w-full max-w-4xl border border-border bg-background p-6 text-left">{scenarioPanel}</div>}
        {scaffoldText && (
          <div className="mx-auto w-full max-w-4xl border border-dashed border-border/50 bg-background/50 px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {scaffoldText}
          </div>
        )}
        {mode === 'teaching' && (
          <TeachingModePanel
            title="Statement walkthrough"
            summary="Walk the class through the statement from the heading down to the total line."
            steps={teachingSteps}
          />
        )}
      </div>
      <div className="space-y-12 px-6 py-10">
        {resolvedReviewSummary.length > 0 && (
          <div className="grid gap-px bg-border border border-border sm:grid-cols-2 xl:grid-cols-4">
            {resolvedReviewSummary.map((item) => (
              <div key={`${item.label}-${item.value}`} className="bg-background">
                <SummaryChip {...item} />
              </div>
            ))}
          </div>
        )}

        {sections.map((section) => (
          <section key={section.id} className="space-y-6">
            <div className="space-y-1 text-center">
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-muted-foreground">{section.label}</h3>
              {section.description && <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{section.description}</p>}
            </div>
            <div className="hidden md:block">
              <div className="border border-border bg-background">
                <div
                  className={cn(
                    'grid border-b border-border bg-secondary/20 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground',
                    teacherView
                      ? 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.82fr)_minmax(0,0.82fr)_minmax(0,1.15fr)]'
                      : 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.82fr)_minmax(0,0.82fr)]',
                  )}
                >
                  <div>Line item</div>
                  <div className="text-right">Inner</div>
                  <div className="text-right">Total</div>
                  {teacherView && <div>Review</div>}
                </div>
                <div className="divide-y divide-border/50">
                  {section.rows.map((row, index) => renderRow(row, index, section.rows, rowFeedback[row.id], 'desktop'))}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:hidden">
              {section.rows.map((row, index) => renderRow(row, index, section.rows, rowFeedback[row.id], 'mobile'))}
            </div>
          </section>
        ))}
        <div className="sr-only" aria-live="polite">
          {announcement}
        </div>
      </div>
    </div>
  );
}
