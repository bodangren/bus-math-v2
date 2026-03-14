import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});
const mockNotFound = vi.fn(() => {
  throw new Error('notFound');
});
const mockRequireTeacherSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
  notFound: () => mockNotFound(),
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
        getTeacherStudentDetail: 'internal.teacher.getTeacherStudentDetail',
      },
    },
  };
});

const StudentDetailPageImport = () => import('../../../../../app/teacher/students/[studentId]/page');

describe('Teacher student detail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRequireTeacherSessionClaims.mockResolvedValue({
      sub: 'teacher-1',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireTeacherSessionClaims.mockRejectedValue(
      new Error('redirect:/auth/login?redirect=/teacher/students/student-1'),
    );

    const { default: StudentDetailPage } = await StudentDetailPageImport();

    await expect(
      StudentDetailPage({
        params: Promise.resolve({ studentId: 'student-1' }),
      }),
    ).rejects.toThrow('redirect:/auth/login?redirect=/teacher/students/student-1');
    expect(mockRequireTeacherSessionClaims).toHaveBeenCalledWith('/teacher/students/student-1');
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
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1',
          lessons: [
            {
              id: 'lesson-1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'unit-1-lesson-1',
              description: 'Completed lesson',
              completedPhases: 2,
              totalPhases: 2,
              progressPercentage: 100,
            },
            {
              id: 'lesson-2',
              unitNumber: 1,
              title: 'Lesson 2',
              slug: 'unit-1-lesson-2',
              description: 'Resume this lesson',
              completedPhases: 1,
              totalPhases: 2,
              progressPercentage: 50,
            },
          ],
        },
      ],
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
    expect(screen.getAllByText('1 / 2').length).toBeGreaterThan(0);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText(/next best lesson/i)).toBeInTheDocument();
    expect(screen.getAllByText('Lesson 2').length).toBeGreaterThan(0);
    expect(screen.getByText(/unit progress/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resume lesson/i })).toHaveAttribute(
      'href',
      '/student/lesson/unit-1-lesson-2',
    );
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

  it('renders a zero-state analytics view when the student has no progress yet', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      status: 'success',
      organizationName: 'Demo School',
      student: {
        id: 'student-1',
        username: 'new_student',
        displayName: null,
      },
      snapshot: {
        completedPhases: 0,
        totalPhases: 0,
        progressPercentage: 0,
        lastActive: null,
      },
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1',
          lessons: [
            {
              id: 'lesson-1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'unit-1-lesson-1',
              description: null,
              completedPhases: 0,
              totalPhases: 6,
              progressPercentage: 0,
            },
          ],
        },
      ],
    });

    const { default: StudentDetailPage } = await StudentDetailPageImport();
    const page = await StudentDetailPage({
      params: Promise.resolve({ studentId: 'student-1' }),
    });

    render(page);

    expect(screen.getByText('@new_student')).toBeInTheDocument();
    expect(screen.getByText(/has not recorded progress yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start lesson/i })).toHaveAttribute(
      'href',
      '/student/lesson/unit-1-lesson-1',
    );
  });

  it('renders a completed state without a next-lesson action', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      status: 'success',
      organizationName: 'Demo School',
      student: {
        id: 'student-1',
        username: 'finisher',
        displayName: 'Finisher',
      },
      snapshot: {
        completedPhases: 6,
        totalPhases: 6,
        progressPercentage: 100,
        lastActive: '2026-03-10T08:00:00.000Z',
      },
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1',
          lessons: [
            {
              id: 'lesson-1',
              unitNumber: 1,
              title: 'Lesson 1',
              slug: 'unit-1-lesson-1',
              description: null,
              completedPhases: 6,
              totalPhases: 6,
              progressPercentage: 100,
            },
          ],
        },
      ],
    });

    const { default: StudentDetailPage } = await StudentDetailPageImport();
    const page = await StudentDetailPage({
      params: Promise.resolve({ studentId: 'student-1' }),
    });

    render(page);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(
      screen.getAllByText(/completed all published lessons/i).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /resume lesson/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /start lesson/i })).not.toBeInTheDocument();
  });

  it('labels the capstone distinctly in teacher student progress summaries', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      status: 'success',
      organizationName: 'Demo School',
      student: {
        id: 'student-1',
        username: 'capstone_runner',
        displayName: 'Capstone Runner',
      },
      snapshot: {
        completedPhases: 1,
        totalPhases: 4,
        progressPercentage: 25,
        lastActive: '2026-03-10T08:00:00.000Z',
      },
      units: [
        {
          unitNumber: 9,
          unitTitle: 'Capstone: Investor-Ready Plan',
          lessons: [
            {
              id: 'capstone-lesson',
              unitNumber: 9,
              title: 'Capstone: Investor-Ready Plan',
              slug: 'capstone-investor-ready-plan',
              description: 'Resume the final pitch workflow',
              completedPhases: 1,
              totalPhases: 4,
              progressPercentage: 25,
            },
          ],
        },
      ],
    });

    const { default: StudentDetailPage } = await StudentDetailPageImport();
    const page = await StudentDetailPage({
      params: Promise.resolve({ studentId: 'student-1' }),
    });

    render(page);

    expect(screen.getAllByText(/^Capstone$/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^Unit 9$/)).not.toBeInTheDocument();
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

  it('returns teachers to the dashboard when access is denied after auth', async () => {
    mockFetchInternalQuery.mockResolvedValue({ status: 'unauthorized' });

    const { default: StudentDetailPage } = await StudentDetailPageImport();

    await expect(
      StudentDetailPage({
        params: Promise.resolve({ studentId: 'student-1' }),
      }),
    ).rejects.toThrow('redirect:/teacher');
    expect(mockRedirect).toHaveBeenCalledWith('/teacher');
  });
});
