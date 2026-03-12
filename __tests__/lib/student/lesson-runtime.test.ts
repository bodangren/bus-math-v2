import { describe, expect, it } from 'vitest';

import {
  buildLessonContinueState,
  resolveLessonLandingPhase,
} from '@/lib/student/lesson-runtime';
import type { StudentDashboardUnit } from '@/lib/student/dashboard';

describe('resolveLessonLandingPhase', () => {
  it('returns the first incomplete phase for partially completed lessons', () => {
    expect(
      resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set([1, 2]),
      }),
    ).toBe(3);
  });

  it('returns the final phase when every phase is already complete', () => {
    expect(
      resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set([1, 2, 3, 4]),
      }),
    ).toBe(4);
  });
});

describe('buildLessonContinueState', () => {
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
          description: 'Completed current lesson',
          completedPhases: 4,
          totalPhases: 4,
          progressPercentage: 100,
        },
        {
          id: 'lesson-2',
          unitNumber: 1,
          title: 'Lesson 2',
          slug: 'lesson-2',
          description: 'Recommended next lesson',
          completedPhases: 0,
          totalPhases: 4,
          progressPercentage: 0,
        },
      ],
    },
  ];

  it('reuses the dashboard next lesson recommendation when the current lesson is complete', () => {
    expect(buildLessonContinueState(units, 'lesson-1')).toEqual({
      recommendedLesson: {
        unitNumber: 1,
        title: 'Lesson 2',
        slug: 'lesson-2',
        description: 'Recommended next lesson',
        actionLabel: 'Start Lesson',
      },
    });
  });

  it('suppresses the recommendation when the current lesson is still the dashboard next lesson', () => {
    expect(buildLessonContinueState(units, 'lesson-2')).toEqual({
      recommendedLesson: null,
    });
  });
});
