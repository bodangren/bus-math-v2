import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCookies, mockVerifySessionToken, mockGetAuthJwtSecret } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockVerifySessionToken: vi.fn(),
  mockGetAuthJwtSecret: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock('@/lib/auth/constants', () => ({
  SESSION_COOKIE_NAME: 'busmath_session',
  getAuthJwtSecret: mockGetAuthJwtSecret,
}));

vi.mock('@/lib/auth/session', () => ({
  verifySessionToken: mockVerifySessionToken,
}));

const loadModule = async () => import('../../../lib/auth/server');

describe('lib/auth/server role guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthJwtSecret.mockReturnValue('test-secret');
    mockCookies.mockResolvedValue({
      get: vi.fn(() => ({ value: 'signed-token' })),
    });
    mockVerifySessionToken.mockResolvedValue({
      sub: 'profile_1',
      username: 'teacher_one',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
  });

  it('redirects unauthenticated users to login when a session is required', async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn(() => undefined),
    });

    const { requireServerSessionClaims } = await loadModule();

    await expect(
      requireServerSessionClaims('/teacher/gradebook'),
    ).rejects.toThrow('NEXT_REDIRECT:/auth/login?redirect=/teacher/gradebook');
  });

  it('redirects disallowed roles to the provided fallback path', async () => {
    const { requireServerRoles } = await loadModule();

    expect(() =>
      requireServerRoles(
        {
          sub: 'profile_2',
          username: 'student_one',
          role: 'student',
          iat: 1,
          exp: 2,
        },
        ['teacher', 'admin'],
        '/student/dashboard',
      ),
    ).toThrow('NEXT_REDIRECT:/student/dashboard');
  });

  it('returns claims for teacher/admin sessions through the convenience helper', async () => {
    const { requireTeacherSessionClaims } = await loadModule();

    await expect(
      requireTeacherSessionClaims('/teacher'),
    ).resolves.toMatchObject({
      sub: 'profile_1',
      role: 'teacher',
    });
  });
});
