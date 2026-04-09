import { describe, it, expect } from 'vitest';
import { buildStudentDashboardViewModel, type StudentDashboardUnit } from '@/lib/student/dashboard';

describe('Continue-State Contract (Phase 1)', () => {
  it('not started lesson has Start Lesson action', () => {
    const units: StudentDashboardUnit[] = [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Lesson 1',
            slug: 'lesson-1',
            description: null,
            completedPhases: 0,
            totalPhases: 6,
            progressPercentage: 0,
          },
        ],
      },
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.nextLesson?.actionLabel).toBe('Start Lesson');
    expect(viewModel.units[0].nextLesson?.actionLabel).toBe('Start Lesson');
  });

  it('in progress lesson has Resume Lesson action', () => {
    const units: StudentDashboardUnit[] = [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Lesson 1',
            slug: 'lesson-1',
            description: null,
            completedPhases: 3,
            totalPhases: 6,
            progressPercentage: 50,
          },
        ],
      },
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.nextLesson?.actionLabel).toBe('Resume Lesson');
    expect(viewModel.units[0].nextLesson?.actionLabel).toBe('Resume Lesson');
  });

  it('completed lesson has no action in current implementation (gap)', () => {
    const units: StudentDashboardUnit[] = [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Lesson 1',
            slug: 'lesson-1',
            description: null,
            completedPhases: 6,
            totalPhases: 6,
            progressPercentage: 100,
          },
        ],
      },
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.nextLesson).toBeNull();
    expect(viewModel.units[0].nextLesson).toBeNull();
  });

  it('next lesson recommendation skips completed lessons', () => {
    const units: StudentDashboardUnit[] = [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Completed Lesson',
            slug: 'completed-lesson',
            description: null,
            completedPhases: 6,
            totalPhases: 6,
            progressPercentage: 100,
          },
          {
            id: 'lesson-2',
            unitNumber: 1,
            title: 'Not Started',
            slug: 'not-started',
            description: null,
            completedPhases: 0,
            totalPhases: 6,
            progressPercentage: 0,
          },
        ],
      },
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.nextLesson?.actionLabel).toBe('Start Lesson');
    expect(viewModel.nextLesson?.slug).toBe('not-started');
  });

  it('prioritizes in progress over not started lessons', () => {
    const units: StudentDashboardUnit[] = [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Not Started',
            slug: 'not-started',
            description: null,
            completedPhases: 0,
            totalPhases: 6,
            progressPercentage: 0,
          },
          {
            id: 'lesson-2',
            unitNumber: 1,
            title: 'In Progress',
            slug: 'in-progress',
            description: null,
            completedPhases: 3,
            totalPhases: 6,
            progressPercentage: 50,
          },
        ],
      },
    ];

    const viewModel = buildStudentDashboardViewModel(units);

    expect(viewModel.nextLesson?.actionLabel).toBe('Resume Lesson');
    expect(viewModel.nextLesson?.slug).toBe('in-progress');
  });
});