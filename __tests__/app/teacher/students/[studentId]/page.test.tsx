import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});
const mockNotFound = vi.fn(() => {
  throw new Error('notFound');
});
const mockGetServerSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
  notFound: () => mockNotFound(),
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
        getTeacherStudentDetail: 'internal.teacher.getTeacherStudentDetail',
      },
    },
  };
});

const StudentDetailPageImport = () => import('../../../../../app/teacher/students/[studentId]/page');

describe('Teacher student detail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetServerSessionClaims.mockResolvedValue({
      sub: 'teacher-1',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    const { default: StudentDetailPage } = await StudentDetailPageImport();

    await expect(
      StudentDetailPage({
        params: Promise.resolve({ studentId: 'student-1' }),
      }),
    ).rejects.toThrow('redirect:/auth/login?redirect=/teacher/students/student-1');
  }, 15_000);

  it('renders org-scoped student details', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      status: 'success',
      organizationName: 'Demo School',
      student: {
        id: 'student-1',
        username: 'demo_student',
        displayName: 'Demo Student',
      },
      snapshot: {
        completedPhases: 1,
        totalPhases: 2,
        progressPercentage: 50,
        lastActive: '2026-02-09T08:00:00.000Z',
      },
    });

    const { default: StudentDetailPage } = await StudentDetailPageImport();
    const page = await StudentDetailPage({
      params: Promise.resolve({ studentId: 'student-1' }),
    });

    render(page);

    expect(screen.getByText(/Student Details/i)).toBeInTheDocument();
    expect(screen.getByText('Demo School')).toBeInTheDocument();
    expect(screen.getByText('Demo Student')).toBeInTheDocument();
    expect(screen.getByText('@demo_student')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute(
      'href',
      '/teacher',
    );
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'internal.teacher.getTeacherStudentDetail',
      {
        userId: 'teacher-1',
        studentId: 'student-1',
      },
    );
  });

  it('returns notFound when student is outside teacher organization', async () => {
    mockFetchInternalQuery.mockResolvedValue({ status: 'not_found' });

    const { default: StudentDetailPage } = await StudentDetailPageImport();

    await expect(
      StudentDetailPage({
        params: Promise.resolve({ studentId: 'student-2' }),
      }),
    ).rejects.toThrow('notFound');
  });
});
