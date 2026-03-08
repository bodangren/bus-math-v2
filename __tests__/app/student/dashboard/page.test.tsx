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
      student: {
        getDashboardData: 'internal.student.getDashboardData',
      },
    },
  };
});

const { default: StudentDashboard } = await import('../../../../app/student/dashboard/page');

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSessionClaims.mockResolvedValue({
      sub: 'profile_1',
      username: 'student_one',
      role: 'student',
      iat: 1,
      exp: 2,
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    await expect(StudentDashboard()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('queries dashboard data with profile id from session claims', async () => {
    mockFetchInternalQuery.mockResolvedValue([]);

    const jsx = await StudentDashboard();

    expect(jsx).toBeDefined();
    expect(mockFetchInternalQuery).toHaveBeenCalledWith('internal.student.getDashboardData', {
      userId: 'profile_1',
    });
  });
});
