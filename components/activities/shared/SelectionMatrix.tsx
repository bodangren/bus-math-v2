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
          'flex min-h-11 w-full items-center justify-center rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isSelected ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background hover:bg-accent/40',
          teacherView && feedback?.status === 'correct' && 'border-emerald-500 bg-emerald-50',
          teacherView && feedback?.status === 'incorrect' && 'border-destructive bg-destructive/10',
          teacherView && feedback?.status === 'partial' && 'border-amber-500 bg-amber-50'
        )}
      >
        <span className="sr-only">
          {selectionMode === 'multiple' ? 'Toggle' : 'Select'} {column.label}
        </span>
        <span aria-hidden="true" className="font-medium">
          {isSelected ? '●' : '○'}
        </span>
      </button>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {teacherView && Object.keys(rowFeedback).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(rowFeedback).map(([rowId, feedback]) => (
              <Badge
                key={rowId}
                variant={feedback.status === 'correct' ? 'default' : feedback.status === 'incorrect' ? 'destructive' : 'secondary'}
              >
                {rowId}: {feedback.scoreLabel ?? feedback.status}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div role="grid" className="min-w-[640px]">
            <div className="grid grid-cols-[minmax(220px,1.2fr)_repeat(auto-fit,minmax(120px,1fr))] gap-2 pb-3">
              <div className="text-sm font-medium text-muted-foreground">Prompt</div>
              {columns.map((column) => (
                <div key={column.id} className="text-center">
                  <div className="text-sm font-medium">{column.label}</div>
                  {column.description && <div className="text-xs text-muted-foreground">{column.description}</div>}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {rows.map((row) => {
                const feedback = rowFeedback[row.id];
                return (
                  <div
                    key={row.id}
                    className={cn(
                      'grid grid-cols-[minmax(220px,1.2fr)_repeat(auto-fit,minmax(120px,1fr))] gap-2 rounded-lg border bg-background p-3',
                      teacherView && feedback?.status === 'correct' && 'border-emerald-500/50 bg-emerald-50/50',
                      teacherView && feedback?.status === 'incorrect' && 'border-destructive/60 bg-destructive/10',
                      teacherView && feedback?.status === 'partial' && 'border-amber-500/60 bg-amber-50/70'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{row.label}</div>
                      {row.description && <div className="text-sm text-muted-foreground">{row.description}</div>}
                      {row.hint && !readOnly && <div className="text-xs text-muted-foreground/80">{row.hint}</div>}
                      {teacherView && feedback?.misconceptionTags?.length ? (
                        <div className="text-xs text-muted-foreground">
                          Tags: {feedback.misconceptionTags.join(', ')}
                        </div>
                      ) : null}
                    </div>
                    {columns.map((column) => renderCell(row, column))}
                    {teacherView && feedback && (
                      <div className="col-span-full pt-1 text-xs text-muted-foreground">
                        {feedback.scoreLabel ?? feedback.status}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
