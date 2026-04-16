import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import {
  computeClassHealth,
  computeFamilyPerformance,
  computeStrugglingStudents,
  formatFamilyDisplayName,
} from '../lib/srs/teacher-analytics';
import { createNewCard } from '../lib/srs/scheduler';

async function verifyStudentIdentity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: { db: { query: (table: 'profiles') => any } },
  identity: { email?: string | null },
  studentId: Id<'profiles'>
): Promise<void> {
  const profile = await ctx.db
    .query('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex('by_username', (q: any) => q.eq('username', identity.email!))
    .unique();
  if (!profile || profile._id !== studentId) {
    throw new Error('Unauthorized: studentId does not match authenticated user');
  }
}

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

    await verifyStudentIdentity(ctx, identity, args.studentId);

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

    await verifyStudentIdentity(ctx, identity, args.studentId);

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

async function getAuthorizedTeacher(
  ctx: { db: { get: (id: Id<'profiles'>) => Promise<Doc<'profiles'> | null> } },
  userId: Id<'profiles'>
): Promise<Doc<'profiles'> | null> {
  const profile = await ctx.db.get(userId);
  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    return null;
  }
  return profile;
}

export const getClassSrsHealth = query({
  args: {
    classId: v.id('classes'),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new Error('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new Error('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new Error('Class not found');
    if (cls.teacherId !== teacher._id) throw new Error('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const students: Doc<'profiles'>[] = [];
    for (const studentId of activeStudentIds) {
      const student = await ctx.db.get(studentId);
      if (student) students.push(student);
    }

    const cards: Doc<'srs_cards'>[] = [];
    for (const studentId of activeStudentIds) {
      const studentCards = await ctx.db
        .query('srs_cards')
        .withIndex('by_student', (q) => q.eq('studentId', studentId))
        .collect();
      cards.push(...studentCards);
    }

    const now = args.now ?? Date.now();
    const startOfDay = new Date(now).setHours(0, 0, 0, 0);
    const endOfDay = new Date(now).setHours(23, 59, 59, 999);

    const health = computeClassHealth(students, cards, now, startOfDay, endOfDay);

    return {
      ...health,
      classId: args.classId,
    };
  },
});

export const getWeakFamilies = query({
  args: {
    classId: v.id('classes'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new Error('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new Error('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new Error('Class not found');
    if (cls.teacherId !== teacher._id) throw new Error('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const reviews: Doc<'srs_review_log'>[] = [];
    for (const studentId of activeStudentIds) {
      const studentReviews = await ctx.db
        .query('srs_review_log')
        .withIndex('by_student', (q) => q.eq('studentId', studentId))
        .collect();
      reviews.push(...studentReviews);
    }

    const performance = computeFamilyPerformance(reviews);

    return performance.map((p) => ({
      ...p,
      displayName: formatFamilyDisplayName(p.problemFamilyId),
    }));
  },
});

export const getStrugglingStudents = query({
  args: {
    classId: v.id('classes'),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new Error('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new Error('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new Error('Class not found');
    if (cls.teacherId !== teacher._id) throw new Error('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const students: Doc<'profiles'>[] = [];
    for (const studentId of activeStudentIds) {
      const student = await ctx.db.get(studentId);
      if (student) students.push(student);
    }

    const cards: Doc<'srs_cards'>[] = [];
    const reviews: Doc<'srs_review_log'>[] = [];
    for (const studentId of activeStudentIds) {
      const [studentCards, studentReviews] = await Promise.all([
        ctx.db.query('srs_cards').withIndex('by_student', (q) => q.eq('studentId', studentId)).collect(),
        ctx.db.query('srs_review_log').withIndex('by_student', (q) => q.eq('studentId', studentId)).collect(),
      ]);
      cards.push(...studentCards);
      reviews.push(...studentReviews);
    }

    const now = args.now ?? Date.now();
    const metrics = computeStrugglingStudents(students, cards, reviews, now);

    return {
      classId: args.classId,
      students: metrics,
    };
  },
});

export const resetStudentCard = mutation({
  args: {
    studentId: v.id('profiles'),
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new Error('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new Error('Unauthorized');

    // Verify student is in a class taught by this teacher
    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_student', (q) => q.eq('studentId', args.studentId))
      .collect();

    // Need to check synchronously since find with async doesn't work well
    let isAuthorizedStudent = false;
    for (const enrollment of enrollments) {
      if (enrollment.status !== 'active') continue;
      const cls = await ctx.db.get(enrollment.classId);
      if (cls && cls.teacherId === teacher._id) {
        isAuthorizedStudent = true;
        break;
      }
    }

    if (!isAuthorizedStudent) throw new Error('Unauthorized');

    const existing = await ctx.db
      .query('srs_cards')
      .withIndex('by_student_family', (q) =>
        q.eq('studentId', args.studentId).eq('problemFamilyId', args.problemFamilyId)
      )
      .unique();

    const newCardState = createNewCard(args.problemFamilyId, args.studentId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        card: newCardState.card,
        due: newCardState.due,
        lastReview: newCardState.lastReview,
        reviewCount: newCardState.reviewCount,
      });
    } else {
      await ctx.db.insert('srs_cards', {
        studentId: args.studentId,
        problemFamilyId: args.problemFamilyId,
        card: newCardState.card,
        due: newCardState.due,
        lastReview: newCardState.lastReview,
        reviewCount: newCardState.reviewCount,
        createdAt: Date.now(),
      });
    }

    // Find class for logging
    let classId: Id<'classes'> | null = null;
    for (const enrollment of enrollments) {
      if (enrollment.status !== 'active') continue;
      const cls = await ctx.db.get(enrollment.classId);
      if (cls && cls.teacherId === teacher._id) {
        classId = enrollment.classId;
        break;
      }
    }

    if (!classId) throw new Error('No valid class found for intervention');

    await ctx.db.insert('srs_interventions', {
      teacherId: teacher._id,
      studentId: args.studentId,
      classId,
      problemFamilyId: args.problemFamilyId,
      interventionType: 'reset_card',
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const bumpFamilyPriority = mutation({
  args: {
    classId: v.id('classes'),
    problemFamilyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', identity.email!))
      .unique();
    if (!profile) throw new Error('Profile not found');

    const teacher = await getAuthorizedTeacher(ctx, profile._id);
    if (!teacher) throw new Error('Unauthorized');

    const cls = await ctx.db.get(args.classId);
    if (!cls) throw new Error('Class not found');
    if (cls.teacherId !== teacher._id) throw new Error('Unauthorized');

    const enrollments = await ctx.db
      .query('class_enrollments')
      .withIndex('by_class', (q) => q.eq('classId', args.classId))
      .collect();

    const activeStudentIds = enrollments
      .filter((e) => e.status === 'active')
      .map((e) => e.studentId);

    const now = Date.now();
    let affectedCount = 0;

    for (const studentId of activeStudentIds) {
      const card = await ctx.db
        .query('srs_cards')
        .withIndex('by_student_family', (q) =>
          q.eq('studentId', studentId).eq('problemFamilyId', args.problemFamilyId)
        )
        .unique();

      if (card) {
        await ctx.db.patch(card._id, { due: now });
        affectedCount++;
      }
    }

    await ctx.db.insert('srs_interventions', {
      teacherId: teacher._id,
      classId: args.classId,
      problemFamilyId: args.problemFamilyId,
      interventionType: 'bump_priority',
      createdAt: now,
    });

    return { success: true, affectedCount };
  },
});