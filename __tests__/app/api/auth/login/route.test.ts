import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockVerifyPassword = vi.fn();
const mockSignSessionToken = vi.fn();
const mockCookies = vi.fn();
const mockCookieSet = vi.fn();

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    auth: {
      getCredentialByUsername: 'internal.auth.getCredentialByUsername',
    },
    loginRateLimits: {
      checkAndIncrementLoginRateLimit: 'internal.loginRateLimits.checkAndIncrementLoginRateLimit',
    },
  },
}));

vi.mock('@/lib/auth/session', () => ({
  verifyPassword: mockVerifyPassword,
  signSessionToken: mockSignSessionToken,
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

const { POST } = await import('../../../../../app/api/auth/login/route');

function buildRequest(body: unknown, ip: string = '127.0.0.1') {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ set: mockCookieSet });
    mockSignSessionToken.mockResolvedValue('signed-session-token');
    mockFetchInternalMutation.mockResolvedValue({
      allowed: true,
      remaining: 4,
      windowExpiresAt: Date.now() + 15 * 60 * 1000,
    });
  });

  it('returns 400 for invalid request body', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid',
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Invalid request body' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 400 when username or password is missing', async () => {
    const response = await POST(buildRequest({ username: '', password: '' }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: 'Username and password are required' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 401 when the credential does not exist', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const response = await POST(buildRequest({ username: 'demo_student', password: 'demo123' }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Invalid login credentials' });
    expect(mockFetchInternalQuery).toHaveBeenCalledWith('internal.auth.getCredentialByUsername', {
      username: 'demo_student',
    });
  });

  it('returns 401 when the password is invalid', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'profile-1',
      username: 'demo_student',
      role: 'student',
      organizationId: 'org-1',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
      passwordHash: 'hash',
    });
    mockVerifyPassword.mockResolvedValue(false);

    const response = await POST(buildRequest({ username: 'demo_student', password: 'wrong' }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Invalid login credentials' });
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it('sets session cookie and returns ok for valid credentials', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'profile-1',
      username: 'demo_student',
      role: 'student',
      organizationId: 'org-1',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
      passwordHash: 'hash',
    });
    mockVerifyPassword.mockResolvedValue(true);

    const response = await POST(buildRequest({ username: 'demo_student', password: 'demo123' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });

    expect(mockSignSessionToken).toHaveBeenCalledWith(
      {
        sub: 'profile-1',
        username: 'demo_student',
        role: 'student',
        organizationId: 'org-1',
      },
      expect.any(String),
      60 * 60 * 12,
    );

    expect(mockCookieSet).toHaveBeenCalledWith(
      'bm_session',
      'signed-session-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });

  it('returns 429 when rate limited', async () => {
    mockFetchInternalMutation.mockResolvedValue({
      allowed: false,
      remaining: 0,
      windowExpiresAt: Date.now() + 15 * 60 * 1000,
    });

    const response = await POST(buildRequest({ username: 'demo_student', password: 'demo123' }));
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual({ error: 'Too many login attempts. Please try again later.' });
    expect(response.headers.get('Retry-After')).toBeTruthy();
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 503 when rate limit check fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchInternalMutation.mockRejectedValue(new Error('Convex unavailable'));

    const response = await POST(buildRequest({ username: 'demo_student', password: 'demo123' }));
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual({ error: 'Authentication service unavailable' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('returns 500 when internal auth lookup fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchInternalQuery.mockRejectedValue(new Error('Missing CONVEX_DEPLOY_KEY'));

    const response = await POST(buildRequest({ username: 'demo_student', password: 'demo123' }));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Authentication service unavailable' });
    expect(mockCookieSet).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
