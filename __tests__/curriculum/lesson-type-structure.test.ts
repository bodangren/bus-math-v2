import { describe, expect, it } from 'vitest';

import {
  ACCOUNTING_LESSONS,
  EXCEL_LESSONS,
  PROJECT_LESSONS,
  SUMMATIVE_LESSONS,
  getPhase,
} from './unit1-fixtures';

describe('curriculum/lesson-type-structure', () => {
  it('accounting lessons have exactly six phases', () => {
    for (const lesson of ACCOUNTING_LESSONS) {
      expect(lesson.phases, `lesson ${lesson.lesson.slug}`).toHaveLength(6);
    }
  });

  it('excel lessons have exactly six phases', () => {
    for (const lesson of EXCEL_LESSONS) {
      expect(lesson.phases, `lesson ${lesson.lesson.slug}`).toHaveLength(6);
    }
  });

  it('project lessons have the canonical four-phase sprint structure', () => {
    for (const lesson of PROJECT_LESSONS) {
      expect(lesson.phases, `lesson ${lesson.lesson.slug}`).toHaveLength(4);
      expect(lesson.phases.map((phase) => phase.phaseNumber)).toEqual([1, 2, 3, 4]);
    }
  });

  it('summative assessment has the canonical mastery layout', () => {
    const summative = SUMMATIVE_LESSONS[0];
    expect(summative).toBeDefined();
    expect(summative.phases).toHaveLength(3);

    expect(getPhase(summative, 1)?.title.toLowerCase()).toContain('instruction');
    expect(getPhase(summative, 2)?.title.toLowerCase()).toContain('assessment');
    expect(getPhase(summative, 3)?.title.toLowerCase()).toContain('review');
  });
});
