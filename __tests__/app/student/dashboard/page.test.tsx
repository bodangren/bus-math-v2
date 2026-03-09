import { render, screen } from '@testing-library/react';
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

  it('renders summary metrics, the next recommended lesson, and unit progress cards', async () => {
    mockFetchInternalQuery.mockResolvedValue([
      {
        unitNumber: 1,
        unitTitle: 'Unit 1: Balance by Design',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Audit Trail Basics',
            slug: 'unit-1-lesson-1',
            description: 'Completed lesson',
            completedPhases: 6,
            totalPhases: 6,
            progressPercentage: 100,
          },
          {
            id: 'lesson-2',
            unitNumber: 1,
            title: 'Cash Controls',
            slug: 'unit-1-lesson-2',
            description: 'Resume me',
            completedPhases: 2,
            totalPhases: 6,
            progressPercentage: 33,
          },
        ],
      },
    ]);

    const page = await StudentDashboard();
    render(page);

    expect(screen.getByRole('heading', { name: /student progress hub/i })).toBeInTheDocument();
    expect(screen.getByText(/course progress/i)).toBeInTheDocument();
    expect(screen.getByText(/continue learning/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /resume lesson/i })[0]).toHaveAttribute(
      'href',
      '/student/lesson/unit-1-lesson-2',
    );
    expect(screen.getByText(/1 of 2 lessons complete/i)).toBeInTheDocument();
    expect(screen.getByText(/unit 1: balance by design/i)).toBeInTheDocument();
  });

  it('shows a completion-state message when every lesson is complete', async () => {
    mockFetchInternalQuery.mockResolvedValue([
      {
        unitNumber: 1,
        unitTitle: 'Unit 1: Balance by Design',
        lessons: [
          {
            id: 'lesson-1',
            unitNumber: 1,
            title: 'Audit Trail Basics',
            slug: 'unit-1-lesson-1',
            description: 'Completed lesson',
            completedPhases: 6,
            totalPhases: 6,
            progressPercentage: 100,
          },
        ],
      },
    ]);

    const page = await StudentDashboard();
    render(page);

    expect(screen.getByText(/you have finished every available lesson/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /resume lesson/i })).not.toBeInTheDocument();
  });
});
