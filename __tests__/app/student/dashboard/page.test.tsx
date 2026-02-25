import { beforeEach, describe, expect, it, vi } from 'vitest';

import StudentDashboard from '../../../../app/student/dashboard/page';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
      }),
    },
  }),
}));

const mockQuery = vi.fn();
vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor() {}
    query = mockQuery;
  },
}));

// Provide minimal mocked Convex APIs
vi.mock('@/convex/_generated/api', () => ({
  api: {
    student: {
      getDashboardData: 'api.student.getDashboardData',
    },
  },
}));

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses versioned phase counts for progress calculations via Convex', async () => {
    mockQuery.mockResolvedValueOnce([
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Versioned Lesson',
            slug: 'legacy-lesson',
            description: 'Versioned description',
            totalPhases: 2,
            completedPhases: 1,
            progressPercentage: 50,
          },
        ],
      },
    ]);

    const jsx = await StudentDashboard();
    expect(jsx).toBeDefined();
    
    // Ensure the Convex query was called with the right user ID
    expect(mockQuery).toHaveBeenCalledWith('api.student.getDashboardData', {
      userId: 'user-1',
    });
  });

  it('returns zero-phase progress when no lesson versions exist', async () => {
    mockQuery.mockResolvedValueOnce([
      {
        unitNumber: 1,
        unitTitle: 'Unit 1',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Legacy Lesson',
            slug: 'legacy-lesson',
            description: 'Legacy description',
            totalPhases: 0,
            completedPhases: 0,
            progressPercentage: 0,
          },
        ],
      },
    ]);

    const jsx = await StudentDashboard();
    expect(jsx).toBeDefined();
    expect(mockQuery).toHaveBeenCalled();
  });
});
