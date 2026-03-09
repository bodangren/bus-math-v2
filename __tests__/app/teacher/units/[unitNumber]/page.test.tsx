import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notFound, redirect } from 'next/navigation';

const { mockRequireTeacherSessionClaims, mockFetchInternalQuery } = vi.hoisted(() => ({
  mockRequireTeacherSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
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
        getTeacherGradebookData: 'internal.teacher.getTeacherGradebookData',
      },
    },
  };
});

const { default: UnitGradebookPage } = await import('../../../../../app/teacher/units/[unitNumber]/page');

describe('UnitGradebookPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireTeacherSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher_one',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
    mockFetchInternalQuery.mockResolvedValue({ rows: [], lessons: [] });
  });

  it('returns notFound for an invalid unit number', async () => {
    await expect(
      UnitGradebookPage({
        params: Promise.resolve({ unitNumber: 'abc' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('loads the unit gradebook from an internal teacher query', async () => {
    const page = await UnitGradebookPage({
      params: Promise.resolve({ unitNumber: '2' }),
    });

    expect(page).toBeDefined();
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'internal.teacher.getTeacherGradebookData',
      {
        userId: 'teacher_profile_1',
        unitNumber: 2,
      },
    );
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireTeacherSessionClaims.mockRejectedValue(
      new Error('NEXT_REDIRECT:/auth/login?redirect=/teacher/units/2'),
    );

    await expect(
      UnitGradebookPage({
        params: Promise.resolve({ unitNumber: '2' }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/auth/login?redirect=/teacher/units/2');
    expect(mockRequireTeacherSessionClaims).toHaveBeenCalledWith('/teacher/units/2');
  });

  it('returns teachers to the dashboard when unit gradebook data is unavailable', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    await expect(
      UnitGradebookPage({
        params: Promise.resolve({ unitNumber: '2' }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/teacher');
    expect(redirect).toHaveBeenCalledWith('/teacher');
  });
});
