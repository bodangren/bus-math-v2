import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRequireTeacherSessionClaims, mockFetchInternalQuery } = vi.hoisted(() => ({
  mockRequireTeacherSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: mockRequireTeacherSessionClaims,
}));

vi.mock('@/lib/convex/server', async () => {
  const actual = await vi.importActual<typeof import('@/lib/convex/server')>(
    '@/lib/convex/server',
  );
  return {
    ...actual,
    fetchInternalQuery: mockFetchInternalQuery,
    internal: {
      teacher: {
        getTeacherDashboardData: 'internal.teacher.getTeacherDashboardData',
        getTeacherCourseOverviewData: 'internal.teacher.getTeacherCourseOverviewData',
      },
    },
  };
});

const { default: TeacherDashboardPage } = await import('../../../app/teacher/page');

describe('TeacherDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireTeacherSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher_one',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === 'internal.teacher.getTeacherDashboardData') {
        return Promise.resolve({
          teacher: {
            username: 'teacher_one',
            organizationName: 'Test School',
            organizationId: 'org_1',
          },
          students: [],
        });
      }

      if (ref === 'internal.teacher.getTeacherCourseOverviewData') {
        return Promise.resolve({ rows: [], units: [] });
      }

      return Promise.resolve(null);
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireTeacherSessionClaims.mockRejectedValue(new Error('NEXT_REDIRECT'));

    await expect(TeacherDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRequireTeacherSessionClaims).toHaveBeenCalledWith('/teacher');
  });

  it('loads teacher dashboard using profile id from session claims', async () => {
    const jsx = await TeacherDashboardPage();

    expect(jsx).toBeDefined();
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(
      1,
      'internal.teacher.getTeacherDashboardData',
      {
        userId: 'teacher_profile_1',
      },
    );
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(
      2,
      'internal.teacher.getTeacherCourseOverviewData',
      {
        userId: 'teacher_profile_1',
      },
    );
  });
});
