import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  checkAndIncrementLoginRateLimitHandler,
  cleanupStaleLoginRateLimitsHandler,
} from '../../convex/loginRateLimits';
import { hashIpAddress } from '../../lib/auth/ip-hash';

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const mockGetUserIdentity = vi.fn();
const mockQuery = vi.fn();
const mockWithIndex = vi.fn();
const mockUnique = vi.fn();
const mockCollect = vi.fn();
const mockInsert = vi.fn().mockResolvedValue('new_id_123');
const mockPatch = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);

function createMockCtx(
  role: string | null = 'admin',
  authenticated = true
) {
  mockGetUserIdentity.mockResolvedValue(
    authenticated
      ? { email: role ? 'admin@example.com' : undefined }
      : null
  );

  mockUnique.mockResolvedValue(null);
  mockCollect.mockResolvedValue([]);
  mockWithIndex.mockReturnValue({ unique: mockUnique, collect: mockCollect });

  mockQuery.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        withIndex: vi.fn().mockImplementation((_idx: string, handler: (q: unknown) => unknown) => {
          const chainableEq = { eq: () => chainableEq };
          handler({ eq: () => chainableEq });
          return {
            unique: vi.fn().mockResolvedValue(
              role ? { role, email: 'admin@example.com' } : null
            ),
          };
        }),
      };
    }
    return { withIndex: mockWithIndex, collect: mockCollect };
  });

  return {
    auth: { getUserIdentity: mockGetUserIdentity },
    db: {
      query: mockQuery,
      insert: mockInsert,
      patch: mockPatch,
      delete: mockDelete,
    },
  };
}

describe('loginRateLimits handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAndIncrementLoginRateLimitHandler', () => {
    it('creates new window with attempts=1 on first request', async () => {
      const ctx = createMockCtx();
      mockUnique.mockResolvedValue(null);

      const result = await checkAndIncrementLoginRateLimitHandler(ctx as never, {
        ipHash: 'abc123',
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.windowExpiresAt).toBeGreaterThan(Date.now());
      expect(mockInsert).toHaveBeenCalledWith('login_rate_limits', {
        ipHash: 'abc123',
        requestCount: 1,
        windowStart: expect.any(Number),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it('increments attempts within active window', async () => {
      const ctx = createMockCtx();
      const existingWindowStart = Date.now();
      mockUnique.mockResolvedValue({
        _id: 'entry_123' as never,
        ipHash: 'abc123',
        requestCount: 2,
        windowStart: existingWindowStart,
        createdAt: existingWindowStart,
        updatedAt: existingWindowStart,
      });

      const result = await checkAndIncrementLoginRateLimitHandler(ctx as never, {
        ipHash: 'abc123',
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
      expect(mockPatch).toHaveBeenCalledWith('entry_123' as never, {
        requestCount: 3,
        updatedAt: expect.any(Number),
      });
    });

    it('allows exactly 5 requests in window', async () => {
      const ctx = createMockCtx();
      const existingWindowStart = Date.now();
      mockUnique.mockResolvedValue({
        _id: 'entry_123' as never,
        ipHash: 'abc123',
        requestCount: 4,
        windowStart: existingWindowStart,
        createdAt: existingWindowStart,
        updatedAt: existingWindowStart,
      });

      const result = await checkAndIncrementLoginRateLimitHandler(ctx as never, {
        ipHash: 'abc123',
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('blocks 6th request within same window', async () => {
      const ctx = createMockCtx();
      const existingWindowStart = Date.now();
      mockUnique.mockResolvedValue({
        _id: 'entry_123' as never,
        ipHash: 'abc123',
        requestCount: 5,
        windowStart: existingWindowStart,
        createdAt: existingWindowStart,
        updatedAt: existingWindowStart,
      });

      const result = await checkAndIncrementLoginRateLimitHandler(ctx as never, {
        ipHash: 'abc123',
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.windowExpiresAt).toBe(
        existingWindowStart + LOGIN_RATE_LIMIT_WINDOW_MS
      );
    });

    it('resets window after expiry', async () => {
      const ctx = createMockCtx();
      const oldWindowStart = Date.now() - LOGIN_RATE_LIMIT_WINDOW_MS - 1000;
      mockUnique.mockResolvedValue({
        _id: 'entry_123' as never,
        ipHash: 'abc123',
        requestCount: 5,
        windowStart: oldWindowStart,
        createdAt: oldWindowStart,
        updatedAt: oldWindowStart,
      });

      const result = await checkAndIncrementLoginRateLimitHandler(ctx as never, {
        ipHash: 'abc123',
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(mockPatch).toHaveBeenCalledWith('entry_123' as never, {
        requestCount: 1,
        windowStart: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });
  });

  describe('cleanupStaleLoginRateLimitsHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);

      await expect(
        cleanupStaleLoginRateLimitsHandler(ctx as never)
      ).rejects.toThrow('Unauthenticated');
    });

    it('rejects non-admin callers', async () => {
      const ctx = createMockCtx('student');

      await expect(
        cleanupStaleLoginRateLimitsHandler(ctx as never)
      ).rejects.toThrow('Unauthorized: admin only');
    });

    it('deletes only stale entries', async () => {
      const ctx = createMockCtx('admin');
      const now = Date.now();
      const staleThreshold = now - LOGIN_STALE_ENTRY_THRESHOLD_MS;

      const entries = [
        {
          _id: 'stale_1' as never,
          ipHash: 'ip1',
          requestCount: 1,
          windowStart: staleThreshold - 1000,
          createdAt: staleThreshold - 1000,
          updatedAt: staleThreshold - 1000,
        },
        {
          _id: 'stale_2' as never,
          ipHash: 'ip2',
          requestCount: 2,
          windowStart: staleThreshold - 2000,
          createdAt: staleThreshold - 2000,
          updatedAt: staleThreshold - 2000,
        },
        {
          _id: 'valid_1' as never,
          ipHash: 'ip3',
          requestCount: 3,
          windowStart: now - 1000,
          createdAt: now - 1000,
          updatedAt: now - 1000,
        },
      ];
      mockCollect.mockResolvedValue(entries);

      const result = await cleanupStaleLoginRateLimitsHandler(ctx as never);

      expect(result.deletedCount).toBe(2);
      expect(mockDelete).toHaveBeenCalledWith('stale_1' as never);
      expect(mockDelete).toHaveBeenCalledWith('stale_2' as never);
      expect(mockDelete).not.toHaveBeenCalledWith('valid_1' as never);
    });

    it('returns zero when no stale entries exist', async () => {
      const ctx = createMockCtx('admin');
      mockCollect.mockResolvedValue([]);

      const result = await cleanupStaleLoginRateLimitsHandler(ctx as never);

      expect(result.deletedCount).toBe(0);
    });
  });

  describe('hashIpAddress utility', () => {
    it('produces deterministic output for same input', () => {
      const hash1 = hashIpAddress('192.168.1.1');
      const hash2 = hashIpAddress('192.168.1.1');
      expect(hash1).toBe(hash2);
    });

    it('produces different output for different inputs', () => {
      const hash1 = hashIpAddress('192.168.1.1');
      const hash2 = hashIpAddress('192.168.1.2');
      expect(hash1).not.toBe(hash2);
    });

    it('produces 32-character hex string', () => {
      const hash = hashIpAddress('127.0.0.1');
      expect(hash).toMatch(/^[a-f0-9]{32}$/);
    });

    it('handles IPv6 address', () => {
      const hash = hashIpAddress('::1');
      expect(hash).toMatch(/^[a-f0-9]{32}$/);
    });
  });
});