import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';

const mockGetServerSessionClaims = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  getServerSessionClaims: mockGetServerSessionClaims,
}));

const mockQuery = vi.fn();
vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    query = mockQuery;
  },
}));

vi.mock('@/convex/_generated/api', () => ({
  api: {
    teacher: {
      getTeacherDashboardData: 'api.teacher.getTeacherDashboardData',
    },
  },
}));

vi.mock('@/lib/teacher/course-overview-data', () => ({
  fetchCourseOverviewData: vi.fn().mockResolvedValue([]),
}));

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
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    await expect(TeacherDashboardPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login?redirect=/teacher');
  });

  it('loads teacher dashboard using profile id from session claims', async () => {
    mockQuery.mockResolvedValue({
      teacher: {
        username: 'teacher_one',
        organizationName: 'Test School',
        organizationId: 'org_1',
      },
      students: [],
    });

    const jsx = await TeacherDashboardPage();

    expect(jsx).toBeDefined();
    expect(mockQuery).toHaveBeenCalledWith('api.teacher.getTeacherDashboardData', {
      userId: 'teacher_profile_1',
    });
  });
});
