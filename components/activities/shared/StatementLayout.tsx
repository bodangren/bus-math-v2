'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { formatAccountingAmount, toNumber } from './utils';

export interface StatementLayoutRow {
  id: string;
  label: string;
  kind: 'editable' | 'prefilled' | 'computed' | 'subtotal';
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
}: StatementLayoutProps) {
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

  const rowLookup = useMemo(() => {
    return new Map(sections.flatMap((section) => section.rows.map((row) => [row.id, row] as const)));
  }, [sections]);

  const computeSubtotal = (row: StatementLayoutRow) => {
    if (!row.sumOf?.length) {
      return row.value ?? '';
    }

    return row.sumOf.reduce((sum, rowId) => sum + toNumber(currentValues[rowId] ?? rowLookup.get(rowId)?.value ?? 0), 0);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
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
                {rowId}: {feedback.message ?? feedback.status}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <section key={section.id} className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</h3>
              {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Line item</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => {
                    const feedback = rowFeedback[row.id];
                    const value =
                      row.kind === 'subtotal'
                        ? computeSubtotal(row)
                        : row.kind === 'editable'
                          ? currentValues[row.id] ?? ''
                          : row.value ?? '';
                    const formattedValue =
                      row.kind === 'editable'
                        ? value
                        : typeof value === 'number'
                          ? formatAccountingAmount(value)
                          : value;

                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          'border-b last:border-b-0',
                          row.kind === 'subtotal' && 'bg-muted/30 font-semibold',
                          teacherView && feedback?.status === 'correct' && 'bg-emerald-50/70',
                          teacherView && feedback?.status === 'incorrect' && 'bg-destructive/10',
                          teacherView && feedback?.status === 'partial' && 'bg-amber-50/70'
                        )}
                      >
                        <th className="px-3 py-2 text-left font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{row.label}</span>
                            {row.note && <span className="text-xs font-normal text-muted-foreground">{row.note}</span>}
                          </div>
                        </th>
                        <td className="px-3 py-2 text-right">
                          {row.kind === 'editable' && !readOnly ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              className="ml-auto w-32 text-right tabular-nums"
                              aria-label={row.label}
                              placeholder={row.placeholder ?? '0'}
                              value={currentValues[row.id] ?? ''}
                              onChange={(event) => {
                                updateValues({
                                  ...currentValues,
                                  [row.id]: event.target.value,
                                });
                              }}
                            />
                          ) : (
                            <span className="inline-block min-w-32 rounded-md px-2 py-1 text-right tabular-nums">
                              {formattedValue === '' ? '—' : formattedValue}
                            </span>
                          )}
                        </td>
                        {teacherView && feedback && (
                          <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                            {feedback.message ?? feedback.status}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        {teacherView && (
          <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-3">
              <span>Rows tracked: {sections.reduce((sum, section) => sum + section.rows.length, 0)}</span>
              <span>Editable values: {Object.keys(currentValues).length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
