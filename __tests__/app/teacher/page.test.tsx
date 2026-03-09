import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';

const { mockGetServerSessionClaims, mockFetchInternalQuery } = vi.hoisted(() => ({
  mockGetServerSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  getServerSessionClaims: mockGetServerSessionClaims,
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
    mockGetServerSessionClaims.mockResolvedValue({
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
    mockGetServerSessionClaims.mockResolvedValue(null);

    await expect(TeacherDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login?redirect=/teacher');
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
