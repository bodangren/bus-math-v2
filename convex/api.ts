import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getActivity = query({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    return activity;
  },
});

export const getProfile = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    return profile;
  },
});

export const getProfileByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("_id"), args.authId))
      .collect();
    return profiles[0] ?? null;
  },
});

export const getLessonBySlugOrId = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    let lesson = null;
    try {
      lesson = await ctx.db.get(args.identifier as Id<"lessons">);
    } catch {
      // Not a valid ID, try slug
    }

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.identifier))
        .unique();
    }

    return lesson;
  },
});

export const checkNextPhaseExists = query({
  args: {
    lessonVersionId: v.id("lesson_versions"),
    phaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const nextPhase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", args.lessonVersionId).eq("phaseNumber", args.phaseNumber + 1)
      )
      .unique();
    return !!nextPhase;
  },
});

export const getPhaseContext = query({
  args: {
    lessonId: v.id("lessons"),
    phaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (versions.length === 0) return null;

    versions.sort((a, b) => b.version - a.version);
    const latestVersion = versions[0];

    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();

    if (!phase) return null;

    return {
      phaseId: phase._id,
      lessonVersionId: latestVersion._id,
    };
  },
});

export const getStudentProgressByPhase = query({
  args: {
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", args.phaseId)
      )
      .unique();
    return progress;
  },
});

export const getStudentProgressByIdempotencyKey = query({
  args: {
    userId: v.id("profiles"),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("idempotencyKey"), args.idempotencyKey))
      .first();
    return progress;
  },
});

export const completePhaseMutation = mutation({
  args: {
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
    timeSpent: v.number(),
    idempotencyKey: v.string(),
    linkedStandardId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", args.phaseId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "completed",
        completedAt: now,
        timeSpentSeconds: (existing.timeSpentSeconds ?? 0) + args.timeSpent,
        idempotencyKey: args.idempotencyKey,
        updatedAt: now,
      });
      return { success: true, completedAt: now, existing: true };
    }

    await ctx.db.insert("student_progress", {
      userId: args.userId,
      phaseId: args.phaseId,
      status: "completed",
      startedAt: now - args.timeSpent * 1000,
      completedAt: now,
      timeSpentSeconds: args.timeSpent,
      idempotencyKey: args.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    });

    if (args.linkedStandardId) {
      const standard = await ctx.db
        .query("competency_standards")
        .withIndex("by_code", (q) => q.eq("code", args.linkedStandardId!))
        .unique();

      if (standard) {
        const existingComp = await ctx.db
          .query("student_competency")
          .withIndex("by_student_and_standard", (q) =>
            q.eq("studentId", args.userId).eq("standardId", standard._id)
          )
          .unique();

        if (existingComp) {
          await ctx.db.patch(existingComp._id, {
            masteryLevel: Math.max(existingComp.masteryLevel, 1),
            lastUpdated: now,
          });
        } else {
          await ctx.db.insert("student_competency", {
            studentId: args.userId,
            standardId: standard._id,
            masteryLevel: 1,
            lastUpdated: now,
            createdAt: now,
          });
        }
      }
    }

    return { success: true, completedAt: now, existing: false };
  },
});

export const getLessonWithContent = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!lesson) return null;

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    if (versions.length === 0) return { lesson, phases: [] };

    versions.sort((a, b) => b.version - a.version);
    const latestVersion = versions[0];

    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();

    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    const phasesWithSections = await Promise.all(
      phases.map(async (phase) => {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .collect();
        sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        return { ...phase, sections };
      }),
    );

    return {
      lesson: {
        ...lesson,
        title: latestVersion.title ?? lesson.title,
        description: latestVersion.description ?? lesson.description,
      },
      phases: phasesWithSections,
    };
  },
});

export const getFirstLessonSlug = query({
  args: {},
  handler: async (ctx) => {
    const allLessons = await ctx.db.query("lessons").collect();
    if (allLessons.length === 0) return null;
    allLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });
    return allLessons[0].slug;
  },
});

export const canAccessPhase = query({
  args: {
    userId: v.id("profiles"),
    lessonId: v.id("lessons"),
    phaseNumber: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.phaseNumber === 1) return true;

    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (versions.length === 0) return false;

    versions.sort((a, b) => b.version - a.version);
    const latestVersion = versions[0];

    const prevPhase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) =>
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber - 1)
      )
      .unique();

    if (!prevPhase) return false;

    const progress = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) =>
        q.eq("userId", args.userId).eq("phaseId", prevPhase._id)
      )
      .unique();

    return progress?.status === "completed";
  },
});
