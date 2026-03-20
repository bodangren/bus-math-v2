'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SelectionMode = 'single' | 'multiple';

export interface SelectionMatrixColumn {
  id: string;
  label: string;
  description?: string;
}

export interface SelectionMatrixRow {
  id: string;
  label: string;
  description?: string;
  selectionMode?: SelectionMode;
  hint?: string;
}

export interface SelectionMatrixRowFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  misconceptionTags?: string[];
  selectedLabel?: string;
  expectedLabel?: string;
  message?: string;
}

export interface SelectionMatrixReviewSummary {
  scoreLabel?: string;
  attempts?: number;
  submittedAt?: string;
  misconceptionCount?: number;
}

export interface SelectionMatrixProps {
  title: string;
  description?: string;
  rows: SelectionMatrixRow[];
  columns: SelectionMatrixColumn[];
  defaultValue?: Record<string, string | string[]>;
  value?: Record<string, string | string[]>;
  onValueChange?: (value: Record<string, string | string[]>) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  rowFeedback?: Record<string, SelectionMatrixRowFeedback>;
  submissionSummary?: SelectionMatrixReviewSummary;
}

function getSelectedValues(entry: string | string[] | undefined, selectionMode: SelectionMode) {
  if (selectionMode === 'multiple') {
    return Array.isArray(entry) ? entry : entry ? [entry] : [];
  }

  return typeof entry === 'string' ? entry : undefined;
}

function toggleSelectedValue(
  current: Record<string, string | string[]>,
  row: SelectionMatrixRow,
  columnId: string,
) {
  const selectionMode = row.selectionMode ?? 'single';
  const existing = getSelectedValues(current[row.id], selectionMode);

  if (selectionMode === 'multiple') {
    const next = new Set(existing ?? []);
    if (next.has(columnId)) {
      next.delete(columnId);
    } else {
      next.add(columnId);
    }

    return {
      ...current,
      [row.id]: Array.from(next),
    };
  }

  return {
    ...current,
    [row.id]: columnId,
  };
}

export function SelectionMatrix({
  title,
  description,
  rows,
  columns,
  defaultValue,
  value,
  onValueChange,
  readOnly = false,
  teacherView = false,
  rowFeedback = {},
  submissionSummary,
}: SelectionMatrixProps) {
  const [internalValue, setInternalValue] = useState<Record<string, string | string[]>>(defaultValue ?? {});
  const selectedValues = value ?? internalValue;
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (value === undefined && defaultValue) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, value]);

  const rowIndexes = useMemo(() => new Map(rows.map((row, index) => [row.id, index])), [rows]);
  const columnIndexes = useMemo(() => new Map(columns.map((column, index) => [column.id, index])), [columns]);
  const columnLabels = useMemo(() => new Map(columns.map((column) => [column.id, column.label])), [columns]);
  const summaryScoreLabel =
    submissionSummary?.scoreLabel ??
    `${Object.values(rowFeedback).filter((feedback) => feedback.status === 'correct').length}/${rows.length} correct`;
  const summaryMisconceptionCount =
    submissionSummary?.misconceptionCount ??
    new Set(Object.values(rowFeedback).flatMap((feedback) => feedback.misconceptionTags ?? [])).size;

  const updateValue = (nextValue: Record<string, string | string[]>) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const moveFocus = (rowId: string, columnId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const rowIndex = rowIndexes.get(rowId);
    const columnIndex = columnIndexes.get(columnId);
    if (rowIndex === undefined || columnIndex === undefined) {
      return;
    }

    const nextRowIndex = direction === 'up' ? rowIndex - 1 : direction === 'down' ? rowIndex + 1 : rowIndex;
    const nextColumnIndex = direction === 'left' ? columnIndex - 1 : direction === 'right' ? columnIndex + 1 : columnIndex;
    const nextRow = rows[nextRowIndex];
    const nextColumn = columns[nextColumnIndex];
    if (!nextRow || !nextColumn) {
      return;
    }

    const nextCell = cellRefs.current.get(`${nextRow.id}:${nextColumn.id}`);
    nextCell?.focus();
  };

  const renderCell = (row: SelectionMatrixRow, column: SelectionMatrixColumn) => {
    const selectionMode = row.selectionMode ?? 'single';
    const rowValue = selectedValues[row.id];
    const isSelected =
      selectionMode === 'multiple'
        ? Array.isArray(rowValue) && rowValue.includes(column.id)
        : rowValue === column.id;
    const feedback = rowFeedback[row.id];

    return (
      <button
        key={column.id}
        ref={(element) => {
          const key = `${row.id}:${column.id}`;
          if (element) {
            cellRefs.current.set(key, element);
          } else {
            cellRefs.current.delete(key);
          }
        }}
        type="button"
        role={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
        aria-checked={isSelected}
        aria-label={`${row.label} ${column.label}`}
        disabled={readOnly}
        onClick={() => {
          if (readOnly) return;
          updateValue(toggleSelectedValue(selectedValues, row, column.id));
        }}
        onKeyDown={(event) => {
          if (readOnly) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            updateValue(toggleSelectedValue(selectedValues, row, column.id));
            return;
          }

          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            moveFocus(row.id, column.id, 'left');
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            moveFocus(row.id, column.id, 'right');
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveFocus(row.id, column.id, 'up');
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveFocus(row.id, column.id, 'down');
          }
        }}
        className={cn(
          'flex min-h-11 w-full flex-col items-center justify-center rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isSelected ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background hover:bg-accent/40',
          teacherView && feedback?.status === 'correct' && 'border-emerald-500 bg-emerald-50',
          teacherView && feedback?.status === 'incorrect' && 'border-destructive bg-destructive/10',
          teacherView && feedback?.status === 'partial' && 'border-amber-500 bg-amber-50'
        )}
      >
        <span className="sr-only">
          {selectionMode === 'multiple' ? 'Toggle' : 'Select'} {column.label}
        </span>
        <span aria-hidden="true" className="font-medium leading-none">
          {isSelected ? '●' : '○'}
        </span>
        <span aria-hidden="true" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-current/90">
          {column.label}
        </span>
      </button>
    );
  };

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
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {rows.map((row) => {
            const feedback = rowFeedback[row.id];
            const selectedValue = selectedValues[row.id];
            const selectedLabel =
              feedback?.selectedLabel ??
              (typeof selectedValue === 'string' ? columnLabels.get(selectedValue) : undefined) ??
              'Not selected';
            const expectedLabel = feedback?.expectedLabel ?? (feedback?.status === 'correct' ? selectedLabel : undefined);

            return (
              <div
                key={row.id}
                className={cn(
                  'rounded-xl border bg-background p-4',
                  teacherView && feedback?.status === 'correct' && 'border-emerald-500/50 bg-emerald-50/50',
                  teacherView && feedback?.status === 'incorrect' && 'border-destructive/60 bg-destructive/10',
                  teacherView && feedback?.status === 'partial' && 'border-amber-500/60 bg-amber-50/70'
                )}
              >
                <div className="grid gap-3 md:grid-cols-[minmax(220px,1.2fr)_minmax(0,1fr)]">
                  <div className="space-y-1">
                    <div className="font-medium">{row.label}</div>
                    {row.description && <div className="text-sm text-muted-foreground">{row.description}</div>}
                    {row.hint && !readOnly && <div className="text-xs text-muted-foreground/80">{row.hint}</div>}
                  </div>
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                  >
                    {columns.map((column) => renderCell(row, column))}
                  </div>
                </div>
                {teacherView && feedback && (
                  <div className="mt-3 space-y-2 rounded-lg border bg-muted/20 p-3">
                    <p className="text-sm font-medium text-foreground">
                      Your answer: {selectedLabel}.{expectedLabel ? ` Expected: ${expectedLabel}.` : ''}
                    </p>
                    {feedback.message && <p className="text-xs text-muted-foreground">{feedback.message}</p>}
                    {feedback.scoreLabel && <p className="text-xs text-muted-foreground">{feedback.scoreLabel}</p>}
                    {feedback.misconceptionTags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {feedback.misconceptionTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
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
