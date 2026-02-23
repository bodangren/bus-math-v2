import { describe, expect, it } from 'vitest';

import {
  ACCOUNTING_LESSONS,
  EXCEL_LESSONS,
  PROJECT_LESSONS,
  getActivitySections,
  getPhase,
} from './unit1-fixtures';

describe('curriculum/activity-completeness', () => {
  it('L1-L7 phase 3 has at least one activity section', () => {
    for (const lesson of [...ACCOUNTING_LESSONS, ...EXCEL_LESSONS]) {
      const phase = getPhase(lesson, 3);
      expect(getActivitySections(phase).length, `lesson ${lesson.lesson.slug}`).toBeGreaterThan(0);
    }
  });

  it('L1-L7 phase 5 has at least one activity section', () => {
    for (const lesson of [...ACCOUNTING_LESSONS, ...EXCEL_LESSONS]) {
      const phase = getPhase(lesson, 5);
      expect(getActivitySections(phase).length, `lesson ${lesson.lesson.slug}`).toBeGreaterThan(0);
    }
  });

  it('excel phase 4 includes teacher-submission section marker', () => {
    for (const lesson of EXCEL_LESSONS) {
      const independent = getPhase(lesson, 4);
      const hasTeacherSubmission = independent?.sections.some((section) => {
        if (section.sectionType === 'teacher-submission') {
          return true;
        }

        const submissionType = section.content.submissionType;
        return submissionType === 'teacher-submission';
      });

      expect(hasTeacherSubmission, `lesson ${lesson.lesson.slug}`).toBe(true);
    }
  });

  it('project days declare deliverables array in their only phase', () => {
    for (const lesson of PROJECT_LESSONS) {
      const phase = lesson.phases[0];
      expect(Array.isArray(phase.deliverables), `lesson ${lesson.lesson.slug}`).toBe(true);
      expect(phase.deliverables?.length ?? 0, `lesson ${lesson.lesson.slug}`).toBeGreaterThan(0);
    }
  });
});
