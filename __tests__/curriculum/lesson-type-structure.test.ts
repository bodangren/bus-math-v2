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

  it('project lessons have one phase each', () => {
    for (const lesson of PROJECT_LESSONS) {
      expect(lesson.phases, `lesson ${lesson.lesson.slug}`).toHaveLength(1);
    }
  });

  it('summative assessment has multi-phase layout: instructions + tier phases', () => {
    const summative = SUMMATIVE_LESSONS[0];
    expect(summative).toBeDefined();
    expect(summative.phases.length).toBeGreaterThanOrEqual(4);

    expect(getPhase(summative, 1)?.title.toLowerCase()).toContain('instruction');
    expect(getPhase(summative, 2)?.title.toLowerCase()).toContain('knowledge');
    expect(getPhase(summative, 3)?.title.toLowerCase()).toContain('understanding');
    expect(getPhase(summative, 4)?.title.toLowerCase()).toContain('application');
  });
});
