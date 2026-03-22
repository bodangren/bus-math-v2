import { query } from "./_generated/server";
import { coerceNullableString, getOrCreateMapEntry } from "./dashboardHelpers";
import { resolveLatestPublishedLessonVersion } from "../lib/progress/published-curriculum";

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

interface CapstoneUnitData {
  unitNumber: number;
  title: string;
  drivingQuestion: string | null;
  scenario: string | null;
  deliverable: string | null;
  accountingFocus: string | null;
  excelFocus: string | null;
  audience: string | null;
}

function isCapstoneLesson(lesson: { metadata?: { tags?: string[] | null } | null }) {
  return Boolean(lesson.metadata?.tags?.includes("capstone"));
}

export const getCurriculumStats = query({
  args: {},
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    const activities = await ctx.db.query("activities").collect();

    const instructionalLessons = lessons.filter((lesson) => !isCapstoneLesson(lesson));
    const uniqueUnits = new Set(instructionalLessons.map((lesson) => lesson.unitNumber));

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

    const instructionalLessons = lessons.filter((lesson) => !isCapstoneLesson(lesson));

    // Sort by unit number ascending
    instructionalLessons.sort((a, b) => a.unitNumber - b.unitNumber);

    // Map _id to id so the frontend doesn't need to change its React keys
    return instructionalLessons.map((l) => ({
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

        const latestVersion = resolveLatestPublishedLessonVersion(versions);

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

      const latestVersion = resolveLatestPublishedLessonVersion(versions);

      const effectiveTitle = latestVersion?.title ?? lesson.title;
      const effectiveDescription = coerceNullableString(
        latestVersion?.description ?? lesson.description,
      );

      const unit = getOrCreateMapEntry(units, lesson.unitNumber, () => {
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

        return {
          unitNumber: lesson.unitNumber,
          title: unitTitle,
          description: unitDesc,
          objectives,
          lessons: [],
        };
      });

      unit.lessons.push({
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

/**
 * Returns all unit-level data needed by the capstone overview page:
 * - 8 instructional units with title, driving question, scenario, deliverable,
 *   accounting/Excel focus, and audience
 * - The capstone lesson's own driving question, scenario, and deliverable
 */
export const getCapstonePageData = query({
  args: {},
  handler: async (ctx) => {
    const allLessons = await ctx.db.query("lessons").collect();

    allLessons.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    const units = new Map<number, CapstoneUnitData>();

    for (const lesson of allLessons) {
      if (units.has(lesson.unitNumber)) continue;

      const intro = lesson.metadata?.unitContent?.introduction;
      const dq = lesson.metadata?.unitContent?.drivingQuestion;
      const obj = lesson.metadata?.unitContent?.objectives;

      const isCapstone = isCapstoneLesson(lesson);

      const title =
        intro?.unitTitle ??
        (isCapstone ? lesson.title : `Unit ${lesson.unitNumber}`);

      units.set(lesson.unitNumber, {
        unitNumber: lesson.unitNumber,
        title,
        drivingQuestion: dq?.question ?? null,
        scenario: dq?.scenario ?? intro?.projectOverview?.scenario ?? null,
        deliverable: obj?.deliverables?.[0] ?? intro?.projectOverview?.deliverable ?? null,
        accountingFocus: intro?.accountingFocus ?? null,
        excelFocus: intro?.excelFocus ?? null,
        audience: intro?.audience ?? null,
      });
    }

    const sorted = Array.from(units.values()).sort(
      (a, b) => a.unitNumber - b.unitNumber,
    );

    return {
      instructionalUnits: sorted.filter((u) => u.unitNumber <= 8),
      capstone: sorted.find((u) => u.unitNumber === 9) ?? null,
    };
  },
});

