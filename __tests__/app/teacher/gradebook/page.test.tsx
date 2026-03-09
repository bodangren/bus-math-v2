import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';

const { mockGetServerSessionClaims, mockFetchInternalQuery } = vi.hoisted(() => ({
  mockGetServerSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
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
        getTeacherCourseOverviewData: 'internal.teacher.getTeacherCourseOverviewData',
      },
    },
  };
});

const { default: CourseGradebookPage } = await import('../../../../app/teacher/gradebook/page');

describe('CourseGradebookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher_one',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
    mockFetchInternalQuery.mockResolvedValue({ rows: [], units: [] });
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    await expect(CourseGradebookPage()).rejects.toThrow(
      'NEXT_REDIRECT:/auth/login?redirect=/teacher/gradebook',
    );
    expect(redirect).toHaveBeenCalledWith('/auth/login?redirect=/teacher/gradebook');
  });

  it('loads the course overview from an internal teacher query', async () => {
    const page = await CourseGradebookPage();

    expect(page).toBeDefined();
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'internal.teacher.getTeacherCourseOverviewData',
      {
        userId: 'teacher_profile_1',
      },
    );
  });
});
