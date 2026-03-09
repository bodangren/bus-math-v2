import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockNext = vi.fn();
const mockRedirect = vi.fn();
const mockVerifySessionToken = vi.fn();

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: mockNext,
      redirect: mockRedirect,
    },
  };
});

vi.mock('@/lib/auth/session', () => ({
  verifySessionToken: mockVerifySessionToken,
}));

const { proxy } = await import('../proxy');

function createRequest(pathnameWithQuery: string, cookieToken?: string) {
  const url = new URL(`http://localhost:3000${pathnameWithQuery}`);
  const nextUrl = Object.assign(url, {
    clone: () => new URL(url.toString()),
  });

  return {
    nextUrl,
    url: url.toString(),
    cookies: {
      get: (name: string) => {
        if (name === 'bm_session' && cookieToken) {
          return { value: cookieToken };
        }
        return undefined;
      },
    },
  } as unknown as NextRequest;
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('AUTH_JWT_SECRET', 'test-secret');
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.VERCEL_ENV;

    mockNext.mockImplementation(() => ({
      status: 200,
      headers: new Headers(),
      cookies: {
        set: vi.fn(),
        getAll: vi.fn(() => []),
      },
    }));

    mockRedirect.mockImplementation((url: URL | string) => {
      const location = typeof url === 'string' ? url : url.toString();
      return {
        status: 307,
        headers: new Headers({ location }),
      };
    });

    mockVerifySessionToken.mockResolvedValue(null);
  });

  it('allows public page routes without authentication', async () => {
    const response = await proxy(createRequest('/preface'));
    expect(response.status).toBe(200);
  });

  it('allows local demo provisioning requests without authentication', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    delete process.env.VERCEL_ENV;

    const response = await proxy(createRequest('/api/users/ensure-demo'));
    expect(response.status).toBe(200);
  });

  it('redirects unauthenticated preview demo provisioning requests to login', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');

    const response = await proxy(createRequest('/api/users/ensure-demo'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/login');
    expect(response.headers.get('location')).toContain('redirect=%2Fapi%2Fusers%2Fensure-demo');
  });

  it('redirects unauthenticated protected page requests to login with redirect param', async () => {
    const response = await proxy(createRequest('/student/dashboard?tab=progress'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/login');
    expect(response.headers.get('location')).toContain('redirect=%2Fstudent%2Fdashboard');
  });

  it('redirects unauthenticated protected API requests to login with redirect param', async () => {
    const response = await proxy(createRequest('/api/progress/phase'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/auth/login');
    expect(response.headers.get('location')).toContain('redirect=%2Fapi%2Fprogress%2Fphase');
  });

  it('allows student access to /student routes', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'student-id',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await proxy(createRequest('/student/lesson/abc', 'valid-token'));
    expect(response.status).toBe(200);
  });

  it('redirects student away from /teacher routes', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'student-id',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await proxy(createRequest('/teacher', 'valid-token'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/student/dashboard');
  });

  it('allows teacher access to /teacher and /student routes', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'teacher-id',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    const teacherResponse = await proxy(createRequest('/teacher', 'valid-token'));
    const studentResponse = await proxy(createRequest('/student', 'valid-token'));

    expect(teacherResponse.status).toBe(200);
    expect(studentResponse.status).toBe(200);
  });

  it('allows admin access to /teacher and /student routes', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'admin-id',
      username: 'admin',
      role: 'admin',
      iat: 1,
      exp: 2,
    });

    const teacherResponse = await proxy(createRequest('/teacher', 'valid-token'));
    const studentResponse = await proxy(createRequest('/student', 'valid-token'));

    expect(teacherResponse.status).toBe(200);
    expect(studentResponse.status).toBe(200);
  });
});
