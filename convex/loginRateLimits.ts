import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { createHash } from 'crypto';

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_REQUESTS_PER_WINDOW = 5;
const LOGIN_STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export const checkAndIncrementLoginRateLimit = mutation({
  args: { ipHash: v.string() },
  handler: async (ctx, args) => {
    const { ipHash } = args;
    const now = Date.now();

    const existing = await ctx.db
      .query('login_rate_limits')
      .withIndex('by_ip', (q) => q.eq('ipHash', ipHash))
      .unique();

    if (!existing) {
      const windowExpiresAt = now + LOGIN_RATE_LIMIT_WINDOW_MS;
      await ctx.db.insert('login_rate_limits', {
        ipHash,
        requestCount: 1,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: LOGIN_MAX_REQUESTS_PER_WINDOW - 1,
        windowExpiresAt,
      };
    }

    if (now - existing.windowStart >= LOGIN_RATE_LIMIT_WINDOW_MS) {
      const windowExpiresAt = now + LOGIN_RATE_LIMIT_WINDOW_MS;
      await ctx.db.patch(existing._id, {
        requestCount: 1,
        windowStart: now,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: LOGIN_MAX_REQUESTS_PER_WINDOW - 1,
        windowExpiresAt,
      };
    }

    if (existing.requestCount >= LOGIN_MAX_REQUESTS_PER_WINDOW) {
      return {
        allowed: false,
        remaining: 0,
        windowExpiresAt: existing.windowStart + LOGIN_RATE_LIMIT_WINDOW_MS,
      };
    }

    await ctx.db.patch(existing._id, {
      requestCount: existing.requestCount + 1,
      updatedAt: now,
    });

    return {
      allowed: true,
      remaining: LOGIN_MAX_REQUESTS_PER_WINDOW - existing.requestCount - 1,
      windowExpiresAt: existing.windowStart + LOGIN_RATE_LIMIT_WINDOW_MS,
    };
  },
});

export const cleanupStaleLoginRateLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile || profile.role !== 'admin') {
      throw new Error('Unauthorized: admin only');
    }

    const now = Date.now();
    const staleThreshold = now - LOGIN_STALE_ENTRY_THRESHOLD_MS;

    const staleEntries = await ctx.db
      .query('login_rate_limits')
      .collect();

    let deletedCount = 0;
    for (const entry of staleEntries) {
      if (entry.windowStart < staleThreshold) {
        await ctx.db.delete(entry._id);
        deletedCount++;
      }
    }

    return { deletedCount };
  },
});