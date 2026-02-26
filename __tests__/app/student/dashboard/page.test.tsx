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
    student: {
      getDashboardData: 'api.student.getDashboardData',
    },
  },
}));

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
    mockQuery.mockResolvedValue([]);

    const jsx = await StudentDashboard();

    expect(jsx).toBeDefined();
    expect(mockQuery).toHaveBeenCalledWith('api.student.getDashboardData', {
      userId: 'profile_1',
    });
  });
});
