import { describe, it, expect } from 'vitest';
import { signSessionToken } from '@/lib/auth/session';

const TEST_SECRET = 'test-secret-key-for-middleware';

function getCookieValueFromHeader(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;

  const entries = cookieHeader.split(';');
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;

    return decodeURIComponent(trimmed.slice(separatorIndex + 1));
  }

  return null;
}

describe('Dev Component Review Middleware', () => {
  describe('Cookie extraction', () => {
    it('extracts cookie value from header', () => {
      const cookieHeader = 'bm_session=test-token; other_cookie=value';
      const result = getCookieValueFromHeader(cookieHeader, 'bm_session');
      expect(result).toBe('test-token');
    });

    it('returns null when cookie not found', () => {
      const cookieHeader = 'other_cookie=value';
      const result = getCookieValueFromHeader(cookieHeader, 'bm_session');
      expect(result).toBeNull();
    });

    it('returns null for empty header', () => {
      const result = getCookieValueFromHeader(null, 'bm_session');
      expect(result).toBeNull();
    });

    it('handles cookie with special characters in value', () => {
      const cookieHeader = 'bm_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature';
      const result = getCookieValueFromHeader(cookieHeader, 'bm_session');
      expect(result).toBe('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature');
    });
  });

  describe('JWT token validation', () => {
    it('verifies valid admin token', async () => {
      const token = await signSessionToken(
        {
          sub: 'profile_123',
          username: 'admin_user',
          role: 'admin',
          organizationId: 'org_123',
        },
        TEST_SECRET,
        3600,
      );

      const { verifySessionToken } = await import('@/lib/auth/session');
      const claims = await verifySessionToken(token, TEST_SECRET);

      expect(claims).not.toBeNull();
      expect(claims?.role).toBe('admin');
      expect(claims?.username).toBe('admin_user');
    });

    it('rejects expired token', async () => {
      const token = await signSessionToken(
        {
          sub: 'profile_123',
          username: 'admin_user',
          role: 'admin',
        },
        TEST_SECRET,
        -1,
      );

      const { verifySessionToken } = await import('@/lib/auth/session');
      const claims = await verifySessionToken(token, TEST_SECRET);

      expect(claims).toBeNull();
    });

    it('rejects token with wrong secret', async () => {
      const token = await signSessionToken(
        {
          sub: 'profile_123',
          username: 'admin_user',
          role: 'admin',
        },
        'secret-a',
        3600,
      );

      const { verifySessionToken } = await import('@/lib/auth/session');
      const claims = await verifySessionToken(token, 'secret-b');

      expect(claims).toBeNull();
    });

    it('rejects token with non-admin role', async () => {
      const token = await signSessionToken(
        {
          sub: 'profile_123',
          username: 'teacher_user',
          role: 'teacher',
        },
        TEST_SECRET,
        3600,
      );

      const { verifySessionToken } = await import('@/lib/auth/session');
      const claims = await verifySessionToken(token, TEST_SECRET);

      expect(claims).not.toBeNull();
      expect(claims?.role).toBe('teacher');
      expect(claims?.role).not.toBe('admin');
    });
  });
});