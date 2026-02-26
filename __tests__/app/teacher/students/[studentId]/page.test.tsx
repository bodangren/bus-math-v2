import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockRedirect = vi.fn((path: string) => {
  throw new Error(`redirect:${path}`);
});
const mockNotFound = vi.fn(() => {
  throw new Error('notFound');
});
const mockGetServerSessionClaims = vi.fn();
const mockSelect = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
  notFound: () => mockNotFound(),
}));

vi.mock('@/lib/auth/server', () => ({
  getServerSessionClaims: mockGetServerSessionClaims,
}));

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: mockSelect,
  },
}));

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
    const dbCallPlan = [
      [{ id: 'teacher-1', username: 'demo_teacher', role: 'teacher', organizationId: 'org-1' }],
      [{ id: 'org-1', name: 'Demo School' }],
      [{ id: 'student-1', username: 'demo_student', displayName: 'Demo Student' }],
      [{ id: 'pv-1' }, { id: 'pv-2' }],
      [{ phaseId: 'pv-1', status: 'completed', updatedAt: new Date('2026-02-09T08:00:00.000Z') }],
    ];

    let call = 0;
    mockSelect.mockImplementation(() => {
      const result = dbCallPlan[call] ?? [];
      call += 1;

      const chain = {
        from: () => chain,
        where: () => chain,
        limit: () => chain,
        then: <T,>(onfulfilled: (value: unknown[]) => T) =>
          Promise.resolve(onfulfilled(result)),
        catch: () => chain,
        finally: () => chain,
      };
      return chain as never;
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
  });

  it('returns notFound when student is outside teacher organization', async () => {
    const dbCallPlan = [
      [{ id: 'teacher-1', username: 'demo_teacher', role: 'teacher', organizationId: 'org-1' }],
      [{ id: 'org-1', name: 'Demo School' }],
      [],
      [],
      [],
    ];

    let call = 0;
    mockSelect.mockImplementation(() => {
      const result = dbCallPlan[call] ?? [];
      call += 1;

      const chain = {
        from: () => chain,
        where: () => chain,
        limit: () => chain,
        then: <T,>(onfulfilled: (value: unknown[]) => T) =>
          Promise.resolve(onfulfilled(result)),
        catch: () => chain,
        finally: () => chain,
      };
      return chain as never;
    });

    const { default: StudentDetailPage } = await StudentDetailPageImport();

    await expect(
      StudentDetailPage({
        params: Promise.resolve({ studentId: 'student-2' }),
      }),
    ).rejects.toThrow('notFound');
  });
});
