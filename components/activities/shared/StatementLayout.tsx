'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { formatAccountingAmount, toNumber } from './utils';

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
      return formatAccountingAmount(value);
    }

    if (value === '' || value === null || value === undefined) {
      return '—';
    }

    return typeof value === 'number' ? formatAccountingAmount(value) : value;
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {scenarioPanel && <div className="space-y-3">{scenarioPanel}</div>}
        {scaffoldText && (
          <div className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {scaffoldText}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {resolvedReviewSummary.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {resolvedReviewSummary.map((item) => (
              <SummaryChip key={`${item.label}-${item.value}`} {...item} />
            ))}
          </div>
        )}

        {sections.map((section) => (
          <section key={section.id} className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{section.label}</h3>
              {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
            </div>
            <div className="hidden md:block">
              <div className="overflow-hidden rounded-2xl border bg-background/90">
                <div
                  className={cn(
                    'grid border-b bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground',
                    teacherView ? 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)_minmax(0,1.2fr)]' : 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)]',
                  )}
                >
                  <div>Line item</div>
                  <div className="text-right">Amount</div>
                  {teacherView && <div>Review</div>}
                </div>
                <div className="divide-y divide-border">
                  {section.rows.map((row) => {
                    const feedback = rowFeedback[row.id];
                    const value = renderAmountValue(row);
                    const formattedValue = renderDisplayValue(row, value);
                    const statusClass = getRowStatusClasses(feedback?.status);
                    const noteId = row.note ? `${row.id}-note` : undefined;
                    const feedbackId = teacherView && feedback?.message ? `${row.id}-feedback` : undefined;
                    const describedBy = [noteId, feedbackId].filter(Boolean).join(' ') || undefined;

                    return (
                      <div
                        key={row.id}
                        className={cn(
                          'grid items-start gap-3 px-4 transition-colors duration-150',
                          teacherView ? 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)_minmax(0,1.2fr)]' : 'grid-cols-[minmax(0,1.6fr)_minmax(0,0.95fr)]',
                          row.kind === 'subtotal' && 'border-t-2 border-border bg-muted/40 font-semibold',
                          row.kind === 'prefilled' && 'bg-muted/10',
                          row.kind === 'editable' && 'bg-background',
                          statusClass,
                          !teacherView && row.kind === 'editable' && 'hover:bg-accent/10 focus-within:bg-accent/10',
                          teacherView && feedback && 'focus-within:bg-accent/10',
                          row.kind === 'editable' ? 'py-4' : 'py-3',
                        )}
                      >
                        <div className="space-y-1 py-0.5">
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
                        {isAmountEditableRow(row) && !readOnly ? (
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
                              row.kind === 'subtotal' && 'font-semibold text-foreground',
                            )}
                          >
                            {formattedValue === '' ? '—' : formattedValue}
                          </span>
                        )}
                      </div>
                        {teacherView && (
                          <div className="space-y-2 py-0.5 text-sm">
                            {feedback ? (
                              <>
                                <div
                                  id={feedbackId}
                                  className={cn(
                                    'text-xs font-medium',
                                    feedback.status === 'correct' && 'text-emerald-700',
                                    feedback.status === 'incorrect' && 'text-destructive',
                                    feedback.status === 'partial' && 'text-amber-700',
                                  )}
                                >
                                  {feedback.message ?? feedback.status}
                                </div>
                                {feedback.misconceptionTags?.length ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {feedback.misconceptionTags.map((tag) => (
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
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {section.rows.map((row) => {
                const feedback = rowFeedback[row.id];
                const value = renderAmountValue(row);
                const formattedValue = renderDisplayValue(row, value);
                const statusClass = getRowStatusClasses(feedback?.status);
                const noteId = row.note ? `${row.id}-note-mobile` : undefined;
                const feedbackId = teacherView && feedback?.message ? `${row.id}-feedback-mobile` : undefined;
                const describedBy = [noteId, feedbackId].filter(Boolean).join(' ') || undefined;

                return (
                  <article
                    key={row.id}
                    className={cn(
                      'space-y-3 rounded-2xl border px-4 py-4 transition-colors duration-150',
                      row.kind === 'subtotal' && 'border-t-2 border-border bg-muted/40 font-semibold',
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
                      {teacherView && (
                        <div className="space-y-2 text-sm">
                          {feedback ? (
                            <>
                              <div
                                id={feedbackId}
                                className={cn(
                                  'text-xs font-medium',
                                  feedback.status === 'correct' && 'text-emerald-700',
                                  feedback.status === 'incorrect' && 'text-destructive',
                                  feedback.status === 'partial' && 'text-amber-700',
                                )}
                              >
                                {feedback.message ?? feedback.status}
                              </div>
                              {feedback.misconceptionTags?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {feedback.misconceptionTags.map((tag) => (
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
                  </article>
                );
              })}
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
