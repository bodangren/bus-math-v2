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

function SummaryChip({ label, value }: StatementLayoutSummaryItem) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
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
            isSubtotal && 'border-t-2 border-border bg-muted/35 font-semibold',
            row.kind === 'prefilled' && 'bg-muted/10',
            row.kind === 'editable' && 'bg-background',
            statusClass,
            !teacherView && row.kind === 'editable' && 'hover:bg-accent/10 focus-within:bg-accent/10',
            teacherView && rowFeedbackForRow && 'focus-within:bg-accent/10',
            row.kind === 'editable' ? 'py-4' : 'py-3',
          )}
        >
          <div className={cn('space-y-1 py-0.5', isSubtotal ? 'pl-2' : 'pl-6')}>
            {isLabelEditableRow(row) && !readOnly ? (
              <div className="rounded-xl border border-border/80 bg-background px-2 py-1 shadow-inner focus-within:ring-1 focus-within:ring-ring">
                <Input
                  type="text"
                  inputMode="text"
                  className="h-11 border-0 bg-transparent px-0 text-left shadow-none focus-visible:ring-0 md:text-[15px]"
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
              <div className={cn('text-sm font-medium md:text-[15px]', row.kind === 'prefilled' && 'text-muted-foreground')}>
                {isLabelEditableRow(row) ? currentValues[row.id] ?? row.placeholder ?? '—' : row.label}
              </div>
            )}
            {row.note && (
              <div id={noteId} className="text-xs text-muted-foreground">
                {row.note}
              </div>
            )}
          </div>
          <div className="flex justify-end py-0.5">
            {isSubtotal ? (
              <span aria-hidden className="inline-flex min-h-11 min-w-32 items-center justify-end rounded-md px-2 py-1 text-right tabular-nums md:min-w-36">
                &nbsp;
              </span>
            ) : isAmountEditableRow(row) && !readOnly ? (
              <div className="w-32 rounded-xl border border-border/80 bg-background px-2 py-1 shadow-inner focus-within:ring-1 focus-within:ring-ring md:w-36">
                <Input
                  type="text"
                  inputMode="decimal"
                  className="h-11 border-0 bg-transparent px-0 text-right tabular-nums shadow-none focus-visible:ring-0"
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
                  'inline-flex min-h-11 min-w-32 items-center justify-end rounded-md px-2 py-1 text-right tabular-nums text-foreground md:min-w-36',
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
                  'inline-flex min-h-11 min-w-32 items-center justify-end rounded-md px-2 py-1 text-right tabular-nums text-foreground md:min-w-36',
                  rowRule === 'single' && 'border-t border-border',
                  rowRule === 'double' && 'border-t-2 border-border font-semibold',
                )}
              >
                {formattedValue === '' ? '—' : formattedValue}
              </span>
            ) : (
              <span aria-hidden className="inline-flex min-h-11 min-w-32 items-center justify-end rounded-md px-2 py-1 text-right tabular-nums md:min-w-36">
                &nbsp;
              </span>
            )}
          </div>
          {teacherView && (
            <div className="space-y-2 py-0.5 text-sm">
              {rowFeedbackForRow ? (
                <>
                  <div
                    id={feedbackId}
                    className={cn(
                      'text-xs font-medium',
                      rowFeedbackForRow.status === 'correct' && 'text-emerald-700',
                      rowFeedbackForRow.status === 'incorrect' && 'text-destructive',
                      rowFeedbackForRow.status === 'partial' && 'text-amber-700',
                    )}
                  >
                    {rowFeedbackForRow.message ?? rowFeedbackForRow.status}
                  </div>
                  {rowFeedbackForRow.misconceptionTags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {rowFeedbackForRow.misconceptionTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[11px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-xs text-muted-foreground">No review yet.</div>
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
          'space-y-3 rounded-2xl border px-4 py-4 transition-colors duration-150',
          isSubtotal && 'border-t-2 border-border bg-muted/35 font-semibold',
          row.kind === 'prefilled' && 'bg-muted/10',
          row.kind === 'editable' && 'bg-background',
          statusClass,
          row.kind === 'editable' && 'hover:bg-accent/10 focus-within:bg-accent/10',
        )}
      >
        <div className="space-y-1">
          {isLabelEditableRow(row) && !readOnly ? (
            <div className="rounded-xl border border-border/80 bg-background px-2 py-1 shadow-inner focus-within:ring-1 focus-within:ring-ring">
              <Input
                type="text"
                inputMode="text"
                className="h-11 border-0 bg-transparent px-0 text-left shadow-none focus-visible:ring-0"
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
            <div className={cn('text-sm font-medium', row.kind === 'prefilled' && 'text-muted-foreground')}>
              {isLabelEditableRow(row) ? currentValues[row.id] ?? row.placeholder ?? '—' : row.label}
            </div>
          )}
          {row.note && (
            <div id={noteId} className="text-xs text-muted-foreground">
              {row.note}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {isAmountEditableRow(row) && !readOnly ? (
            <div className="rounded-xl border border-border/80 bg-background px-2 py-1 shadow-inner focus-within:ring-1 focus-within:ring-ring">
              <Input
                type="text"
                inputMode="decimal"
                className="h-11 border-0 bg-transparent px-0 text-right tabular-nums shadow-none focus-visible:ring-0"
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
                'flex min-h-11 items-center justify-end rounded-md px-2 py-1 text-right tabular-nums',
                row.kind === 'prefilled' && 'text-muted-foreground',
                row.kind === 'subtotal' && 'font-semibold text-foreground',
              )}
            >
              {formattedValue === '' ? '—' : formattedValue}
            </div>
          )}
        </div>
        {teacherView && (
          <div className="space-y-2 text-sm">
            {rowFeedbackForRow ? (
              <>
                <div
                  id={feedbackId}
                  className={cn(
                    'text-xs font-medium',
                    rowFeedbackForRow.status === 'correct' && 'text-emerald-700',
                    rowFeedbackForRow.status === 'incorrect' && 'text-destructive',
                    rowFeedbackForRow.status === 'partial' && 'text-amber-700',
                  )}
                >
                  {rowFeedbackForRow.message ?? rowFeedbackForRow.status}
                </div>
                {rowFeedbackForRow.misconceptionTags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {rowFeedbackForRow.misconceptionTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-xs text-muted-foreground">No review yet.</div>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <Card data-layout="statement-sheet" className="w-full overflow-hidden border-border/70 bg-gradient-to-b from-background to-muted/15 shadow-sm">
      <CardHeader className="space-y-4 border-b bg-muted/20 px-6 py-6 text-center">
        <div className="space-y-1">
          <CardTitle className="text-pretty text-3xl font-semibold uppercase tracking-[0.28em]">{title}</CardTitle>
          {description && <CardDescription className="text-sm uppercase tracking-[0.18em]">{description}</CardDescription>}
        </div>
        {scenarioPanel && <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border/70 bg-card p-4 text-left shadow-sm">{scenarioPanel}</div>}
        {scaffoldText && (
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-dashed border-border/70 bg-background/90 px-4 py-3 text-left text-sm text-muted-foreground shadow-sm">
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
      </CardHeader>
      <CardContent className="space-y-8 px-6 py-6">
        {resolvedReviewSummary.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {resolvedReviewSummary.map((item) => (
              <SummaryChip key={`${item.label}-${item.value}`} {...item} />
            ))}
          </div>
        )}

        {sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{section.label}</h3>
              {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
            </div>
            <div className="hidden md:block">
              <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-sm">
                <div
                  className={cn(
                    'grid border-b bg-muted/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground',
                    teacherView
                      ? 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.82fr)_minmax(0,0.82fr)_minmax(0,1.15fr)]'
                      : 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.82fr)_minmax(0,0.82fr)]',
                  )}
                >
                  <div>Line item</div>
                  <div className="text-right">Inner amount</div>
                  <div className="text-right">Section total</div>
                  {teacherView && <div>Review</div>}
                </div>
                <div className="divide-y divide-border">
                  {section.rows.map((row, index) => renderRow(row, index, section.rows, rowFeedback[row.id], 'desktop'))}
                </div>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {section.rows.map((row, index) => renderRow(row, index, section.rows, rowFeedback[row.id], 'mobile'))}
            </div>
          </section>
        ))}
        <div className="sr-only" aria-live="polite">
          {announcement}
        </div>
      </CardContent>
    </Card>
  );
}
