import { describe, expect, it } from 'vitest';

import { TieredAssessment } from '@/components/activities/quiz/TieredAssessment';
import { ComprehensionCheck } from '@/components/activities/quiz/ComprehensionCheck';
import { JournalEntryActivity } from '@/components/activities/accounting/JournalEntryActivity';
import { DataCleaningActivity } from '@/components/activities/spreadsheet/DataCleaningActivity';
import { SpreadsheetActivityAdapter } from '@/components/activities/spreadsheet/SpreadsheetActivityAdapter';
import { GraphingExplorer } from '@/components/activities/graphing/GraphingExplorer';
import { getActivityComponent } from '@/lib/activities/registry';

describe('activityRegistry', () => {
  it('maps comprehension-quiz to ComprehensionCheck', () => {
    expect(getActivityComponent('comprehension-quiz')).toBe(ComprehensionCheck);
  });

  it('maps tiered-assessment to TieredAssessment', () => {
    expect(getActivityComponent('tiered-assessment')).toBe(TieredAssessment);
  });

  it('maps canonical journal-entry and data-cleaning keys', () => {
    expect(getActivityComponent('journal-entry-building')).toBe(JournalEntryActivity);
    expect(getActivityComponent('spreadsheet')).toBe(SpreadsheetActivityAdapter);
    expect(getActivityComponent('data-cleaning')).toBe(DataCleaningActivity);
  });

  it('maps graphing-explorer to GraphingExplorer', () => {
    expect(getActivityComponent('graphing-explorer')).toBe(GraphingExplorer);
  });

  it('no longer resolves legacy compatibility aliases', () => {
    expect(getActivityComponent('general-drag-and-drop')).toBeNull();
    expect(getActivityComponent('journal-entry-activity')).toBeNull();
    expect(getActivityComponent('spreadsheet-activity')).toBeNull();
    expect(getActivityComponent('data-cleaning-activity')).toBeNull();
  });
});
