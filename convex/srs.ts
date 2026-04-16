import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';

export const upsertSrsCard = mutation({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
    card: v.any(),
    due: v.number(),
    lastReview: v.number(),
    reviewCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const existing = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        card: args.card,
        due: args.due,
        lastReview: args.lastReview,
        reviewCount: args.reviewCount,
      });
      return existing._id;
    } else {
      const now = Date.now();
      return await ctx.db.insert('srs_cards', {
        studentId: args.studentId,
        problemFamilyId: args.problemFamilyId,
        card: args.card,
        due: args.due,
        lastReview: args.lastReview,
        reviewCount: args.reviewCount,
        createdAt: now,
      });
    }
  },
});

export const recordSrsReview = mutation({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
    rating: v.string(),
    scheduledAt: v.number(),
    reviewedAt: v.number(),
    elapsedDays: v.number(),
    scheduledDays: v.number(),
    reviewDurationMs: v.optional(v.number()),
    timingConfidence: v.optional(v.string()),
    card: v.any(),
    due: v.number(),
    lastReview: v.number(),
    reviewCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    await ctx.db.insert('srs_review_log', {
      studentId: args.studentId,
      problemFamilyId: args.problemFamilyId,
      rating: args.rating,
      scheduledAt: args.scheduledAt,
      reviewedAt: args.reviewedAt,
      elapsedDays: args.elapsedDays,
      scheduledDays: args.scheduledDays,
      reviewDurationMs: args.reviewDurationMs,
      timingConfidence: args.timingConfidence,
    });

    const existing = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        card: args.card,
        due: args.due,
        lastReview: args.lastReview,
        reviewCount: args.reviewCount,
      });
    } else {
      await ctx.db.insert('srs_cards', {
        studentId: args.studentId,
        problemFamilyId: args.problemFamilyId,
        card: args.card,
        due: args.due,
        lastReview: args.lastReview,
        reviewCount: args.reviewCount,
        createdAt: Date.now(),
      });
    }
  },
});

export const getDueCards = query({
  args: {
    studentId: v.id('profiles'),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const cutoff = args.now ?? Date.now();
    const cards: Doc<'srs_cards'>[] = [];

    for await (const card of ctx.db.query('srs_cards').withIndex('by_student', (q) => q.eq('studentId', args.studentId))) {
      if (card.due <= cutoff) {
        cards.push(card);
      }
    }

    return cards.sort((a, b) => a.due - b.due);
  },
});

export const getStudentSrsSummary = query({
  args: {
    studentId: v.id('profiles'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const now = Date.now();
    let totalCards = 0;
    let dueCount = 0;
    const byFamily: Record<string, { total: number; due: number }> = {};

    for await (const card of ctx.db.query('srs_cards').withIndex('by_student', (q) => q.eq('studentId', args.studentId))) {
      totalCards++;
      if (card.due <= now) dueCount++;
      const family = card.problemFamilyId;
      if (!byFamily[family]) byFamily[family] = { total: 0, due: 0 };
      byFamily[family].total++;
      if (card.due <= now) byFamily[family].due++;
    }

    return { totalCards, dueCount, byFamily };
  },
});

export const getSrsCard = query({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    return await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();
  },
});