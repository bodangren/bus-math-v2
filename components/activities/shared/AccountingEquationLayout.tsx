'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PracticeMode } from '@/lib/practice/engine/types';

import { formatAccountingAmount } from './utils';
import { TeachingModePanel } from './TeachingModePanel';

export type AccountingEquationTermId = 'assets' | 'liabilities' | 'equity';
const ACCOUNTING_TERM_ORDER: AccountingEquationTermId[] = ['assets', 'liabilities', 'equity'];

export interface AccountingEquationFact {
  id: AccountingEquationTermId;
  label: string;
  value: number | string;
}

export interface AccountingEquationTerm {
  id: AccountingEquationTermId;
  label: string;
  value?: number | string;
  hidden?: boolean;
  editable?: boolean;
  placeholder?: string;
  note?: string;
}

export interface AccountingEquationFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  message?: string;
  misconceptionTags?: string[];
  selectedLabel?: string;
  expectedLabel?: string;
}

export interface AccountingEquationLayoutProps {
  title: string;
  description?: string;
  facts: AccountingEquationFact[];
  terms: Record<AccountingEquationTermId, AccountingEquationTerm>;
  mode?: PracticeMode;
  helperText?: string;
  defaultValues?: Record<string, string>;
  values?: Record<string, string>;
  onValueChange?: (values: Record<string, string>) => void;
  readOnly?: boolean;
  teacherView?: boolean;
  feedback?: Partial<Record<AccountingEquationTermId, AccountingEquationFeedback>>;
}

function getStatusClasses(status?: AccountingEquationFeedback['status']) {
  if (status === 'correct') {
    return 'border-emerald-500/60 bg-emerald-50/80';
  }

  if (status === 'incorrect') {
    return 'border-destructive/40 bg-destructive/10';
  }

  if (status === 'partial') {
    return 'border-amber-500/50 bg-amber-50/80';
  }

  return 'border-border bg-background';
}

function EquationToken({
  term,
  value,
  editable,
  readOnly,
  onValueChange,
  feedback,
}: {
  term: AccountingEquationTerm;
  value: string;
  editable: boolean;
  readOnly: boolean;
  onValueChange?: (nextValue: string) => void;
  feedback?: AccountingEquationFeedback;
}) {
  return (
    <div
      className={cn(
        'min-w-[7.5rem] rounded-2xl border px-3 py-3 transition-colors focus-within:ring-1 focus-within:ring-ring md:min-w-[8.5rem]',
        getStatusClasses(feedback?.status),
      )}
    >
      <div className="space-y-2">
        <div className="space-y-1 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{term.label}</div>
          {term.note && <div className="text-xs text-muted-foreground">{term.note}</div>}
        </div>
        {editable && !readOnly ? (
          <Input
            type="text"
            inputMode="decimal"
            className="h-10 w-full border-0 bg-transparent px-0 text-right text-lg font-medium tabular-nums shadow-none focus-visible:ring-0"
            aria-label={`${term.label} amount`}
            placeholder={term.placeholder ?? '0'}
            value={value}
            onChange={(event) => onValueChange?.(event.target.value)}
          />
        ) : (
          <div className="min-h-10 rounded-lg px-1 py-2 text-right text-lg font-medium tabular-nums">
            {value === '' ? '—' : formatAccountingAmount(value)}
          </div>
        )}
      </div>
    </div>
  );
}

export function AccountingEquationLayout({
  title,
  description,
  facts,
  terms,
  mode = 'guided_practice',
  helperText,
  defaultValues,
  values,
  onValueChange,
  readOnly = false,
  teacherView = false,
  feedback = {},
}: AccountingEquationLayoutProps) {
  const [internalValues, setInternalValues] = useState<Record<string, string>>(defaultValues ?? {});
  const currentValues = values ?? internalValues;

  useEffect(() => {
    if (values === undefined && defaultValues) {
      setInternalValues(defaultValues);
    }
  }, [defaultValues, values]);

  const editableTermIds = useMemo(
    () =>
      ACCOUNTING_TERM_ORDER.filter((termId) => {
        const term = terms[termId];
        return Boolean(term?.editable);
      }),
    [terms],
  );

  const updateValues = (nextValues: Record<string, string>) => {
    if (values === undefined) {
      setInternalValues(nextValues);
    }
    onValueChange?.(nextValues);
  };

  const [announcement, setAnnouncement] = useState('');
  const helper = mode === 'guided_practice' ? helperText : undefined;
  const teacherRows = teacherView ? editableTermIds.map((termId) => [termId, feedback[termId] ?? null] as const) : [];
  const teacherSummary = teacherRows.find(([, rowFeedback]) => Boolean(rowFeedback))?.[1];
  const teachingSteps = ['Start with the given facts.', 'Solve the missing term from left to right.', 'Check that assets equal liabilities plus equity.'];

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Given facts</Badge>
          {facts.map((fact) => (
            <Badge key={fact.id} variant="outline" className="tabular-nums">
              {fact.label}: {formatAccountingAmount(fact.value)}
            </Badge>
          ))}
        </div>
        {mode === 'teaching' && (
          <TeachingModePanel
            title="Equation walkthrough"
            summary="Start from the given facts and solve the missing term step by step."
            steps={teachingSteps}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {helper && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {helper}
          </p>
        )}

        <div className="hidden md:flex md:flex-wrap md:items-end md:justify-center md:gap-3">
          <EquationToken
            term={terms.assets}
            value={currentValues.assets ?? String(terms.assets.value ?? '')}
            editable={Boolean(terms.assets.editable)}
            readOnly={readOnly}
            feedback={feedback.assets ?? undefined}
            onValueChange={(nextValue) => {
              const nextValues = { ...currentValues, assets: nextValue };
              updateValues(nextValues);
              setAnnouncement(`${terms.assets.label} amount updated to ${nextValue || '0'}`);
            }}
          />
          <div className="pb-4 text-2xl font-semibold text-muted-foreground">=</div>
          <EquationToken
            term={terms.liabilities}
            value={currentValues.liabilities ?? String(terms.liabilities.value ?? '')}
            editable={Boolean(terms.liabilities.editable)}
            readOnly={readOnly}
            feedback={feedback.liabilities ?? undefined}
            onValueChange={(nextValue) => {
              const nextValues = { ...currentValues, liabilities: nextValue };
              updateValues(nextValues);
              setAnnouncement(`${terms.liabilities.label} amount updated to ${nextValue || '0'}`);
            }}
          />
          <div className="pb-4 text-2xl font-semibold text-muted-foreground">+</div>
          <EquationToken
            term={terms.equity}
            value={currentValues.equity ?? String(terms.equity.value ?? '')}
            editable={Boolean(terms.equity.editable)}
            readOnly={readOnly}
            feedback={feedback.equity ?? undefined}
            onValueChange={(nextValue) => {
              const nextValues = { ...currentValues, equity: nextValue };
              updateValues(nextValues);
              setAnnouncement(`${terms.equity.label} amount updated to ${nextValue || '0'}`);
            }}
          />
        </div>

        <div className="space-y-3 md:hidden">
          <div className="mx-auto max-w-sm">
            <EquationToken
              term={terms.assets}
              value={currentValues.assets ?? String(terms.assets.value ?? '')}
              editable={Boolean(terms.assets.editable)}
              readOnly={readOnly}
              feedback={feedback.assets ?? undefined}
              onValueChange={(nextValue) => {
                const nextValues = { ...currentValues, assets: nextValue };
                updateValues(nextValues);
                setAnnouncement(`${terms.assets.label} amount updated to ${nextValue || '0'}`);
              }}
            />
          </div>
          <div className="flex items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            =
          </div>
          <div className="flex items-center justify-center gap-3">
            <EquationToken
              term={terms.liabilities}
              value={currentValues.liabilities ?? String(terms.liabilities.value ?? '')}
              editable={Boolean(terms.liabilities.editable)}
              readOnly={readOnly}
              feedback={feedback.liabilities ?? undefined}
              onValueChange={(nextValue) => {
                const nextValues = { ...currentValues, liabilities: nextValue };
                updateValues(nextValues);
                setAnnouncement(`${terms.liabilities.label} amount updated to ${nextValue || '0'}`);
              }}
            />
            <div className="text-xl font-semibold text-muted-foreground">+</div>
            <EquationToken
              term={terms.equity}
              value={currentValues.equity ?? String(terms.equity.value ?? '')}
              editable={Boolean(terms.equity.editable)}
              readOnly={readOnly}
              feedback={feedback.equity ?? undefined}
              onValueChange={(nextValue) => {
                const nextValues = { ...currentValues, equity: nextValue };
                updateValues(nextValues);
                setAnnouncement(`${terms.equity.label} amount updated to ${nextValue || '0'}`);
              }}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Equation check</Badge>
            <span className="text-sm text-muted-foreground">
              Assets = Liabilities + Owner&apos;s Equity
            </span>
          </div>
          {(teacherSummary?.message || Object.keys(feedback).length > 0) && (
            <p className="text-sm text-muted-foreground">{teacherSummary?.message ?? 'Review the edited term against the balance equation.'}</p>
          )}

          {teacherView && teacherRows.length > 0 && (
            <div className="space-y-3">
              {teacherRows.map(([termId, termFeedback]) => {
                const term = terms[termId];
                if (!termFeedback || !term) {
                  return null;
                }

                const submittedValue = currentValues[termId] ?? String(term.value ?? '');
                return (
                  <div
                    key={termId}
                    className={cn(
                      'grid gap-2 rounded-xl border bg-background/80 p-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center',
                      termFeedback.status === 'correct' && 'border-emerald-200 bg-emerald-50/70',
                      termFeedback.status === 'incorrect' && 'border-destructive/20 bg-destructive/10',
                      termFeedback.status === 'partial' && 'border-amber-200 bg-amber-50/80',
                    )}
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Student</div>
                      <div className="tabular-nums">{formatAccountingAmount(submittedValue)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Expected</div>
                      <div className="tabular-nums">{formatAccountingAmount(term.value ?? '')}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tag</div>
                      <div className="flex flex-wrap gap-2">
                        {termFeedback.misconceptionTags?.length ? (
                          termFeedback.misconceptionTags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/80 px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            {teacherView
              ? 'Teacher review locks the workbench and keeps the student answer visible.'
              : 'Enter the missing term directly in the equation workbench.'}
          </div>
          <div className="rounded-md bg-muted/60 px-3 py-1 font-mono text-xs text-muted-foreground">
            {announcement || ' '}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
