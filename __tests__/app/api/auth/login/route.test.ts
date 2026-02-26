import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchInternalQuery = vi.fn();
const mockVerifyPassword = vi.fn();
const mockSignSessionToken = vi.fn();
const mockCookies = vi.fn();
const mockCookieSet = vi.fn();

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    auth: {
      getCredentialByUsername: 'internal.auth.getCredentialByUsername',
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

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ set: mockCookieSet });
    mockSignSessionToken.mockResolvedValue('signed-session-token');
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
