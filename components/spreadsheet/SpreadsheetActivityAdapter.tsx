'use client';

import { SpreadsheetActivity } from './SpreadsheetActivity';
import type { SpreadsheetData } from './SpreadsheetWrapper';
import type { Activity } from '@/lib/db/schema/validators';
import type { SpreadsheetActivityProps } from '@/types/activities';

interface SpreadsheetActivityAdapterProps {
  activity: Activity;
  onSubmit?: (payload: {
    activityId: string;
    isComplete: boolean;
    completedAt: Date;
  }) => void;
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
 *  2. Converts the SpreadsheetActivity onSubmit callback into the
 *     ActivitySubmissionPayload shape that ActivityRenderer expects, including
 *     isComplete: true and completedAt so the phase-completion flow fires.
 */
export function SpreadsheetActivityAdapter({
  activity,
  onSubmit,
}: SpreadsheetActivityAdapterProps) {
  const props = activity.props as SpreadsheetActivityProps;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = (_data: { spreadsheetData: SpreadsheetData }) => {
    onSubmit?.({
      activityId: activity.id,
      isComplete: true,
      completedAt: new Date(),
    });
  };

  return <SpreadsheetActivity {...props} onSubmit={handleSubmit} />;
}
