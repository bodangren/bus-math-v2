'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatAccountingAmount } from './utils';
import {
  formatTrialBalanceBalanceAnswer,
  formatTrialBalanceLargerColumn,
  type TrialBalanceBalanceAnswer,
  type TrialBalanceErrorScenario,
  type TrialBalanceLargerColumn,
} from '@/lib/practice/engine/errors';
import {
  type TrialBalanceErrorResponse,
  type TrialBalanceErrorScenarioReviewFeedback,
} from '@/lib/practice/engine/families/trial-balance-errors';

type TrialBalanceResponseValue = TrialBalanceBalanceAnswer | number | TrialBalanceLargerColumn;

export interface TrialBalanceErrorMatrixSubmissionSummary {
  scoreLabel?: string;
  attempts?: number;
  submittedAt?: string;
  misconceptionCount?: number;
}

export interface TrialBalanceErrorMatrixProps {
  title: string;
  description?: string;
  scenarios: TrialBalanceErrorScenario[];
  defaultValue?: TrialBalanceErrorResponse;
  value?: TrialBalanceErrorResponse;
  onValueChange?: (value: TrialBalanceErrorResponse) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  rowFeedback?: Record<string, TrialBalanceErrorScenarioReviewFeedback>;
  submissionSummary?: TrialBalanceErrorMatrixSubmissionSummary;
}

function getSummaryValue(value: unknown) {
  if (typeof value === 'number') {
    return formatAccountingAmount(value);
  }

  if (value === 'still-balances' || value === 'out-of-balance') {
    return formatTrialBalanceBalanceAnswer(value);
  }

  if (value === 'debit' || value === 'credit' || value === 'neither') {
    return formatTrialBalanceLargerColumn(value);
  }

  return 'Not selected';
}

function isRenderableScenario(scenario: TrialBalanceErrorScenario | undefined) {
  return !!scenario && typeof scenario.rowId === 'string' && Array.isArray(scenario.differenceOptions) && scenario.differenceOptions.length > 0;
}

export function TrialBalanceErrorMatrix({
  title,
  description,
  scenarios,
  defaultValue,
  value,
  onValueChange,
  readOnly = false,
  teacherView = false,
  rowFeedback = {},
  submissionSummary,
}: TrialBalanceErrorMatrixProps) {
  const [internalValue, setInternalValue] = useState<TrialBalanceErrorResponse>(defaultValue ?? {});
  const [announcement, setAnnouncement] = useState('');
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (value === undefined && defaultValue) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const selectedValues = value ?? internalValue;
  const rowIndexes = useMemo(() => new Map(scenarios.map((scenario, index) => [scenario.rowId, index])), [scenarios]);
  const summaryScoreLabel =
    submissionSummary?.scoreLabel ??
    `${Object.values(rowFeedback).filter((feedback) => feedback.status === 'correct').length}/${scenarios.length} correct`;
  const summaryMisconceptionCount =
    submissionSummary?.misconceptionCount ??
    new Set(Object.values(rowFeedback).flatMap((feedback) => feedback.misconceptionTags ?? [])).size;

  const updateValue = (nextValue: TrialBalanceErrorResponse) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const focusCell = (rowIndex: number, target: string) => {
    const scenario = scenarios[rowIndex];
    if (!scenario) return;
    cellRefs.current.get(`${scenario.rowId}:${target}`)?.focus();
  };

  const focusNextRowBalanced = (rowId: string) => {
    const rowIndex = rowIndexes.get(rowId);
    if (rowIndex === undefined) return;
    focusCell(rowIndex + 1, 'balanced:still-balances');
  };

  const selectValue = (scenario: TrialBalanceErrorScenario, partId: string, nextValue: TrialBalanceResponseValue) => {
    if (readOnly) return;

    const next = {
      ...selectedValues,
      [partId]: nextValue,
    } satisfies TrialBalanceErrorResponse;

    updateValue(next);

    const label =
      partId.endsWith(':difference') && typeof nextValue === 'number'
        ? `${scenario.rowLabel} difference set to ${formatAccountingAmount(nextValue)}`
        : `${scenario.rowLabel} ${partId.includes(':balanced')
            ? 'balanced state'
            : 'larger column'} set to ${getSummaryValue(nextValue).toLowerCase()}`;
    setAnnouncement(label);

    if (partId.endsWith(':balanced')) {
      focusCell(rowIndexes.get(scenario.rowId) ?? 0, `difference:${scenario.differenceOptions[0]}`);
      return;
    }

    if (partId.endsWith(':difference')) {
      focusCell(rowIndexes.get(scenario.rowId) ?? 0, 'larger-column:debit');
      return;
    }

    if (partId.endsWith(':larger-column')) {
      focusNextRowBalanced(scenario.rowId);
    }
  };

  if (scenarios.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
            No trial-balance error scenarios generated for this preview seed.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {teacherView && (
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <Badge variant="secondary" className="justify-start gap-2">
              Score: {summaryScoreLabel}
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              Attempts: {submissionSummary?.attempts ?? '—'}
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              Submitted: {submissionSummary?.submittedAt ?? '—'}
            </Badge>
            <Badge variant="secondary" className="justify-start gap-2">
              Misconceptions: {summaryMisconceptionCount}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
        <p className="text-xs text-muted-foreground">
          Work left to right: decide whether the trial balance still balances before choosing the difference and larger column.
        </p>

        <div className="space-y-4">
          {scenarios.map((scenario, index) => {
            if (!isRenderableScenario(scenario)) {
              return (
                <div key={`malformed-${index}`} className="rounded-2xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                  This scenario could not be rendered.
                </div>
              );
            }

            const feedback = rowFeedback[scenario.rowId];
            const selectedBalanced = selectedValues[`${scenario.rowId}:balanced`];
            const selectedDifference = selectedValues[`${scenario.rowId}:difference`];
            const selectedLarger = selectedValues[`${scenario.rowId}:larger-column`];
            const rowStateClass =
              teacherView && feedback?.status === 'correct'
                ? 'border-emerald-500/50 bg-emerald-50/50'
                : teacherView && feedback?.status === 'incorrect'
                  ? 'border-destructive/60 bg-destructive/10'
                  : teacherView && feedback?.status === 'partial'
                    ? 'border-amber-500/60 bg-amber-50/70'
                    : 'border-border bg-background';

            return (
              <div key={scenario.rowId} className={cn('rounded-2xl border p-5 shadow-sm', rowStateClass)}>
                <div className="grid gap-4 xl:grid-cols-[minmax(240px,1.2fr)_repeat(3,minmax(0,1fr))]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold tracking-tight">{scenario.rowLabel}</div>
                      <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px] uppercase tracking-[0.18em]">
                        {scenario.archetypeLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{scenario.narrative}</p>
                    <p className="text-xs text-muted-foreground/80">{scenario.whatToDecideFirst}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Balanced?</div>
                    <div className="grid gap-2">
                      {scenario.balancedOptions.map((option) => {
                        const selected = selectedBalanced === option.id;
                        return (
                          <Button
                            key={option.id}
                            type="button"
                            variant={selected ? 'default' : 'outline'}
                            size="default"
                            className={cn('h-11 min-h-11 justify-start rounded-md', teacherView && feedback && 'pointer-events-none')}
                            disabled={readOnly}
                            ref={(element) => {
                              const key = `${scenario.rowId}:balanced:${option.id}`;
                              if (element) {
                                cellRefs.current.set(key, element);
                              } else {
                                cellRefs.current.delete(key);
                              }
                            }}
                            onClick={() => selectValue(scenario, `${scenario.rowId}:balanced`, option.id)}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Difference</div>
                    <div className="flex flex-wrap gap-2">
                      {scenario.differenceOptions.map((option) => {
                        const selected = selectedDifference === option;
                        return (
                          <Button
                            key={option}
                            type="button"
                            variant={selected ? 'default' : 'outline'}
                            size="sm"
                            className={cn('h-11 min-h-11 rounded-md px-3', teacherView && feedback && 'pointer-events-none')}
                            disabled={readOnly}
                            ref={(element) => {
                              const key = `${scenario.rowId}:difference:${option}`;
                              if (element) {
                                cellRefs.current.set(key, element);
                              } else {
                                cellRefs.current.delete(key);
                              }
                            }}
                            onClick={() => selectValue(scenario, `${scenario.rowId}:difference`, option)}
                          >
                            {formatAccountingAmount(option)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Larger column</div>
                    <div className="grid gap-2">
                      {scenario.largerColumnOptions.map((option) => {
                        const selected = selectedLarger === option.id;
                        return (
                          <Button
                            key={option.id}
                            type="button"
                            variant={selected ? 'default' : 'outline'}
                            size="default"
                            className={cn('h-11 min-h-11 justify-start rounded-md', teacherView && feedback && 'pointer-events-none')}
                            disabled={readOnly}
                            ref={(element) => {
                              const key = `${scenario.rowId}:larger-column:${option.id}`;
                              if (element) {
                                cellRefs.current.set(key, element);
                              } else {
                                cellRefs.current.delete(key);
                              }
                            }}
                            onClick={() => selectValue(scenario, `${scenario.rowId}:larger-column`, option.id)}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {teacherView && feedback && (
                  <div className="mt-4 rounded-xl border bg-muted/20 p-4">
                    <div className="grid gap-2 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Your answer</div>
                        <div className="mt-1 text-sm text-foreground">{feedback.selectedLabel ?? 'Not selected'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expected</div>
                        <div className="mt-1 text-sm text-foreground">{feedback.expectedLabel ?? '—'}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {feedback.scoreLabel && <Badge variant="secondary">{feedback.scoreLabel}</Badge>}
                      {(feedback.misconceptionTags ?? []).map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-background">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {feedback.message && <p className="mt-3 text-sm text-muted-foreground">{feedback.message}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
