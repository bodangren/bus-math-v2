import { describe, expect, it, vi, beforeEach } from 'vitest';
import { requireActiveRequestSessionClaims } from '@/lib/auth/server';

vi.mock('@/lib/auth/server', async () => {
  const actual = await vi.importActual('@/lib/auth/server');
  return {
    ...actual,
  };
});

vi.mock('@/lib/convex/server', () => ({
  internal: {
    auth: {
      getCredentialByUsername: 'internal:auth:getCredentialByUsername',
    },
  },
  fetchInternalQuery: vi.fn(),
}));

import { fetchInternalQuery } from '@/lib/convex/server';
import { signSessionToken } from '@/lib/auth/session';
import { getAuthJwtSecret } from '@/lib/auth/constants';

const mockFetchInternalQuery = vi.mocked(fetchInternalQuery);

function buildRequestWithCookie(token: string): Request {
  return new Request('http://localhost/api/test', {
    headers: { cookie: `bm_session=${token}` },
  });
}

async function makeToken(overrides: Partial<{ username: string; sub: string; role: 'student' | 'teacher' | 'admin' }> = {}) {
  return signSessionToken(
    {
      sub: overrides.sub ?? 'profile_123',
      username: overrides.username ?? 'test_student',
      role: overrides.role ?? 'student',
    },
    getAuthJwtSecret(),
    3600,
  );
}

describe('requireActiveRequestSessionClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns claims when credential is active', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      id: 'cred_123',
      username: 'test_student',
      role: 'student',
    });

    const token = await makeToken();
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.username).toBe('test_student');
    }
  });

  it('returns 401 when credential is deactivated', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const token = await makeToken();
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it('returns 401 when no session cookie exists', async () => {
    const request = new Request('http://localhost/api/test');
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it('returns 401 when JWT is expired', async () => {
    const token = await signSessionToken(
      { sub: 'profile_123', username: 'test_student', role: 'student' },
      getAuthJwtSecret(),
      -1, // already expired
    );
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it('queries Convex with the correct username', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      id: 'cred_456',
      username: 'alice',
      role: 'student',
    });

    const token = await makeToken({ username: 'alice' });
    const request = buildRequestWithCookie(token);
    await requireActiveRequestSessionClaims(request);

    expect(mockFetchInternalQuery).toHaveBeenCalledTimes(1);
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'internal:auth:getCredentialByUsername',
      { username: 'alice' },
    );
  });

  it('returns 503 when Convex query throws', async () => {
    mockFetchInternalQuery.mockRejectedValue(new Error('Convex network error'));

    const token = await makeToken();
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(503);
      const body = await result.json();
      expect(body.error).toBe('Credential verification temporarily unavailable');
    }
  });

  it('returns 503 with custom message when Convex query throws', async () => {
    mockFetchInternalQuery.mockRejectedValue(new Error('Timeout'));

    const token = await makeToken();
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request, 'Custom auth error');

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(503);
      const body = await result.json();
      expect(body.error).toBe('Credential verification temporarily unavailable');
    }
  });
});
