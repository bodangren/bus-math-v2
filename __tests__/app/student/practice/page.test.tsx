import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';

const { mockRequireStudentSessionClaims } = vi.hoisted(() => ({
  mockRequireStudentSessionClaims: vi.fn(),
}));

const { MockDailyPracticeSession } = vi.hoisted(() => ({
  MockDailyPracticeSession: vi.fn(() => null),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  requireStudentSessionClaims: mockRequireStudentSessionClaims,
}));

vi.mock('@/components/student/DailyPracticeSession', () => ({
  DailyPracticeSession: MockDailyPracticeSession,
}));

const { default: DailyPracticePage } = await import('../../../../app/student/practice/page');

describe('DailyPracticePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireStudentSessionClaims.mockResolvedValue({
      sub: 'profile_1',
      username: 'student_one',
      role: 'student',
      iat: 1,
      exp: 2,
    });
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireStudentSessionClaims.mockImplementation(async () => redirect('/auth/login'));

    await expect(DailyPracticePage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('redirects teacher sessions to the teacher dashboard', async () => {
    mockRequireStudentSessionClaims.mockImplementation(async () => redirect('/teacher'));

    await expect(DailyPracticePage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/teacher');
  });

  it('passes studentId from session claims to DailyPracticeSession', async () => {
    MockDailyPracticeSession.mockReturnValue(<div data-testid="daily-practice-session">Mocked</div> as never
    );

    const page = await DailyPracticePage();
    render(page);

    expect(screen.getByTestId('daily-practice-session')).toBeInTheDocument();
    expect(MockDailyPracticeSession).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'profile_1' }),
      undefined,
    );
  });
});
