import { describe, expect, it } from 'vitest';

import { buildTeacherStudentDetailViewModel } from '@/lib/teacher/student-detail';

describe('buildTeacherStudentDetailViewModel', () => {
  it('derives intervention status, unit summaries, and the next lesson from mixed progress', () => {
    const viewModel = buildTeacherStudentDetailViewModel({
      student: {
        id: 'student-1',
        username: 'demo_student',
        displayName: 'Demo Student',
      },
      snapshot: {
        completedPhases: 4,
        totalPhases: 12,
        progressPercentage: 33.3,
        lastActive: '2026-03-09T10:00:00.000Z',
      },
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1',
          lessons: [
            {
              id: 'lesson-1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'unit-1-lesson-1',
              description: 'Completed lesson',
              completedPhases: 6,
              totalPhases: 6,
              progressPercentage: 100,
            },
            {
              id: 'lesson-2',
              unitNumber: 1,
              title: 'Lesson 2',
              slug: 'unit-1-lesson-2',
              description: 'Resume this lesson',
              completedPhases: 2,
              totalPhases: 6,
              progressPercentage: 33,
            },
          ],
        },
        {
          unitNumber: 2,
          unitTitle: 'Unit 2',
          lessons: [
            {
              id: 'lesson-3',
              unitNumber: 2,
              title: 'Lesson 3',
              slug: 'unit-2-lesson-1',
              description: 'Not started',
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
            },
          ],
        },
      ],
    });

    expect(viewModel.studentLabel).toBe('Demo Student');
    expect(viewModel.status.label).toBe('At Risk');
    expect(viewModel.status.needsAttention).toBe(true);
    expect(viewModel.nextLesson?.title).toBe('Lesson 2');
    expect(viewModel.nextLesson?.actionLabel).toBe('Resume Lesson');
    expect(viewModel.unitSummaries).toHaveLength(2);
    expect(viewModel.unitSummaries[0]).toMatchObject({
      unitNumber: 1,
      progressPercentage: 67,
      completedLessons: 1,
      totalLessons: 2,
      status: 'in_progress',
    });
    expect(viewModel.unitSummaries[1].nextLesson?.actionLabel).toBe('Start Lesson');
  });

  it('handles a student with no recorded progress', () => {
    const viewModel = buildTeacherStudentDetailViewModel({
      student: {
        id: 'student-1',
        username: 'new_student',
        displayName: null,
      },
      snapshot: {
        completedPhases: 0,
        totalPhases: 0,
        progressPercentage: 0,
        lastActive: null,
      },
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1',
          lessons: [
            {
              id: 'lesson-1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'unit-1-lesson-1',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
            },
          ],
        },
      ],
    });

    expect(viewModel.studentLabel).toBe('new_student');
    expect(viewModel.status.label).toBe('At Risk');
    expect(viewModel.guidance).toMatch(/has not recorded progress yet/i);
    expect(viewModel.nextLesson).toMatchObject({
      title: 'Lesson 1',
      actionLabel: 'Start Lesson',
    });
    expect(viewModel.summary.progressPercentage).toBe(0);
  });

  it('returns a completed status with no next lesson when all lessons are complete', () => {
    const viewModel = buildTeacherStudentDetailViewModel({
      student: {
        id: 'student-1',
        username: 'finisher',
        displayName: 'Finisher',
      },
      snapshot: {
        completedPhases: 6,
        totalPhases: 6,
        progressPercentage: 100,
        lastActive: '2026-03-10T08:00:00.000Z',
      },
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1',
          lessons: [
            {
              id: 'lesson-1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'unit-1-lesson-1',
              description: null,
              completedPhases: 6,
              totalPhases: 6,
              progressPercentage: 100,
            },
          ],
        },
      ],
    });

    expect(viewModel.status.label).toBe('Completed');
    expect(viewModel.status.needsAttention).toBe(false);
    expect(viewModel.nextLesson).toBeNull();
    expect(viewModel.guidance).toMatch(/completed all published lessons/i);
  });
});
