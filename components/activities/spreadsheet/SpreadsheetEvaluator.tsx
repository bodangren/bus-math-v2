'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Save, XCircle } from 'lucide-react';
import { z } from 'zod';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  SpreadsheetWrapper,
  type SpreadsheetData,
  type SpreadsheetCell,
  a1ToCoordinates,
} from '@/components/activities/spreadsheet';
import type { Activity } from '@/lib/db/schema/validators';
import type { PracticeSubmissionCallbackPayload } from '@/lib/practice/contract';
import { buildSpreadsheetEvaluatorSubmission } from '@/lib/activities/spreadsheet-practice';

const targetCellSchema = z.object({
  cell: z.string(),
  expectedValue: z.union([z.string(), z.number()]),
  expectedFormula: z.string().optional(),
});

export const spreadsheetEvaluatorConfigSchema = z.object({
  templateId: z.string(),
  instructions: z.string(),
  targetCells: z.array(targetCellSchema).min(1),
  initialData: z.array(z.array(z.any())).optional(),
});

export type SpreadsheetEvaluatorConfig = z.infer<typeof spreadsheetEvaluatorConfigSchema>;

export type SpreadsheetEvaluatorActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'spreadsheet-evaluator';
  props: SpreadsheetEvaluatorConfig;
};

export const SPREADSHEET_EVALUATOR_SUPPORTED_MODES = ['assessment'] as const;
const SPREADSHEET_EVALUATOR_DEFAULT_MODE = 'assessment' as const;

interface SpreadsheetEvaluatorProps {
  activity: SpreadsheetEvaluatorActivity;
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void;
}

interface CellFeedback {
  cell: string;
  isCorrect: boolean;
  message?: string;
}

const AUTO_SAVE_DELAY = 30000;

function normalizeValue(value: string | number): string {
  return typeof value === 'number' ? value.toString().toLowerCase().trim() : value.toString().toLowerCase().trim();
}

function getEmptySpreadsheet(): SpreadsheetData {
  return Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => ({ value: '' })),
  );
}

function initializeSpreadsheet(initialData?: SpreadsheetData): SpreadsheetData {
  if (initialData && Array.isArray(initialData)) {
    return initialData.map((row) =>
      row.map((cell) => {
        if (cell === null || cell === undefined) {
          return { value: '' };
        }
        if (typeof cell === 'object' && 'value' in cell) {
          return cell as SpreadsheetCell;
        }
        return { value: cell };
      }),
    );
  }

  return getEmptySpreadsheet();
}

interface AiFeedback {
  preliminaryScore: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  rawAiResponse: string;
}

interface SpreadsheetAttempt {
  _id: string;
  attemptNumber: number;
  spreadsheetData: SpreadsheetData;
  validationResult: {
    isComplete: boolean;
    totalCells: number;
    correctCells: number;
    feedback: CellFeedback[];
    timestamp: string;
  };
  aiFeedback?: AiFeedback;
  teacherScoreOverride?: number;
  teacherFeedbackOverride?: string;
  gradedBy?: string;
  gradedAt?: number;
}

export function SpreadsheetEvaluator({ activity, onSubmit }: SpreadsheetEvaluatorProps) {
  const [data, setData] = useState<SpreadsheetData>(() => initializeSpreadsheet(activity.props.initialData));
  const [feedback, setFeedback] = useState<CellFeedback[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [_attemptHistory, setAttemptHistory] = useState<SpreadsheetAttempt[]>([]);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [_isLoadingInitial, setIsLoadingInitial] = useState(true);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  const targetCells = activity.props.targetCells;

  const saveAsDraft = useCallback(async () => {
    if (!hasUnsavedChanges.current) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/activities/spreadsheet/${activity.id}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftData: data }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
      }
    } catch (saveError) {
      console.error('Auto-save failed:', saveError);
    } finally {
      setIsSaving(false);
    }
  }, [activity.id, data]);

  const handleChange = useCallback((newData: SpreadsheetData) => {
    setData(newData);
    hasUnsavedChanges.current = true;
    setError(null);

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      void saveAsDraft();
    }, AUTO_SAVE_DELAY);
  }, [saveAsDraft]);

  useEffect(() => () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        setIsLoadingInitial(true);
        const response = await fetch(`/api/activities/spreadsheet/${activity.id}/submit`);
        if (response.ok) {
          const result = await response.json();
          if (result.spreadsheetData) {
            setData(initializeSpreadsheet(result.spreadsheetData));
          }
          if (result.attemptHistory) {
            setAttemptHistory(result.attemptHistory);
            if (result.attemptHistory.length > 0) {
              const lastAttempt = result.attemptHistory[result.attemptHistory.length - 1];
              setAttemptNumber(lastAttempt.attemptNumber);
              setSubmitted(true);
              setFeedback(lastAttempt.validationResult.feedback);
              if (lastAttempt.aiFeedback) {
                setAiFeedback(lastAttempt.aiFeedback);
              }
            }
          }
          if (result.maxAttempts) {
            setMaxAttempts(result.maxAttempts);
          }
        }
      } catch (loadError) {
        console.error('Failed to load initial state:', loadError);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    void loadInitialState();
  }, [activity.id]);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch(`/api/activities/spreadsheet/${activity.id}/draft`);
        if (response.ok) {
          const result = await response.json();
          if (result.draftData && !submitted) {
            setData(initializeSpreadsheet(result.draftData));
            setLastSaved(new Date(result.updatedAt));
          }
        }
      } catch (loadError) {
        console.error('Failed to load draft:', loadError);
      }
    };

    if (!submitted) {
      void loadDraft();
    }
  }, [activity.id, submitted]);

  const getCellValue = useCallback((cellRef: string): string | number => {
    try {
      const { row, col } = a1ToCoordinates(cellRef);
      const cell = data[row]?.[col];
      return cell?.value ?? '';
    } catch {
      return '';
    }
  }, [data]);

  const validateSpreadsheet = useCallback((): CellFeedback[] => {
    return targetCells.map((target) => {
      const actualValue = getCellValue(target.cell);
      const isCorrect = normalizeValue(actualValue) === normalizeValue(target.expectedValue);

      return {
        cell: target.cell,
        isCorrect,
        message: isCorrect
          ? `Correct! Cell ${target.cell} has the expected value.`
          : `Cell ${target.cell}: expected "${target.expectedValue}", but got "${actualValue}"`,
      };
    });
  }, [getCellValue, targetCells]);

  const getHighlightedData = useCallback((currentFeedback: CellFeedback[]): SpreadsheetData => {
    if (!submitted || currentFeedback.length === 0) {
      return data;
    }

    const highlighted = data.map((row) =>
      row.map((cell) => ({
        value: cell?.value ?? '',
        readOnly: cell?.readOnly,
        className: cell?.className,
      } as SpreadsheetCell)),
    );

    for (const entry of currentFeedback) {
      try {
        const { row, col } = a1ToCoordinates(entry.cell);
        if (highlighted[row]?.[col]) {
          highlighted[row][col] = {
            value: highlighted[row][col].value,
            readOnly: highlighted[row][col].readOnly,
            className: entry.isCorrect
              ? 'bg-green-100 border-green-500'
              : 'bg-red-100 border-red-500',
          };
        }
      } catch (highlightError) {
        console.error(`Failed to highlight cell ${entry.cell}:`, highlightError);
      }
    }

    return highlighted;
  }, [data, submitted]);

  const targetStatuses = useMemo(() => {
    const feedbackByCell = new Map(feedback.map((entry) => [entry.cell, entry] as const));

    return targetCells.map((target) => {
      const result = feedbackByCell.get(target.cell);

      if (!submitted) {
        return {
          cell: target.cell,
          expectedValue: target.expectedValue,
          status: 'pending' as const,
          message: 'Not checked yet',
        };
      }

      return {
        cell: target.cell,
        expectedValue: target.expectedValue,
        status: result?.isCorrect ? 'correct' as const : 'incorrect' as const,
        message: result?.message ?? `Cell ${target.cell} needs attention.`,
      };
    });
  }, [feedback, submitted, targetCells]);

  const statusAnnouncement = submitted
    ? feedback.every((entry) => entry.isCorrect)
      ? 'All target cells are correct.'
      : `${feedback.filter((entry) => entry.isCorrect).length} of ${feedback.length} target cells are correct.`
    : hasUnsavedChanges.current
      ? 'Unsaved changes are present.'
      : 'Worksheet ready for review.';

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const localValidation = validateSpreadsheet();
    const localFeedback = localValidation;

    try {
      const response = await fetch(`/api/activities/spreadsheet/${activity.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetData: data,
          targetCells,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Submission failed');
      }

      const result = await response.json();
      const mergedFeedback = result.feedback?.length ? result.feedback : localFeedback;

      setAttemptNumber(result.attemptNumber);
      setSubmitted(true);
      setFeedback(mergedFeedback);
      if (result.aiFeedback) {
        setAiFeedback(result.aiFeedback);
      }
      hasUnsavedChanges.current = false;

      // Update attempt history
      setAttemptHistory((prev) => [
        ...prev,
        {
          _id: result.attemptId,
          attemptNumber: result.attemptNumber,
          spreadsheetData: data,
          validationResult: {
            isComplete: Boolean(result.isComplete),
            totalCells: localValidation.length,
            correctCells: mergedFeedback.filter((entry: CellFeedback) => entry.isCorrect).length,
            feedback: mergedFeedback.map((entry: CellFeedback) => ({
              cell: entry.cell,
              isCorrect: entry.isCorrect,
              message: entry.message,
            })),
            timestamp: new Date().toISOString(),
          },
          aiFeedback: result.aiFeedback,
        },
      ]);

      onSubmit?.(
        buildSpreadsheetEvaluatorSubmission({
          activityId: activity.id,
          templateId: activity.props.templateId,
          instructions: activity.props.instructions,
          targetCells,
          spreadsheetData: data,
          validationResult: {
            isComplete: Boolean(result.isComplete),
            totalCells: localValidation.length,
            correctCells: mergedFeedback.filter((entry: CellFeedback) => entry.isCorrect).length,
            feedback: mergedFeedback.map((entry: CellFeedback) => ({
              cell: entry.cell,
              isCorrect: entry.isCorrect,
              message: entry.message,
            })),
            timestamp: new Date().toISOString(),
          },
          attemptNumber: attemptNumber + 1,
          mode: SPREADSHEET_EVALUATOR_DEFAULT_MODE,
        }),
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [activity.id, activity.props.instructions, activity.props.templateId, attemptNumber, data, onSubmit, targetCells, validateSpreadsheet]);

  const handleRevise = useCallback(() => {
    setSubmitted(false);
    setAiFeedback(null);
    // Keep the current data (previous submission) so student can revise
  }, []);

  // Reference unused variables to avoid lint errors
  void _attemptHistory;
  void _isLoadingInitial;

  const isComplete = submitted && feedback.every((entry) => entry.isCorrect);
  const correctCount = feedback.filter((entry) => entry.isCorrect).length;
  const totalCount = targetCells.length;
  const renderedData = getHighlightedData(feedback);
  const canRevise = submitted && attemptNumber < maxAttempts;
  const isMaxAttemptsReached = submitted && attemptNumber >= maxAttempts;

  return (
    <Card className="mx-auto w-full max-w-7xl">
      <CardHeader className="space-y-4 border-b">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex flex-wrap items-center gap-3 text-2xl">
              {activity.displayName || 'Spreadsheet Exercise'}
              <Badge variant="outline" className="uppercase">
                {SPREADSHEET_EVALUATOR_DEFAULT_MODE.replace('_', ' ')}
              </Badge>
              {submitted ? (
                <Badge variant={isComplete ? 'default' : 'destructive'}>
                  {correctCount}/{totalCount} correct
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {targetCells.length} targets
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{activity.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
            {lastSaved && !isSaving ? <div>Last saved: {lastSaved.toLocaleTimeString()}</div> : null}
            {isSaving ? (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </div>
            ) : null}
            {attemptNumber > 0 ? <div>Attempt {attemptNumber} of {maxAttempts}</div> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">What you are building:</span>
            <span>Worksheet targets with teacher-visible evidence</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Completion rule:</span>
            <span>{targetCells.length} target cells must match</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <p className="sr-only" aria-live="polite">
          {statusAnnouncement}
        </p>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
          <div className="space-y-4">
            <Alert>
              <AlertDescription>{activity.props.instructions}</AlertDescription>
            </Alert>

            {error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {isComplete ? (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Excellent work! All cells are correct.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="overflow-hidden rounded-lg border">
              <SpreadsheetWrapper
                initialData={renderedData}
                onChange={submitted ? undefined : handleChange}
                readOnly={submitted}
                showColumnLabels
                showRowLabels
                className="min-h-[420px]"
              />
            </div>

            {submitted && feedback.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Validation Results</h3>
                <div className="space-y-2">
                  {feedback.map((entry) => (
                    <div
                      key={entry.cell}
                      className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                        entry.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      {entry.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 text-red-600" />
                      )}
                      <span className={entry.isCorrect ? 'text-green-800' : 'text-red-800'}>
                        {entry.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {submitted && aiFeedback ? (
              <div className="space-y-4 border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                    AI Preliminary Feedback
                  </h3>
                  <Badge variant="outline" className="text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                    Score: {aiFeedback.preliminaryScore}/40
                  </Badge>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  This is AI-generated preliminary feedback and not a final grade. Your teacher will review your work.
                </p>

                {aiFeedback.strengths.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-200 uppercase tracking-wide">
                      Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-300">
                      {aiFeedback.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiFeedback.improvements.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-200 uppercase tracking-wide">
                      Areas to Improve
                    </h4>
                    <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-300">
                      {aiFeedback.improvements.map((improvement, idx) => (
                        <li key={idx}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiFeedback.nextSteps.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-200 uppercase tracking-wide">
                      Next Steps
                    </h4>
                    <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-300">
                      {aiFeedback.nextSteps.map((nextStep, idx) => (
                        <li key={idx}>{nextStep}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {isMaxAttemptsReached && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTitle className="text-orange-800">Awaiting Teacher Review</AlertTitle>
                <AlertDescription className="text-orange-700">
You have used all {maxAttempts} attempts. Your teacher will review your work and provide a final grade.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="border-blue-200 bg-blue-50/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-900">Target Checklist</CardTitle>
                <CardDescription className="text-blue-700">
                  Each target cell must match the expected value.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {targetStatuses.map((target) => (
                  <div
                    key={target.cell}
                    className={`rounded-md border p-3 ${
                      target.status === 'correct'
                        ? 'border-green-200 bg-green-50'
                        : target.status === 'incorrect'
                          ? 'border-red-200 bg-red-50'
                          : 'border-blue-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-slate-900">{target.cell}</div>
                      <Badge variant="outline" className="uppercase">
                        {target.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Expected: {String(target.expectedValue)}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {target.message}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Targets validated</span>
                  <span className="font-medium text-foreground">
                    {submitted ? `${correctCount}/${totalCount}` : 'Not checked'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Draft status</span>
                  <span className="font-medium text-foreground">
                    {hasUnsavedChanges.current ? 'Unsaved changes' : 'Saved'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mode</span>
                  <span className="font-medium text-foreground">
                    {SPREADSHEET_EVALUATOR_DEFAULT_MODE.replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="sticky bottom-0 -mx-6 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges.current && !submitted ? (
                <span className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  Unsaved changes
                </span>
              ) : (
                <span>{statusAnnouncement}</span>
              )}
            </div>
            <div className="flex gap-2">
              {!submitted ? (
                <>
                  <Button
                    onClick={saveAsDraft}
                    variant="outline"
                    disabled={isSaving || !hasUnsavedChanges.current}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      attemptNumber > 0 ? 'Resubmit' : 'Check Answer'
                    )}
                  </Button>
                </>
              ) : canRevise ? (
                <Button onClick={handleRevise}>
                  Revise and Resubmit (Attempt {attemptNumber + 1} of {maxAttempts})
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
