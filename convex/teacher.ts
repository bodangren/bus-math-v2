import { internalQuery, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { assembleCourseOverviewRows } from "../lib/teacher/course-overview";
import { assembleGradebookRows } from "../lib/teacher/gradebook";
import {
  buildLatestPublishedLessonVersionMap,
  buildPublishedPhaseIdSet,
  buildPublishedProgressSnapshot,
  buildPublishedUnitProgressRows,
  resolveLatestPublishedLessonVersion,
} from "../lib/progress/published-curriculum";

interface TeacherProgressSnapshot {
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

interface TeacherStudentDetailUnitRow {
  unitNumber: number;
  unitTitle: string;
  lessons: Array<{
    id: string;
    unitNumber: number;
    title: string;
    slug: string;
    description: string | null;
    totalPhases: number;
    completedPhases: number;
    progressPercentage: number;
  }>;
}

interface SpreadsheetSubmission {
  spreadsheetData?: unknown;
}

const DEFAULT_PHASE_NAMES: Record<number, string> = {
  1: 'Hook',
  2: 'Introduction',
  3: 'Guided Practice',
  4: 'Independent Practice',
  5: 'Assessment',
  6: 'Closing',
};

function sortStudentsByName<
  T extends {
    username: string;
    displayName?: string | null;
  },
>(students: T[]): T[] {
  return [...students].sort((a, b) =>
    (a.displayName ?? a.username).localeCompare(b.displayName ?? b.username),
  );
}

async function getAuthorizedTeacher(
  ctx: QueryCtx,
  userId: Id<"profiles">,
): Promise<Doc<"profiles"> | null> {
  const teacher = await ctx.db.get(userId);
  if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
    return null;
  }
  return teacher;
}

async function listOrganizationStudents(
  ctx: QueryCtx,
  organizationId: Id<"organizations">,
) {
  const allProfiles = await ctx.db
    .query("profiles")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .collect();

  return sortStudentsByName(
    allProfiles.filter((profile) => profile.role === "student"),
  );
}

async function getOrganizationName(
  ctx: QueryCtx,
  organizationId: Id<"organizations">,
) {
  const organization = await ctx.db.get(organizationId);
  return organization?.name ?? "Your organization";
}

async function listLatestPublishedLessonVersions(
  ctx: QueryCtx,
  lessonIds?: string[],
) {
  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  return [
    ...buildLatestPublishedLessonVersionMap(lessonVersions, lessonIds).values(),
  ];
}

async function listActivePhaseIds(
  ctx: QueryCtx,
): Promise<Set<Id<"phase_versions">>> {
  const lessonIds = (await ctx.db.query("lessons").collect()).map((lesson) => lesson._id);
  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  const phaseVersions = await ctx.db.query("phase_versions").collect();
  return buildPublishedPhaseIdSet({
    lessonIds,
    lessonVersions,
    phaseVersions,
  }) as Set<Id<"phase_versions">>;
}

async function buildStudentProgressSnapshot(
  ctx: QueryCtx,
  studentId: Id<"profiles">,
  activePhaseIds: Set<Id<"phase_versions">>,
): Promise<TeacherProgressSnapshot> {
  const progressRows = await ctx.db
    .query("student_progress")
    .withIndex("by_user", (q) => q.eq("userId", studentId))
    .collect();

  return buildPublishedProgressSnapshot({
    activePhaseIds,
    progressRows,
  });
}

async function listStudentDetailUnits(
  ctx: QueryCtx,
  studentId: Id<"profiles">,
): Promise<TeacherStudentDetailUnitRow[]> {
  const allLessons = await ctx.db.query("lessons").collect();

  if (allLessons.length === 0) {
    return [];
  }

  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  const phaseVersions = await ctx.db.query("phase_versions").collect();
  const progressRows = await ctx.db
    .query("student_progress")
    .withIndex("by_user", (q) => q.eq("userId", studentId as never))
    .collect();

  return buildPublishedUnitProgressRows({
    lessons: allLessons,
    lessonVersions,
    phaseVersions,
    progressRows,
  }) as TeacherStudentDetailUnitRow[];
}

export const getTeacherDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const organizationName = await getOrganizationName(ctx, teacher.organizationId);
    const students = await listOrganizationStudents(ctx, teacher.organizationId);
    const studentIds = students.map((s) => s._id);
    const activePhaseIds = await listActivePhaseIds(ctx);

    const snapshots = new Map<string, TeacherProgressSnapshot>();
    for (const studentId of studentIds) {
      const current = await buildStudentProgressSnapshot(ctx, studentId, activePhaseIds);
      snapshots.set(studentId, current);
    }

    const studentsWithProgress = students.map((student) => {
      const snapshot = snapshots.get(student._id);
      return {
        id: student._id,
        username: student.username,
        displayName: student.displayName,
        completedPhases: snapshot?.completedPhases ?? 0,
        totalPhases: snapshot?.totalPhases ?? 0,
        progressPercentage: snapshot?.progressPercentage ?? 0,
        lastActive: snapshot?.lastActive ?? null,
      };
    });

    return {
      teacher: {
        username: teacher.username,
        organizationName,
        organizationId: teacher.organizationId,
      },
      students: studentsWithProgress,
    };
  },
});

export const getTeacherCourseOverviewData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const students = await listOrganizationStudents(ctx, teacher.organizationId);
    const rawLessons = (await ctx.db.query("lessons").collect())
      .sort((a, b) => a.unitNumber - b.unitNumber || a.orderIndex - b.orderIndex)
      .map((lesson) => ({
        id: lesson._id,
        unitNumber: lesson.unitNumber,
      }));

    if (rawLessons.length === 0) {
      return { rows: [], units: [] };
    }

    const rawLessonVersions = (await listLatestPublishedLessonVersions(
      ctx,
      rawLessons.map((lesson) => lesson.id),
    )).map((version) => ({
      id: version._id,
      lessonId: version.lessonId,
    }));

    const rawStudents = students.map((student) => ({
      id: student._id,
      username: student.username,
      displayName: student.displayName ?? null,
    }));

    if (rawLessonVersions.length === 0) {
      return assembleCourseOverviewRows(rawStudents, rawLessons, [], [], []);
    }

    const lessonVersionIds = new Set(rawLessonVersions.map((version) => version.id));
    const rawPrimaryStandards = (await ctx.db.query("lesson_standards").collect())
      .filter(
        (standard) =>
          standard.isPrimary && lessonVersionIds.has(standard.lessonVersionId),
      )
      .map((standard) => ({
        lessonVersionId: standard.lessonVersionId,
        standardId: standard.standardId,
        isPrimary: standard.isPrimary,
      }));

    if (rawPrimaryStandards.length === 0) {
      return assembleCourseOverviewRows(rawStudents, rawLessons, rawLessonVersions, [], []);
    }

    const standardIds = new Set(rawPrimaryStandards.map((standard) => standard.standardId));
    const competencyRows = (
      await Promise.all(
        students.map((student) =>
          ctx.db
            .query("student_competency")
            .withIndex("by_student", (q) => q.eq("studentId", student._id))
            .collect(),
        ),
      )
    )
      .flat()
      .filter((row) => standardIds.has(row.standardId))
      .map((row) => ({
        studentId: row.studentId,
        standardId: row.standardId,
        masteryLevel: row.masteryLevel,
      }));

    return assembleCourseOverviewRows(
      rawStudents,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      competencyRows,
    );
  },
});

export const getTeacherGradebookData = internalQuery({
  args: {
    userId: v.id("profiles"),
    unitNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const rawLessons = (await ctx.db.query("lessons").collect())
      .filter((lesson) => lesson.unitNumber === args.unitNumber)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((lesson) => ({
        id: lesson._id,
        title: lesson.title,
        orderIndex: lesson.orderIndex,
        unitNumber: lesson.unitNumber,
      }));

    if (rawLessons.length === 0) {
      return { rows: [], lessons: [] };
    }

    const rawLessonVersions = (await listLatestPublishedLessonVersions(
      ctx,
      rawLessons.map((lesson) => lesson.id),
    )).map((version) => ({
      id: version._id,
      lessonId: version.lessonId,
    }));

    if (rawLessonVersions.length === 0) {
      return assembleGradebookRows([], rawLessons, [], [], [], [], []);
    }

    const lessonVersionIds = new Set(rawLessonVersions.map((version) => version.id));
    const rawPhaseVersions = (await ctx.db.query("phase_versions").collect())
      .filter((phase) => lessonVersionIds.has(phase.lessonVersionId))
      .map((phase) => ({
        id: phase._id,
        lessonVersionId: phase.lessonVersionId,
        phaseNumber: phase.phaseNumber,
      }));

    const rawPrimaryStandards = (await ctx.db.query("lesson_standards").collect())
      .filter(
        (standard) =>
          standard.isPrimary && lessonVersionIds.has(standard.lessonVersionId),
      )
      .map((standard) => ({
        lessonVersionId: standard.lessonVersionId,
        standardId: standard.standardId,
        isPrimary: standard.isPrimary,
      }));

    const students = await listOrganizationStudents(ctx, teacher.organizationId);
    const rawStudents = students.map((student) => ({
      id: student._id,
      username: student.username,
      displayName: student.displayName ?? null,
    }));

    if (students.length === 0) {
      return assembleGradebookRows([], rawLessons, rawLessonVersions, rawPhaseVersions, rawPrimaryStandards, [], []);
    }

    const phaseIds = new Set(rawPhaseVersions.map((phase) => phase.id));
    const standardIds = new Set(rawPrimaryStandards.map((standard) => standard.standardId));

    const progressRows = (
      await Promise.all(
        students.map((student) =>
          ctx.db
            .query("student_progress")
            .withIndex("by_user", (q) => q.eq("userId", student._id))
            .collect(),
        ),
      )
    )
      .flat()
      .filter((row) => phaseIds.has(row.phaseId))
      .map((row) => ({
        userId: row.userId,
        phaseId: row.phaseId,
        status: row.status,
      }));

    const competencyRows = (
      await Promise.all(
        students.map((student) =>
          ctx.db
            .query("student_competency")
            .withIndex("by_student", (q) => q.eq("studentId", student._id))
            .collect(),
        ),
      )
    )
      .flat()
      .filter((row) => standardIds.has(row.standardId))
      .map((row) => ({
        studentId: row.studentId,
        standardId: row.standardId,
        masteryLevel: row.masteryLevel,
      }));

    return assembleGradebookRows(
      rawStudents,
      rawLessons,
      rawLessonVersions,
      rawPhaseVersions,
      rawPrimaryStandards,
      progressRows,
      competencyRows,
    );
  },
});

export const getTeacherStudentDetail = internalQuery({
  args: {
    userId: v.id("profiles"),
    studentId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return { status: "unauthorized" as const };
    }

    const student = await ctx.db.get(args.studentId);
    if (
      !student ||
      student.role !== "student" ||
      student.organizationId !== teacher.organizationId
    ) {
      return { status: "not_found" as const };
    }

    const organizationName = await getOrganizationName(ctx, teacher.organizationId);
    const activePhaseIds = await listActivePhaseIds(ctx);
    const snapshot = await buildStudentProgressSnapshot(ctx, student._id, activePhaseIds);
    const units = await listStudentDetailUnits(ctx, student._id);

    return {
      status: "success" as const,
      organizationName,
      student: {
        id: student._id,
        username: student.username,
        displayName: student.displayName ?? null,
      },
      snapshot,
      units,
    };
  },
});

export const getTeacherLessonMonitoringData = internalQuery({
  args: {
    userId: v.id("profiles"),
    unitNumber: v.number(),
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return { status: "unauthorized" as const };
    }

    const unitLessons = (await ctx.db.query("lessons").collect())
      .filter((lesson) => lesson.unitNumber === args.unitNumber)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    if (unitLessons.length === 0) {
      return { status: "not_found" as const };
    }

    const selectedLesson = unitLessons.find((lesson) => lesson._id === args.lessonId);
    if (!selectedLesson) {
      return { status: "not_found" as const };
    }

    const latestPublishedByLessonId = buildLatestPublishedLessonVersionMap(
      await ctx.db.query("lesson_versions").collect(),
      unitLessons.map((lesson) => lesson._id),
    );
    const selectedVersion = latestPublishedByLessonId.get(selectedLesson._id);

    const phases =
      selectedVersion == null
        ? []
        : await ctx.db
            .query("phase_versions")
            .withIndex("by_lesson_version", (q) =>
              q.eq("lessonVersionId", selectedVersion._id),
            )
            .collect();

    phases.sort((a, b) => a.phaseNumber - b.phaseNumber);

    const phasesWithSections = await Promise.all(
      phases.map(async (phase) => {
        const sections = await ctx.db
          .query("phase_sections")
          .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
          .collect();

        sections.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

        return {
          id: phase._id,
          phaseNumber: phase.phaseNumber,
          title: phase.title ?? null,
          estimatedMinutes: phase.estimatedMinutes ?? null,
          sections: sections.map((section) => ({
            id: section._id,
            sectionType: section.sectionType,
            content: section.content,
          })),
        };
      }),
    );

    return {
      status: "success" as const,
      unitNumber: args.unitNumber,
      lesson: {
        id: selectedLesson._id,
        unitNumber: selectedLesson.unitNumber,
        title: selectedVersion?.title ?? selectedLesson.title,
        slug: selectedLesson.slug,
        description: selectedVersion?.description ?? selectedLesson.description ?? null,
        learningObjectives: selectedLesson.learningObjectives ?? null,
        orderIndex: selectedLesson.orderIndex,
        metadata: selectedLesson.metadata ?? null,
        createdAt: selectedLesson.createdAt,
        updatedAt: selectedLesson.updatedAt,
      },
      phases: phasesWithSections,
      unitLessons: unitLessons.map((lesson) => ({
        id: lesson._id,
        title: latestPublishedByLessonId.get(lesson._id)?.title ?? lesson.title,
        orderIndex: lesson.orderIndex,
      })),
    };
  },
});

export const getSubmissionDetail = internalQuery({
  args: {
    studentId: v.id("profiles"),
    lessonId: v.id("lessons"),
    studentName: v.string(),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    const lessonVersions = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    if (lessonVersions.length === 0) return null;

    const lessonVersion = resolveLatestPublishedLessonVersion(lessonVersions);
    if (!lessonVersion) return null;

    const rawPhases = await ctx.db
      .query("phase_versions")
      .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersion._id))
      .collect();

    if (rawPhases.length === 0) return null;

    const phaseIds = rawPhases.map((p) => p._id);

    const progressRows = await ctx.db
      .query("student_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.studentId))
      .filter((q) => q.or(...phaseIds.map((id) => q.eq(q.field("phaseId"), id))))
      .collect();

    const completionRows = await ctx.db
      .query("activity_completions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("lessonId"), args.lessonId))
      .collect();

    const spreadsheetByPhaseNumber = new Map<number, unknown>();

    if (completionRows.length > 0) {
      const activityIds = completionRows.map((c) => c.activityId);

      const spreadsheetRows = await ctx.db
        .query("student_spreadsheet_responses")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .filter((q) => q.or(...activityIds.map((id) => q.eq(q.field("activityId"), id))))
        .collect();

      const phaseByActivityId = new Map<string, number>();
      for (const c of completionRows) {
        phaseByActivityId.set(c.activityId, c.phaseNumber);
      }

      for (const row of spreadsheetRows) {
        const phaseNum = phaseByActivityId.get(row.activityId);
        const spreadsheetRow = row as SpreadsheetSubmission;
        if (phaseNum !== undefined && spreadsheetRow.spreadsheetData) {
          spreadsheetByPhaseNumber.set(phaseNum, spreadsheetRow.spreadsheetData);
        }
      }
    }

    const progressByPhaseId = new Map<string, (typeof progressRows)[number]>();
    for (const row of progressRows) {
      progressByPhaseId.set(row.phaseId, row);
    }

    const phases = [...rawPhases]
      .sort((a, b) => a.phaseNumber - b.phaseNumber)
      .map((phase) => {
        const progress = progressByPhaseId.get(phase._id);
        const status = progress?.status ?? "not_started";
        const title =
          phase.title?.trim() ||
          DEFAULT_PHASE_NAMES[phase.phaseNumber] ||
          `Phase ${phase.phaseNumber}`;

        return {
          phaseNumber: phase.phaseNumber,
          phaseId: phase._id,
          title,
          status,
          completedAt: progress?.completedAt ?? null,
          spreadsheetData: spreadsheetByPhaseNumber.get(phase.phaseNumber) ?? null,
        };
      });

    return {
      studentName: args.studentName,
      lessonTitle: lesson.title,
      phases,
    };
  },
});

export const getProfileWithOrg = internalQuery({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});
