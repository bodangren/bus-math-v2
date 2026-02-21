import { describe, expect, it } from 'vitest';

import {
  ACCOUNTING_LESSONS,
  EXCEL_LESSONS,
  PROJECT_LESSONS,
  SUMMATIVE_LESSONS,
  getActivityById,
  getActivityIdFromSection,
  getActivitySections,
  getPhase,
  isInteractiveComponent,
} from './unit1-fixtures';

describe('curriculum/grading-config', () => {
  it('accounting phase 3 has an interactive guided practice activity', () => {
    for (const lesson of ACCOUNTING_LESSONS) {
      const guided = getPhase(lesson, 3);
      const activitySections = getActivitySections(guided);
      const hasInteractive = activitySections.some((section) => {
        const activity = getActivityById(lesson, getActivityIdFromSection(section));
        return activity ? isInteractiveComponent(activity.componentKey) : false;
      });

      expect(hasInteractive, `lesson ${lesson.lesson.slug}`).toBe(true);
    }
  });

  it('accounting phase 5 has an auto-graded exit-ticket activity with passing score >= 60', () => {
    // Phase 4 is Independent Practice (spreadsheet/completion-based, not auto-graded).
    // Phase 5 is Assessment where the auto-graded exit ticket lives.
    for (const lesson of ACCOUNTING_LESSONS) {
      const assessment = getPhase(lesson, 5);
      const activitySections = getActivitySections(assessment);
      const hasQualifyingActivity = activitySections.some((section) => {
        const activity = getActivityById(lesson, getActivityIdFromSection(section));
        return Boolean(
          activity?.gradingConfig?.autoGrade &&
            typeof activity.gradingConfig?.passingScore === 'number' &&
            activity.gradingConfig.passingScore >= 60,
        );
      });

      expect(hasQualifyingActivity, `lesson ${lesson.lesson.slug}`).toBe(true);
    }
  });

  it('excel phase 5 includes auto-graded checkpoint with passing score >= 80', () => {
    for (const lesson of EXCEL_LESSONS) {
      const checkpoint = getPhase(lesson, 5);
      const activitySections = getActivitySections(checkpoint);
      const hasQualifiedExitTicket = activitySections.some((section) => {
        const activity = getActivityById(lesson, getActivityIdFromSection(section));
        return Boolean(
          activity?.gradingConfig?.autoGrade &&
            typeof activity.gradingConfig?.passingScore === 'number' &&
            activity.gradingConfig.passingScore >= 80,
        );
      });

      expect(hasQualifiedExitTicket, `lesson ${lesson.lesson.slug}`).toBe(true);
    }
  });

  it('project day activities are ungraded deliverables', () => {
    for (const lesson of PROJECT_LESSONS) {
      for (const activity of lesson.activities) {
        expect(activity.gradingConfig?.autoGrade, `lesson ${lesson.lesson.slug} / ${activity.id}`).toBe(false);
      }
    }
  });

  it('summative activities are auto-graded and passing score is 70', () => {
    const summative = SUMMATIVE_LESSONS[0];

    for (const activity of summative.activities) {
      expect(activity.gradingConfig?.autoGrade, `summative activity ${activity.id}`).toBe(true);
      expect(activity.gradingConfig?.passingScore, `summative activity ${activity.id}`).toBe(70);
    }
  });
});
