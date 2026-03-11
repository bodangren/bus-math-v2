import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { coerceNullableString } from "./dashboardHelpers";
import {
  buildLessonPhaseProgress,
  buildPublishedUnitProgressRows,
  resolveLatestPublishedLessonVersion,
} from "../lib/progress/published-curriculum";

export const getDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    // 1. Fetch all lessons
    const allLessons = await ctx.db.query("lessons").collect();
    // Sort lessons by unitNumber then orderIndex
    allLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    if (allLessons.length === 0) return [];

    const lessonVersions = await ctx.db.query("lesson_versions").collect();
    const phaseVersions = await ctx.db.query("phase_versions").collect();
    const userProgress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return buildPublishedUnitProgressRows({
      lessons: allLessons.map((lesson) => ({
        ...lesson,
        description: coerceNullableString(lesson.description),
      })),
      lessonVersions,
      phaseVersions,
      progressRows: userProgress,
    });
  },
});

export const getLessonProgress = internalQuery({
  args: { 
    userId: v.id("profiles"),
    lessonIdentifier: v.string() // slug or id
  },
  handler: async (ctx, args) => {
    // 1. Find lesson by slug or id
    let lesson = null;
    try {
      // Try as ID first
      lesson = await ctx.db.get(args.lessonIdentifier as Id<"lessons">);
    } catch {
      // Ignore if not a valid ID format
    }

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonIdentifier))
        .unique();
    }

    if (!lesson) return null;

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();

    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) return { phases: [] };

    // 3. Get phases for this version
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();
    
    // 4. Get student progress
    const userProgress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      phases: buildLessonPhaseProgress({
        phases,
        progressRows: userProgress,
      }),
    };
  }
});

export const completePhase = internalMutation({
  args: {
    userId: v.id("profiles"),
    lessonId: v.string(), // slug or id
    phaseNumber: v.number(),
    timeSpent: v.number(),
    idempotencyKey: v.string(),
    linkedStandardId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Find lesson
    let lesson = null;
    try {
      lesson = await ctx.db.get(args.lessonId as Id<"lessons">);
    } catch {}

    if (!lesson) {
      lesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", args.lessonId))
        .unique();
    }
    if (!lesson) throw new Error("Lesson not found");

    // 2. Get latest published version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    const latestVersion = resolveLatestPublishedLessonVersion(versions);
    if (!latestVersion) throw new Error("Published lesson version not found");

    // 3. Find specific phase
    const phase = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version_and_phase", (q) => 
        q.eq("lessonVersionId", latestVersion._id).eq("phaseNumber", args.phaseNumber)
      )
      .unique();
    if (!phase) throw new Error("Phase not found");

    // 4. Check idempotency
    const existing = await ctx.db
      .query("student_progress")
      .withIndex("by_user_and_phase", (q) => 
        q.eq("userId", args.userId).eq("phaseId", phase._id)
      )
      .unique();

    if (existing?.status === "completed") {
      return { success: true, alreadyCompleted: true };
    }

    const now = Date.now();

    // 5. Update or create progress
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "completed",
        completedAt: now,
        timeSpentSeconds: (existing.timeSpentSeconds ?? 0) + args.timeSpent,
        idempotencyKey: args.idempotencyKey,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("student_progress", {
        userId: args.userId,
        phaseId: phase._id,
        status: "completed",
        startedAt: now - (args.timeSpent * 1000),
        completedAt: now,
        timeSpentSeconds: args.timeSpent,
        idempotencyKey: args.idempotencyKey,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 6. Handle competency if linkedStandardId provided
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
            masteryLevel: Math.max(existingComp.masteryLevel, 1), // Basic completion = level 1
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

    return { 
      success: true, 
      nextPhaseUnlocked: true // Simplified for now
    };
  }
});
