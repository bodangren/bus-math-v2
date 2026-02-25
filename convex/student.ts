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
