'use client';

import { useCallback, useRef } from 'react';
import { SpreadsheetActivity } from './SpreadsheetActivity';
import type { Activity } from '@/lib/db/schema/validators';
import type { SpreadsheetActivityProps } from '@/types/activities';
import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  type PracticeSubmissionCallbackPayload,
} from '@/lib/practice/contract';
import type { SpreadsheetData } from './index';

interface SpreadsheetActivityAdapterProps {
  activity: Activity;
  onSubmit?: (payload: PracticeSubmissionCallbackPayload) => void;
  onComplete?: () => void;
}

/**
 * Bridges the ActivityRenderer interface to the standalone SpreadsheetActivity.
 *
 * ActivityRenderer calls every registered component with
 *   { activity, onSubmit, onComplete }
 * but SpreadsheetActivity was built as a standalone component that expects flat
 * props (title, description, template, …) and an onSubmit whose payload is
 *   { spreadsheetData }.
 *
 * This adapter:
 *  1. Extracts activity.props and spreads them as flat props.
 *  2. Builds a practice.v1 envelope from the spreadsheet data and emits it
 *     via onSubmit so the ActivityRenderer can persist the submission.
 *  3. Calls onComplete to advance the phase.
 */
export function SpreadsheetActivityAdapter({
  activity,
  onSubmit,
  onComplete,
}: SpreadsheetActivityAdapterProps) {
  const props = activity.props as SpreadsheetActivityProps;
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(
    (data: { spreadsheetData: SpreadsheetData }) => {
      if (submittedRef.current) return;

      const cellCount = data.spreadsheetData.flat().length;
      const filledCells = data.spreadsheetData.flat().filter(
        (cell) => cell && cell.value !== '' && cell.value !== undefined && cell.value !== null,
      ).length;

      const answers: Record<string, unknown> = {
        cellCount,
        filledCells,
        completionRate: cellCount > 0 ? filledCells / cellCount : 0,
        spreadsheetData: data.spreadsheetData,
      };

      const parts = buildPracticeSubmissionParts(answers).map((part) => ({
        ...part,
        isCorrect: filledCells > 0,
        score: filledCells > 0 ? 1 : 0,
        maxScore: 1,
      }));

      const envelope = buildPracticeSubmissionEnvelope({
        activityId: activity.id || 'spreadsheet',
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date(),
        answers,
        parts,
        artifact: {
          kind: 'spreadsheet',
          title: props.title ?? 'Spreadsheet Activity',
          template: props.template,
          cellCount,
          filledCells,
          completionRate: cellCount > 0 ? filledCells / cellCount : 0,
          data: data.spreadsheetData,
        },
        analytics: {
          cellCount,
          filledCells,
          completionRate: cellCount > 0 ? filledCells / cellCount : 0,
        },
      });

      try {
        submittedRef.current = true;
        onSubmit?.(envelope);
        onComplete?.();
      } catch (err) {
        console.error('SpreadsheetActivityAdapter submission failed:', err);
        submittedRef.current = false;
      }
    },
    [activity.id, onSubmit, onComplete, props.title, props.template],
  );

  return <SpreadsheetActivity {...props} onSubmit={handleSubmit} />;
}
