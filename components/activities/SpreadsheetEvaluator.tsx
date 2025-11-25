'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Save, Loader2 } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  SpreadsheetWrapper,
  type SpreadsheetData,
  type SpreadsheetCell,
  a1ToCoordinates,
} from '@/components/spreadsheet';
import type { Activity } from '@/lib/db/schema/validators';

// Target cell validation schema
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

interface SpreadsheetEvaluatorProps {
  activity: SpreadsheetEvaluatorActivity;
  onSubmit?: (payload: {
    activityId: string;
    isComplete: boolean;
    spreadsheetData: SpreadsheetData;
    completedAt: Date;
  }) => void;
}

interface CellFeedback {
  cell: string;
  isCorrect: boolean;
  message?: string;
}

const AUTO_SAVE_DELAY = 30000; // 30 seconds

export function SpreadsheetEvaluator({ activity, onSubmit }: SpreadsheetEvaluatorProps) {
  const [data, setData] = useState<SpreadsheetData>(() => {
    // Initialize with provided data or empty spreadsheet
    const initial = activity.props.initialData;
    if (initial && Array.isArray(initial)) {
      return initial.map((row) =>
        row.map((cell) => {
          if (cell === null || cell === undefined) {
            return { value: '' };
          }
          if (typeof cell === 'object' && 'value' in cell) {
            return cell as SpreadsheetCell;
          }
          return { value: cell };
        })
      );
    }
    // Default 10x10 spreadsheet
    return Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => ({ value: '' }))
    );
  });

  const [feedback, setFeedback] = useState<CellFeedback[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = useRef(false);

  // Auto-save logic
  const saveAsDraft = useCallback(async () => {
    if (!hasUnsavedChanges.current) return;

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
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [activity.id, data]);

  // Handle spreadsheet changes
  const handleChange = useCallback((newData: SpreadsheetData) => {
    setData(newData);
    hasUnsavedChanges.current = true;
    setError(null);

    // Reset auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveAsDraft();
    }, AUTO_SAVE_DELAY);
  }, [saveAsDraft]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Load saved draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch(`/api/activities/spreadsheet/${activity.id}/draft`);
        if (response.ok) {
          const result = await response.json();
          if (result.draftData) {
            setData(result.draftData);
            setLastSaved(new Date(result.updatedAt));
          }
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    };

    loadDraft();
  }, [activity.id]);

  // Get cell value safely
  const getCellValue = (cellRef: string): string | number => {
    try {
      const { row, col } = a1ToCoordinates(cellRef);
      const cell = data[row]?.[col];
      return cell?.value ?? '';
    } catch {
      return '';
    }
  };

  // Normalize values for comparison
  const normalizeValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toString().toLowerCase().trim();
    }
    return value.toString().toLowerCase().trim();
  };

  // Validate spreadsheet
  const validateSpreadsheet = (): CellFeedback[] => {
    const results: CellFeedback[] = [];

    for (const target of activity.props.targetCells) {
      const actualValue = getCellValue(target.cell);
      const normalizedActual = normalizeValue(actualValue);
      const normalizedExpected = normalizeValue(target.expectedValue);

      const isCorrect = normalizedActual === normalizedExpected;

      results.push({
        cell: target.cell,
        isCorrect,
        message: isCorrect
          ? `Correct! Cell ${target.cell} has the expected value.`
          : `Cell ${target.cell}: Expected "${target.expectedValue}", but got "${actualValue}"`,
      });
    }

    return results;
  };

  // Highlight cells based on feedback
  const getHighlightedData = (): SpreadsheetData => {
    if (!submitted || feedback.length === 0) {
      return data;
    }

    const highlighted = data.map((row) => row.map((cell) => ({
      value: cell?.value ?? '',
      readOnly: cell?.readOnly,
      className: cell?.className,
    } as SpreadsheetCell)));

    for (const fb of feedback) {
      try {
        const { row, col } = a1ToCoordinates(fb.cell);
        if (highlighted[row]?.[col]) {
          highlighted[row][col] = {
            value: highlighted[row][col].value,
            readOnly: highlighted[row][col].readOnly,
            className: fb.isCorrect
              ? 'bg-green-100 border-green-500'
              : 'bg-red-100 border-red-500',
          };
        }
      } catch (err) {
        console.error(`Failed to highlight cell ${fb.cell}:`, err);
      }
    }

    return highlighted;
  };

  // Handle submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const validationResults = validateSpreadsheet();
      setFeedback(validationResults);

      const response = await fetch(`/api/activities/spreadsheet/${activity.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetData: data,
          targetCells: activity.props.targetCells,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const result = await response.json();

      setSubmitted(true);
      setFeedback(result.feedback || validationResults);

      // Call external onSubmit handler
      onSubmit?.({
        activityId: activity.id,
        isComplete: result.isComplete,
        spreadsheetData: data,
        completedAt: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = submitted && feedback.every((fb) => fb.isCorrect);
  const correctCount = feedback.filter((fb) => fb.isCorrect).length;
  const totalCount = activity.props.targetCells.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              {activity.displayName || 'Spreadsheet Exercise'}
              {submitted && (
                <Badge variant={isComplete ? 'default' : 'destructive'}>
                  {correctCount}/{totalCount} correct
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{activity.description}</CardDescription>
          </div>
          {lastSaved && !isSaving && (
            <div className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert>
          <AlertDescription>{activity.props.instructions}</AlertDescription>
        </Alert>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success message */}
        {isComplete && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Excellent work! All cells are correct.
            </AlertDescription>
          </Alert>
        )}

        {/* Feedback list */}
        {submitted && feedback.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Validation Results:</h3>
            <div className="space-y-1">
              {feedback.map((fb) => (
                <div
                  key={fb.cell}
                  className={`flex items-start gap-2 text-sm p-2 rounded ${
                    fb.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {fb.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <span className={fb.isCorrect ? 'text-green-800' : 'text-red-800'}>
                    {fb.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spreadsheet */}
        <div className="border rounded-lg overflow-hidden">
          <SpreadsheetWrapper
            initialData={getHighlightedData()}
            onChange={handleChange}
            readOnly={submitted}
            showColumnLabels={true}
            showRowLabels={true}
            className="min-h-[400px]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {hasUnsavedChanges.current && !submitted && (
              <span className="flex items-center gap-1">
                <Save className="h-3 w-3" />
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!submitted && (
              <>
                <Button
                  onClick={saveAsDraft}
                  variant="outline"
                  disabled={isSaving || !hasUnsavedChanges.current}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Answer'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
