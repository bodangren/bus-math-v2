import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getStudentDashboardData } from '../../../../app/student/dashboard/page';

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    query: {
      studentProgress: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('getStudentDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses versioned phase counts for progress calculations', async () => {
    const { db } = await import('@/lib/db/drizzle');

    const lessonsRows = [
      {
        id: 'lesson-1',
        unitNumber: 1,
        title: 'Base Lesson',
        slug: 'legacy-lesson',
        description: 'Base description',
        learningObjectives: null,
        orderIndex: 1,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const versionRows = [
      {
        id: 'lv-1',
        lessonId: 'lesson-1',
        title: 'Versioned Lesson',
        description: 'Versioned description',
        version: 1,
      },
    ];
    const versionedPhaseRows = [
      { id: 'pv-1', lessonVersionId: 'lv-1' },
      { id: 'pv-2', lessonVersionId: 'lv-1' },
    ];

    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: () => ({
            orderBy: () => Promise.resolve(lessonsRows),
          }),
        } as never;
      }

      if (call === 2) {
        return {
          from: () => ({
            where: () => ({
              orderBy: () => Promise.resolve(versionRows),
            }),
          }),
        } as never;
      }

      return {
        from: () => ({
          where: () => Promise.resolve(versionedPhaseRows),
        }),
      } as never;
    });

    vi.mocked(db.query.studentProgress.findMany).mockResolvedValue([
      { phaseId: 'pv-1', status: 'completed' },
      { phaseId: 'pv-2', status: 'in_progress' },
    ] as never);

    const units = await getStudentDashboardData('user-1');

    expect(units).toHaveLength(1);
    expect(units[0].lessons).toHaveLength(1);
    expect(units[0].lessons[0]).toMatchObject({
      title: 'Versioned Lesson',
      description: 'Versioned description',
      totalPhases: 2,
      completedPhases: 1,
      progressPercentage: 50,
    });
  });

  it('returns zero-phase progress when no lesson versions exist', async () => {
    const { db } = await import('@/lib/db/drizzle');

    const lessonsRows = [
      {
        id: 'lesson-1',
        unitNumber: 1,
        title: 'Legacy Lesson',
        slug: 'legacy-lesson',
        description: 'Legacy description',
        learningObjectives: null,
        orderIndex: 1,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: () => ({
            orderBy: () => Promise.resolve(lessonsRows),
          }),
        } as never;
      }

      return {
        from: () => ({
          where: () => ({
            orderBy: () => Promise.resolve([]),
          }),
        }),
      } as never;
    });

    vi.mocked(db.query.studentProgress.findMany).mockResolvedValue([
      { phaseId: 'legacy-phase', status: 'completed' },
    ] as never);

    const units = await getStudentDashboardData('user-1');

    expect(units).toHaveLength(1);
    expect(units[0].lessons).toHaveLength(1);
    expect(units[0].lessons[0]).toMatchObject({
      title: 'Legacy Lesson',
      description: 'Legacy description',
      totalPhases: 0,
      completedPhases: 0,
      progressPercentage: 0,
    });
  });
});
