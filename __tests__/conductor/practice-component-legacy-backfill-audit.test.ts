import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

const auditPath = path.resolve(
  process.cwd(),
  'conductor/archive/practice_component_legacy_backfill_20260319/audit.md',
);

describe('practice component legacy backfill audit', () => {
  it('records the current Unit 1 practice-family mapping', () => {
    const audit = fs.readFileSync(auditPath, 'utf8');

    expect(audit).toContain('Launch Unit: A = L + E');
    expect(audit).toContain('Classify Accounts (ACC-1.2)');
    expect(audit).toContain('Trace Transaction Effects (ACC-1.4)');
    expect(audit).toContain('Build the Balance Sheet (ACC-1.3)');
    expect(audit).toContain('Group Build: Six Dataset Challenge');
    expect(audit).toContain('Class Presentation: Balance by Design');
    expect(audit).toContain('Unit 1 Mastery Check');
  });

  it('separates spreadsheet and simulation-heavy backfill into later waves', () => {
    const audit = fs.readFileSync(auditPath, 'utf8');

    expect(audit).toContain('spreadsheet-evaluator');
    expect(audit).toContain('student_spreadsheet_responses');
    expect(audit).toContain('journal-entry-building');
    expect(audit).toContain('notebook-organizer');
    expect(audit).toContain('Wave 3');
    expect(audit).toContain('Wave 4');
  });
});
