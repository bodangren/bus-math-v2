import { describe, expect, it } from 'vitest';

import {
  buildActivityInput,
  buildLessonInput,
  buildStudentProgressInput,
  createActivity,
  createActivitySubmission,
  createLesson,
  createPhase
} from '@/lib/test-utils/mock-factories';
import {
  insertActivitySchema,
  insertLessonSchema,
  insertStudentProgressSchema,
  selectActivitySchema,
  selectLessonSchema,
  selectPhaseSchema
} from '@/lib/db/schema/validators';

describe('mock factories', () => {
  it('creates linked lesson and phase objects that satisfy select schemas', () => {
    const lesson = createLesson({ slug: 'balance-by-design' });
    const phase = createPhase({ lessonId: lesson.id, phaseNumber: 2 });

    expect(() => selectLessonSchema.parse(lesson)).not.toThrow();
    expect(() => selectPhaseSchema.parse(phase)).not.toThrow();
    expect(phase.lessonId).toBe(lesson.id);
    expect(phase.contentBlocks.length).toBeGreaterThan(0);
  });

  it('builds alternate activity payloads without violating schema constraints', () => {
    const quizActivity = createActivity();
    const worksheetActivity = buildActivityInput({ componentKey: 'budget-worksheet' });

    expect(() => selectActivitySchema.parse(quizActivity)).not.toThrow();
    expect(() => insertActivitySchema.parse(worksheetActivity)).not.toThrow();
    expect(quizActivity.props).toHaveProperty('questions');
    expect(worksheetActivity.props).toHaveProperty('categories');
  });

  it('produces student progress inputs that pass validation', () => {
    const progressInput = buildStudentProgressInput({ status: 'completed' });
    const lesson = buildLessonInput({ unitNumber: 2 });
    insertLessonSchema.parse(lesson); // smoke check: lesson payload is valid
    expect(() => insertStudentProgressSchema.parse(progressInput)).not.toThrow();
  });

  it('generates activity submissions tied to built activities', () => {
    const activity = createActivity();
    const submission = createActivitySubmission({ activityId: activity.id });

    expect(submission.activityId).toBe(activity.id);
    expect(submission.submissionData.answers.q1).toBeDefined();
  });
});
