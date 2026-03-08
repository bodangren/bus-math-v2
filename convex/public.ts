import { query } from "./_generated/server";

interface PublicUnitSummary {
  unitNumber: number;
  title: string;
  summary: string;
}

interface PublicCurriculumLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

interface PublicCurriculumUnit {
  unitNumber: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: PublicCurriculumLesson[];
}

export const getCurriculumStats = query({
  args: {},
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    const activities = await ctx.db.query("activities").collect();

    const uniqueUnits = new Set(lessons.map((l) => l.unitNumber));

    return {
      unitCount: uniqueUnits.size,
      lessonCount: lessons.length,
      activityCount: activities.length,
    };
  },
});

export const getUnits = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all lessons where orderIndex is 1
    const lessons = await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("orderIndex"), 1))
      .collect();

    // Sort by unit number ascending
    lessons.sort((a, b) => a.unitNumber - b.unitNumber);

    // Map _id to id so the frontend doesn't need to change its React keys
    return lessons.map((l) => ({
      ...l,
      id: l._id,
      unit_number: l.unitNumber,
      order_index: l.orderIndex,
    }));
  },
});

export const getUnitSummaries = query({
  args: {},
  handler: async (ctx) => {
    const allLessons = await ctx.db.query("lessons").collect();

    // Sort by unitNumber ascending, orderIndex ascending
    allLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    const units = new Map<number, PublicUnitSummary>();

    for (const lesson of allLessons) {
      if (!units.has(lesson.unitNumber)) {
        // Fetch latest version
        const versions = await ctx.db
          .query("lesson_versions")
          .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
          .collect();

        versions.sort((a, b) => b.version - a.version);
        const latestVersion = versions.length > 0 ? versions[0] : null;

        const rawTitle =
          lesson.metadata?.unitContent?.introduction?.unitTitle ??
          lesson.metadata?.unitContent?.introduction?.unitNumber ??
          null;

        const effectiveTitle = latestVersion?.title ?? rawTitle ?? `Unit ${lesson.unitNumber}`;
        const effectiveSummary =
          lesson.metadata?.unitContent?.drivingQuestion?.question ??
          lesson.metadata?.unitContent?.introduction?.projectOverview?.scenario ??
          latestVersion?.description ??
          lesson.description ??
          'Explore authentic business scenarios with spreadsheet-first problem solving.';

        units.set(lesson.unitNumber, {
          unitNumber: lesson.unitNumber,
          title: effectiveTitle,
          summary: effectiveSummary,
        });
      }
    }

    return Array.from(units.values()).slice(0, 8);
  },
});

export const getCurriculum = query({
  args: {},
  handler: async (ctx) => {
    const lessonRows = await ctx.db.query("lessons").collect();
    
    lessonRows.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    const units = new Map<number, PublicCurriculumUnit>();

    for (const lesson of lessonRows) {
      const versions = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
        .collect();

      versions.sort((a, b) => b.version - a.version);
      const latestVersion = versions.length > 0 ? versions[0] : null;

      const effectiveTitle = latestVersion?.title ?? lesson.title;
      const effectiveDescription = latestVersion?.description ?? lesson.description;

      if (!units.has(lesson.unitNumber)) {
        const rawTitle =
          lesson.metadata?.unitContent?.introduction?.unitTitle ??
          lesson.metadata?.unitContent?.introduction?.unitNumber ??
          null;

        const unitTitle = rawTitle ?? `Unit ${lesson.unitNumber}`;
        const unitDesc =
          lesson.metadata?.unitContent?.drivingQuestion?.question ??
          lesson.metadata?.unitContent?.introduction?.projectOverview?.scenario ??
          effectiveDescription ??
          "Explore core accounting and Excel skills through real classroom projects.";

        const objectives = 
          lesson.metadata?.unitContent?.objectives?.content ?? 
          lesson.learningObjectives ?? 
          [];

        units.set(lesson.unitNumber, {
          unitNumber: lesson.unitNumber,
          title: unitTitle,
          description: unitDesc,
          objectives,
          lessons: [],
        });
      }

      units.get(lesson.unitNumber)?.lessons.push({
        id: lesson._id,
        title: effectiveTitle,
        slug: lesson.slug,
        description: effectiveDescription,
        orderIndex: lesson.orderIndex,
      });
    }

    return Array.from(units.values());
  },
});
