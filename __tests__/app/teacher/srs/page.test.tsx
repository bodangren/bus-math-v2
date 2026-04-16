import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRequireTeacherSessionClaims, mockFetchInternalQuery } = vi.hoisted(() => ({
  mockRequireTeacherSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
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
      },
      srs: {
        getTeacherClasses: 'internal.srs.getTeacherClasses',
      },
    },
  };
});

const { default: TeacherSRSPage } = await import('../../../../app/teacher/srs/page');

describe('TeacherSRSPage', () => {
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

      if (ref === 'internal.srs.getTeacherClasses') {
        return Promise.resolve([
          { id: 'class_1', name: 'Class A', description: null, academicYear: '2026' },
        ]);
      }

      return Promise.resolve(null);
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireTeacherSessionClaims.mockRejectedValue(
      new Error('NEXT_REDIRECT:/auth/login?redirect=/teacher/srs'),
    );

    await expect(TeacherSRSPage()).rejects.toThrow(
      'NEXT_REDIRECT:/auth/login?redirect=/teacher/srs',
    );
    expect(mockRequireTeacherSessionClaims).toHaveBeenCalledWith('/teacher/srs');
  });

  it('loads SRS page using profile id from session claims', async () => {
    const jsx = await TeacherSRSPage();

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
      'internal.srs.getTeacherClasses',
      {
        userId: 'teacher_profile_1',
      },
    );
  });

  it('redirects to login when teacher data is unavailable', async () => {
    mockFetchInternalQuery.mockImplementation((ref: string) => {
      if (ref === 'internal.teacher.getTeacherDashboardData') {
        return Promise.resolve(null);
      }
      return Promise.resolve([]);
    });

    await expect(TeacherSRSPage()).rejects.toThrow('NEXT_REDIRECT:/auth/login');
  });
});
