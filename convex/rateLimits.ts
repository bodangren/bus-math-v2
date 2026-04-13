import { mutation, query } from "./_generated/server";

const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;
const STALE_ENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const getRateLimitStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const rateLimit = await ctx.db
      .query("chatbot_rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .unique();

    if (!rateLimit) {
      return {
        remaining: MAX_REQUESTS_PER_WINDOW,
        windowExpiresAt: Date.now() + RATE_LIMIT_WINDOW_MS,
        isLimited: false,
      };
    }

    const now = Date.now();
    if (now - rateLimit.windowStart >= RATE_LIMIT_WINDOW_MS) {
      return {
        remaining: MAX_REQUESTS_PER_WINDOW,
        windowExpiresAt: now + RATE_LIMIT_WINDOW_MS,
        isLimited: false,
      };
    }

    return {
      remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - rateLimit.requestCount),
      windowExpiresAt: rateLimit.windowStart + RATE_LIMIT_WINDOW_MS,
      isLimited: rateLimit.requestCount >= MAX_REQUESTS_PER_WINDOW,
    };
  },
});

export const checkAndIncrementRateLimit = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const now = Date.now();

    const existing = await ctx.db
      .query("chatbot_rate_limits")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .unique();

    if (!existing) {
      await ctx.db.insert("chatbot_rate_limits", {
        userId: profile._id,
        requestCount: 1,
        windowStart: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - 1,
        windowExpiresAt: now + RATE_LIMIT_WINDOW_MS,
      };
    }

    if (now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
      await ctx.db.patch(existing._id, {
        requestCount: 1,
        windowStart: now,
        updatedAt: now,
      });
      return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - 1,
        windowExpiresAt: now + RATE_LIMIT_WINDOW_MS,
      };
    }

    if (existing.requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return {
        allowed: false,
        remaining: 0,
        windowExpiresAt: existing.windowStart + RATE_LIMIT_WINDOW_MS,
      };
    }

    await ctx.db.patch(existing._id, {
      requestCount: existing.requestCount + 1,
      updatedAt: now,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - existing.requestCount - 1,
      windowExpiresAt: existing.windowStart + RATE_LIMIT_WINDOW_MS,
    };
  },
});

export const cleanupStaleRateLimits = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile || profile.role !== "admin") {
      throw new Error("Unauthorized: admin only");
    }

    const now = Date.now();
    const staleThreshold = now - STALE_ENTRY_THRESHOLD_MS;

    const staleEntries = await ctx.db
      .query("chatbot_rate_limits")
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