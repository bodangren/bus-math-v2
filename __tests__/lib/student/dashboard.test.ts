import { describe, expect, it } from 'vitest';

import {
  buildStudentDashboardViewModel,
  type StudentDashboardUnit,
} from '@/lib/student/dashboard';

describe('buildStudentDashboardViewModel', () => {
  it('derives course metrics, unit progress, and the next in-progress lesson', () => {
    const units: StudentDashboardUnit[] = [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1: Balance by Design',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Lesson 1',
            slug: 'unit-1-lesson-1',
            description: 'Intro lesson',
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
        unitTitle: 'Unit 2: Flow of Transactions',
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
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.summary.progressPercentage).toBe(44);
    expect(viewModel.summary.completedLessons).toBe(1);
    expect(viewModel.summary.inProgressLessons).toBe(1);
    expect(viewModel.summary.completedUnits).toBe(0);
    expect(viewModel.nextLesson?.title).toBe('Lesson 2');
    expect(viewModel.nextLesson?.actionLabel).toBe('Resume Lesson');
    expect(viewModel.units[0].status).toBe('in_progress');
    expect(viewModel.units[0].completedLessons).toBe(1);
    expect(viewModel.units[0].nextLesson?.slug).toBe('unit-1-lesson-2');
    expect(viewModel.units[1].status).toBe('not_started');
    expect(viewModel.units[1].nextLesson?.actionLabel).toBe('Start Lesson');
  });

  it('returns no next lesson when the course is fully complete', () => {
    const units: StudentDashboardUnit[] = [
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
            completedPhases: 4,
            totalPhases: 4,
            progressPercentage: 100,
          },
        ],
      },
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.summary.progressPercentage).toBe(100);
    expect(viewModel.summary.completedUnits).toBe(1);
    expect(viewModel.nextLesson).toBeNull();
    expect(viewModel.units[0].status).toBe('completed');
  });

  it('handles an empty dashboard without crashing', () => {
    const viewModel = buildStudentDashboardViewModel([]);

    expect(viewModel.summary.totalLessons).toBe(0);
    expect(viewModel.summary.progressPercentage).toBe(0);
    expect(viewModel.nextLesson).toBeNull();
    expect(viewModel.units).toEqual([]);
  });
});
