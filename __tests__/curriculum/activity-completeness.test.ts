import { describe, expect, it } from 'vitest';

import {
  ACCOUNTING_LESSONS,
  EXCEL_LESSONS,
  PROJECT_LESSONS,
  getActivitySections,
  getPhase,
} from './unit1-fixtures';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';
import { activityPropsSchemas } from '@/lib/db/schema/activities-core';
import { activityRegistry } from '@/lib/activities/registry';

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

  it('excel phase 4 includes canonical teacher-submission guidance text', () => {
    for (const lesson of EXCEL_LESSONS) {
      const independent = getPhase(lesson, 4);
      const hasTeacherSubmission = independent?.sections.some(
        (section) =>
          section.sectionType === 'text' &&
          typeof section.content.markdown === 'string' &&
          section.content.markdown.includes('Teacher Submission'),
      );

      expect(hasTeacherSubmission, `lesson ${lesson.lesson.slug}`).toBe(true);
    }
  });

  it('project days include a required checkpoint activity within the sprint structure', () => {
    for (const lesson of PROJECT_LESSONS) {
      const checkpoint = getPhase(lesson, 3);
      expect(checkpoint?.sections.length ?? 0, `lesson ${lesson.lesson.slug}`).toBeGreaterThan(0);
      expect(getActivitySections(checkpoint).length, `lesson ${lesson.lesson.slug}`).toBeGreaterThan(0);
    }
  });

  it('every published activity has a component in the registry and valid props', () => {
    const manifest = buildPublishedCurriculumManifest();
    for (const lesson of manifest.lessons) {
      for (const activity of lesson.activities) {
        expect(activityRegistry[activity.componentKey as keyof typeof activityRegistry], `Activity component ${activity.componentKey} not found in registry for lesson ${lesson.slug}`).toBeDefined();
        const schema = activityPropsSchemas[activity.componentKey as keyof typeof activityPropsSchemas];
        expect(schema, `Activity schema ${activity.componentKey} not found for lesson ${lesson.slug}`).toBeDefined();
        const result = schema.safeParse(activity.props);
        expect(result.success, `Activity props invalid for ${activity.componentKey} in lesson ${lesson.slug}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
      }
    }
  });
});
