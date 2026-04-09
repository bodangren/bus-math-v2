import { describe, it, expect } from 'vitest';
import { assembleGradebookRows, buildGradebookCell, computeLessonStatus } from '@/lib/teacher/gradebook';

// ---------------------------------------------------------------------------
// Phase 1: Gradebook Contract Definition Tests
// These tests define canonical gradebook semantics for lesson completion,
// independent practice, assessment, and unit test visibility.
// ---------------------------------------------------------------------------

describe('Gradebook Contract - Independent Practice and Assessment', () => {
  const lesson = {
    lessonId: 'lesson-1',
    lessonTitle: 'Accounting Equation',
    orderIndex: 1,
    isUnitTest: false,
  };

  const unitTestLesson = {
    lessonId: 'lesson-11',
    lessonTitle: 'Unit Test',
    orderIndex: 11,
    isUnitTest: true,
  };

  describe('independent practice visibility', () => {
    it('should track independent practice completion separately from lesson phase completion', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }];
      const submissions = [{
        id: 'sub-1',
        userId: 'student-1',
        activityId: 'activity-1',
        mode: 'independent_practice',
        status: 'submitted',
        score: 8,
        maxScore: 10,
        gradedAt: 1234567890,
      }];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].cells).toHaveLength(1);
      const cell = rows[0].cells[0];
      expect(cell.independentPractice).not.toBeNull();
      expect(cell.independentPractice?.completed).toBe(true);
      expect(cell.independentPractice?.score).toBe(8);
      expect(cell.independentPractice?.maxScore).toBe(10);
    });

    it('should expose independent practice scores when available', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }];
      const submissions = [{
        id: 'sub-1',
        userId: 'student-1',
        activityId: 'activity-1',
        mode: 'independent_practice',
        status: 'graded',
        score: 7,
        maxScore: 10,
        gradedAt: 1234567890,
      }];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      const cell = rows[0].cells[0];
      expect(cell.independentPractice?.score).toBe(7);
      expect(cell.independentPractice?.maxScore).toBe(10);
    });
  });

  describe('assessment visibility', () => {
    it('should track assessment completion and scores separately', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }];
      const submissions = [{
        id: 'sub-1',
        userId: 'student-1',
        activityId: 'activity-1',
        mode: 'assessment',
        status: 'graded',
        score: 9,
        maxScore: 10,
        gradedAt: 1234567890,
      }];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      const cell = rows[0].cells[0];
      expect(cell.assessment).not.toBeNull();
      expect(cell.assessment?.completed).toBe(true);
      expect(cell.assessment?.score).toBe(9);
      expect(cell.assessment?.maxScore).toBe(10);
    });

    it('should distinguish assessment from independent practice in same lesson', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }, { id: 'activity-2', lessonId: 'lesson-1' }];
      const submissions = [
        {
          id: 'sub-1',
          userId: 'student-1',
          activityId: 'activity-1',
          mode: 'independent_practice',
          status: 'submitted',
          score: 8,
          maxScore: 10,
          gradedAt: null,
        },
        {
          id: 'sub-2',
          userId: 'student-1',
          activityId: 'activity-2',
          mode: 'assessment',
          status: 'graded',
          score: 9,
          maxScore: 10,
          gradedAt: 1234567890,
        },
      ];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      const cell = rows[0].cells[0];
      expect(cell.independentPractice?.score).toBe(8);
      expect(cell.independentPractice?.completed).toBe(true);
      expect(cell.assessment?.score).toBe(9);
      expect(cell.assessment?.completed).toBe(true);
    });
  });

  describe('unit test visibility', () => {
    it('should mark unit test lessons with isUnitTest flag', () => {
      const cell = buildGradebookCell(unitTestLesson, [], null);
      expect(cell.lesson.isUnitTest).toBe(true);
      expect(cell.lesson.orderIndex).toBe(11);
    });

    it('should track unit test completion separately from regular lessons', () => {
      const completedPhases = Array(6).fill('completed') as Array<'completed'>;
      const cell = buildGradebookCell(unitTestLesson, completedPhases, 95);

      expect(cell.completionStatus).toBe('completed');
      expect(cell.masteryLevel).toBe(95);
      expect(cell.color).toBe('green');
    });
  });

  describe('gradebook cell semantics', () => {
    it('should derive lesson completion status from phase statuses', () => {
      const phases = ['completed', 'completed', 'not_started', 'not_started', 'not_started', 'not_started'];
      const status = computeLessonStatus(phases);
      expect(status).toBe('in_progress');
    });

    it('should show green when all phases are completed', () => {
      const allCompleted = Array(6).fill('completed') as Array<'completed'>;
      const cell = buildGradebookCell(lesson, allCompleted, null);
      expect(cell.completionStatus).toBe('completed');
      expect(cell.color).toBe('green');
    });

    it('should show mastery level from primary standard', () => {
      const cell = buildGradebookCell(lesson, ['completed', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'], 85);
      expect(cell.masteryLevel).toBe(85);
      expect(cell.color).toBe('green');
    });

    it('should differentiate lesson progress from independent practice progress', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }];
      const submissions = [{
        id: 'sub-1',
        userId: 'student-1',
        activityId: 'activity-1',
        mode: 'independent_practice',
        status: 'submitted',
        score: 10,
        maxScore: 10,
        gradedAt: 1234567890,
      }];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      const cell = rows[0].cells[0];
      expect(cell.completionStatus).toBe('not_started');
      expect(cell.independentPractice?.completed).toBe(true);
    });
  });

  describe('data shape gaps', () => {
    it('should identify that activity_submissions contains mode field', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }];
      const submissions = [{
        id: 'sub-1',
        userId: 'student-1',
        activityId: 'activity-1',
        mode: 'independent_practice',
        status: 'submitted',
        score: 8,
        maxScore: 10,
        gradedAt: 1234567890,
      }];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      const cell = rows[0].cells[0];
      expect(cell.independentPractice).not.toBeNull();
      expect(cell.assessment).toBeNull();
    });

    it('should identify that submission detail modal already shows practice evidence', () => {
      const activities = [{ id: 'activity-1', lessonId: 'lesson-1' }];
      const submissions = [{
        id: 'sub-1',
        userId: 'student-1',
        activityId: 'activity-1',
        mode: 'assessment',
        status: 'graded',
        score: 9,
        maxScore: 10,
        gradedAt: 1234567890,
      }];

      const { rows } = assembleGradebookRows(
        [{ id: 'student-1', username: 's1', displayName: 'Student One' }],
        [{ id: 'lesson-1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 }],
        [{ id: 'lv-1', lessonId: 'lesson-1' }],
        [{ id: 'pv-1', lessonVersionId: 'lv-1', phaseNumber: 1 }],
        [],
        [],
        [],
        activities,
        submissions,
      );

      const cell = rows[0].cells[0];
      expect(cell.assessment).not.toBeNull();
      expect(cell.independentPractice).toBeNull();
    });
  });
});
