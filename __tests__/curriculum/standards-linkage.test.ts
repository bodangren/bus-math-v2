import { describe, expect, it } from 'vitest';

import {
  ACCOUNTING_LESSONS,
  EXCEL_LESSONS,
  PROJECT_LESSONS,
  SUMMATIVE_LESSONS,
} from './unit1-fixtures';

describe('curriculum/standards-linkage', () => {
  it('non-project lessons link exactly one primary standard', () => {
    for (const lesson of [...ACCOUNTING_LESSONS, ...EXCEL_LESSONS, ...SUMMATIVE_LESSONS]) {
      const primary = lesson.standards.filter((standard) => standard.isPrimary);
      expect(primary.length, `lesson ${lesson.lesson.slug}`).toBe(1);
    }
  });

  it('project lessons link no primary standards', () => {
    for (const lesson of PROJECT_LESSONS) {
      const primary = lesson.standards.filter((standard) => standard.isPrimary);
      expect(primary.length, `lesson ${lesson.lesson.slug}`).toBe(0);
    }
  });

  it('summative links all unit standards ACC-1.1 through ACC-1.7', () => {
    const summative = SUMMATIVE_LESSONS[0];
    const codes = summative.standards.map((standard) => standard.code).sort();
    expect(codes).toEqual([
      'ACC-1.1',
      'ACC-1.2',
      'ACC-1.3',
      'ACC-1.4',
      'ACC-1.5',
      'ACC-1.6',
      'ACC-1.7',
    ]);
  });
});
