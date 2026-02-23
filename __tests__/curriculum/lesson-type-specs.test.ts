import { describe, expect, it } from 'vitest';

import {
  CURRICULUM_LESSON_TYPE_SPECS,
  getLessonTypeFromOrderIndex,
} from '@/lib/curriculum/types';

describe('curriculum/lesson-type-specs', () => {
  it('maps Unit 1 lesson order ranges to lesson types', () => {
    expect(getLessonTypeFromOrderIndex(1)).toBe('accounting');
    expect(getLessonTypeFromOrderIndex(5)).toBe('excel');
    expect(getLessonTypeFromOrderIndex(8)).toBe('project');
    expect(getLessonTypeFromOrderIndex(11)).toBe('assessment');
  });

  it('defines required phase rules for each lesson type', () => {
    expect(CURRICULUM_LESSON_TYPE_SPECS.accounting.phaseRequirements).toHaveLength(6);
    expect(CURRICULUM_LESSON_TYPE_SPECS.excel.phaseRequirements).toHaveLength(6);
    expect(CURRICULUM_LESSON_TYPE_SPECS.project.phaseRequirements).toHaveLength(1);
    expect(CURRICULUM_LESSON_TYPE_SPECS.assessment.phaseRequirements.length).toBeGreaterThanOrEqual(4);
  });
});
