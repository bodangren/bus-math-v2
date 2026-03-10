import { describe, expect, it } from 'vitest';

import { TieredAssessment } from '@/components/activities/quiz/TieredAssessment';
import { ComprehensionCheck } from '@/components/activities/quiz/ComprehensionCheck';
import { GeneralDragAndDrop } from '@/components/activities/drag-drop/GeneralDragAndDrop';
import { JournalEntryActivity } from '@/components/activities/accounting/JournalEntryActivity';
import { DataCleaningActivity } from '@/components/activities/spreadsheet/DataCleaningActivity';
import { SpreadsheetActivityAdapter } from '@/components/activities/spreadsheet/SpreadsheetActivityAdapter';
import { getActivityComponent } from '@/lib/activities/registry';

describe('activityRegistry', () => {
  it('maps comprehension-quiz to ComprehensionCheck', () => {
    expect(getActivityComponent('comprehension-quiz')).toBe(ComprehensionCheck);
  });

  it('maps tiered-assessment to TieredAssessment', () => {
    expect(getActivityComponent('tiered-assessment')).toBe(TieredAssessment);
  });

  it('resolves documented drag-and-drop alias keys', () => {
    expect(getActivityComponent('general-drag-and-drop')).toBe(GeneralDragAndDrop);
  });

  it('resolves documented journal-entry alias keys', () => {
    expect(getActivityComponent('journal-entry-activity')).toBe(JournalEntryActivity);
  });

  it('resolves documented spreadsheet alias keys', () => {
    expect(getActivityComponent('spreadsheet-activity')).toBe(SpreadsheetActivityAdapter);
    expect(getActivityComponent('data-cleaning-activity')).toBe(DataCleaningActivity);
  });
});
