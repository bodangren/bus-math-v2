import { internalQuery, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { assembleCourseOverviewRows } from "../lib/teacher/course-overview";
import { assembleGradebookRows } from "../lib/teacher/gradebook";

interface TeacherProgressSnapshot {
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
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
  userId: string,
) {
  const teacher = await ctx.db.get(userId as never);
  if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
    return null;
  }
  return teacher;
}

async function listOrganizationStudents(
  ctx: QueryCtx,
  organizationId: string,
) {
  const allProfiles = await ctx.db
    .query("profiles")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId as never))
    .collect();

  return sortStudentsByName(
    allProfiles.filter((profile) => profile.role === "student"),
  );
}

async function getOrganizationName(
  ctx: QueryCtx,
  organizationId: string,
) {
  const organization = await ctx.db.get(organizationId as never);
  return organization?.name ?? "Your organization";
}

async function listLatestPublishedLessonVersions(
  ctx: QueryCtx,
  lessonIds?: string[],
) {
  const lessonIdFilter = lessonIds ? new Set(lessonIds) : null;
  const lessonVersions = await ctx.db.query("lesson_versions").collect();
  const publishedVersions = lessonVersions.filter(
    (version) =>
      version.status === "published" &&
      (!lessonIdFilter || lessonIdFilter.has(version.lessonId)),
  );

  const latestByLessonId = new Map<string, (typeof publishedVersions)[number]>();
  for (const version of publishedVersions) {
    const current = latestByLessonId.get(version.lessonId);
    if (!current || version.version > current.version) {
      latestByLessonId.set(version.lessonId, version);
    }
  }

  return [...latestByLessonId.values()];
}

async function listActivePhaseIds(
  ctx: QueryCtx,
) {
  const phaseVersions = await ctx.db.query("phase_versions").collect();
  return new Set(phaseVersions.map((phase) => phase._id));
}

async function buildStudentProgressSnapshot(
  ctx: QueryCtx,
  studentId: string,
  activePhaseIds: Set<string>,
): Promise<TeacherProgressSnapshot> {
  const totalPhases = activePhaseIds.size;
  const progressRows = await ctx.db
    .query("student_progress")
    .withIndex("by_user", (q) => q.eq("userId", studentId as never))
    .collect();

  let completedPhases = 0;
  let lastActive: string | null = null;

  for (const row of progressRows) {
    if (!activePhaseIds.has(row.phaseId)) {
      continue;
    }

    if (row.status === "completed") {
      completedPhases += 1;
    }

    if (row.updatedAt) {
      const currentLastActive = lastActive ? new Date(lastActive).getTime() : 0;
      if (row.updatedAt > currentLastActive) {
        lastActive = new Date(row.updatedAt).toISOString();
      }
    }
  }

  return {
    completedPhases,
    totalPhases,
    progressPercentage:
      totalPhases > 0
        ? Number(((completedPhases / totalPhases) * 100).toFixed(1))
        : 0,
    lastActive,
  };
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

    if (rawLessonVersions.length === 0) {
      return assembleCourseOverviewRows(students, rawLessons, [], [], []);
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
      return assembleCourseOverviewRows(students, rawLessons, rawLessonVersions, [], []);
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
      students,
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
      students,
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

    return {
      status: "success" as const,
      organizationName,
      student: {
        id: student._id,
        username: student.username,
        displayName: student.displayName ?? null,
      },
      snapshot,
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

    const lessonVersion = lessonVersions[0];

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
