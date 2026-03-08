import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';

const { mockGetServerSessionClaims, mockFetchInternalQuery, mockFetchCourseOverviewData } =
  vi.hoisted(() => ({
    mockGetServerSessionClaims: vi.fn(),
    mockFetchInternalQuery: vi.fn(),
    mockFetchCourseOverviewData: vi.fn(),
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
      },
    },
  };
});

vi.mock('@/lib/teacher/course-overview-data', () => ({
  fetchCourseOverviewData: mockFetchCourseOverviewData,
}));

const { default: TeacherDashboardPage } = await import('../../../app/teacher/page');

describe('TeacherDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCourseOverviewData.mockResolvedValue({ rows: [], units: [] });
    mockGetServerSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher_one',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    await expect(TeacherDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login?redirect=/teacher');
  });

  it('loads teacher dashboard using profile id from session claims', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      teacher: {
        username: 'teacher_one',
        organizationName: 'Test School',
        organizationId: 'org_1',
      },
      students: [],
    });

    const jsx = await TeacherDashboardPage();

    expect(jsx).toBeDefined();
    expect(mockFetchInternalQuery).toHaveBeenCalledWith('internal.teacher.getTeacherDashboardData', {
      userId: 'teacher_profile_1',
    });
  });
});
