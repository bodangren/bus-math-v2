import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardData = query({
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

    const lessonIds = allLessons.map((l) => l._id);

    // 2. Fetch student progress
    const userProgress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
      
    const completedPhaseIds = new Set(userProgress.map((entry) => entry.phaseId));

    // 3. Fetch latest version for each lesson
    const latestVersionByLessonId = new Map<string, any>();
    for (const lessonId of lessonIds) {
      // Find all versions for this lesson
      const versions = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .collect();
        
      if (versions.length > 0) {
        // Sort descending by version number
        versions.sort((a, b) => b.version - a.version);
        latestVersionByLessonId.set(lessonId, versions[0]);
      }
    }

    // 4. Fetch phase versions for the latest lesson versions
    const versionedPhaseIdsByLessonId = new Map<string, string[]>();
    for (const [lessonId, version] of latestVersionByLessonId.entries()) {
      const phases = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", version._id))
        .collect();
        
      versionedPhaseIdsByLessonId.set(lessonId, phases.map((p) => p._id));
    }

    // 5. Assemble the final data structure
    const unitsMap = new Map<number, any>();
    for (const lesson of allLessons) {
      const versionedInfo = latestVersionByLessonId.get(lesson._id);
      const effectiveTitle = versionedInfo?.title ?? lesson.title;
      const effectiveDesc = versionedInfo?.description ?? lesson.description;

      const phaseIds = versionedPhaseIdsByLessonId.get(lesson._id) ?? [];
      const totalPhases = phaseIds.length;
      const completedPhases = phaseIds.filter((id) => completedPhaseIds.has(id)).length;
      const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

      if (!unitsMap.has(lesson.unitNumber)) {
        unitsMap.set(lesson.unitNumber, {
          unitNumber: lesson.unitNumber,
          unitTitle: lesson.metadata?.unitContent?.introduction?.unitTitle ?? `Unit ${lesson.unitNumber}`,
          lessons: [],
        });
      }

      unitsMap.get(lesson.unitNumber).lessons.push({
        id: lesson._id,
        unitNumber: lesson.unitNumber,
        title: effectiveTitle,
        slug: lesson.slug,
        description: effectiveDesc,
        totalPhases,
        completedPhases,
        progressPercentage,
      });
    }

    return Array.from(unitsMap.values()).sort((a, b) => a.unitNumber - b.unitNumber);
  },
});

export const getLessonProgress = query({
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
    
    versions.sort((a, b) => b.version - a.version);
    const latestVersion = versions[0];
    if (!latestVersion) return { phases: [] };

    // 3. Get phases for this version
    const phases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", latestVersion._id))
      .collect();
    
    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    // 4. Get student progress
    const userProgress = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const progressByPhaseId = new Map(userProgress.map(p => [p.phaseId, p]));

    // 5. Calculate statuses
    const phaseProgress = [];
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const progress = progressByPhaseId.get(phase._id);
      
      let status: "completed" | "current" | "available" | "locked" = "locked";
      
      if (progress?.status === "completed") {
        status = "completed";
      } else if (progress?.status === "in_progress") {
        status = "current";
      } else if (i === 0) {
        status = "available";
      } else {
        const prevPhaseId = phases[i-1]._id;
        const prevProgress = progressByPhaseId.get(prevPhaseId);
        if (prevProgress?.status === "completed") {
          status = "available";
        }
      }

      phaseProgress.push({
        phaseNumber: phase.phaseNumber,
        phaseId: phase._id,
        status,
        startedAt: progress?.startedAt ? new Date(progress.startedAt).toISOString() : null,
        completedAt: progress?.completedAt ? new Date(progress.completedAt).toISOString() : null,
        timeSpentSeconds: progress?.timeSpentSeconds ?? null,
      });
    }

    return { phases: phaseProgress };
  }
});

export const completePhase = mutation({
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

    // 2. Get latest version
    const versions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
      .collect();
    versions.sort((a, b) => b.version - a.version);
    const latestVersion = versions[0];
    if (!latestVersion) throw new Error("Lesson version not found");

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
