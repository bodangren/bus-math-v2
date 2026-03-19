'use client';

import { SpreadsheetActivity } from './SpreadsheetActivity';
import type { Activity } from '@/lib/db/schema/validators';
import type { SpreadsheetActivityProps } from '@/types/activities';

interface SpreadsheetActivityAdapterProps {
  activity: Activity;
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
 *  2. Treats spreadsheet submission as a direct completion signal so the
 *     renderer can advance the phase without a legacy completion payload shim.
 */
export function SpreadsheetActivityAdapter({
  activity,
  onComplete,
}: SpreadsheetActivityAdapterProps) {
  const props = activity.props as SpreadsheetActivityProps;

  const handleSubmit = () => {
    onComplete?.();
  };

  return <SpreadsheetActivity {...props} onSubmit={handleSubmit} />;
}
