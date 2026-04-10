import { internalQuery, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { assembleCourseOverviewRows } from "../lib/teacher/course-overview";
import { assembleGradebookRows } from "../lib/teacher/gradebook";
import { assembleCompetencyHeatmapRows, assembleStudentCompetencyDetail } from "../lib/teacher/competency-heatmap";
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



interface PracticeSubmissionEvidence {
  contractVersion?: string;
  activityId?: string;
  mode?: string;
  status?: string;
  attemptNumber?: number;
  submittedAt?: string;
  answers?: Record<string, unknown>;
  parts?: Array<Record<string, unknown>>;
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
}

interface SubmissionEvidence {
  kind: 'spreadsheet' | 'practice';
  activityId: string;
  activityTitle: string;
  componentKey: string;
  submittedAt: string;
  spreadsheetData?: unknown;
  submissionData?: PracticeSubmissionEvidence | Record<string, unknown>;
  attemptNumber?: number;
  score?: number | null;
  maxScore?: number | null;
  feedback?: string | null;
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

export const getTeacherCompetencyHeatmapData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const students = await listOrganizationStudents(ctx, teacher.organizationId);
    const rawStandards = (await ctx.db.query("competency_standards").collect())
      .map((standard) => ({
        id: standard._id,
        code: standard.code,
        description: standard.description,
        studentFriendlyDescription: standard.studentFriendlyDescription ?? null,
        category: standard.category ?? null,
        isActive: standard.isActive,
      }));

    if (rawStandards.length === 0 || students.length === 0) {
      return { rows: [], standards: [] };
    }

    const activeStandardIds = new Set(
      rawStandards.filter((s) => s.isActive).map((s) => s.id)
    );

    const rawStudents = students.map((student) => ({
      id: student._id,
      username: student.username,
      displayName: student.displayName ?? null,
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
      .filter((row) => activeStandardIds.has(row.standardId))
      .map((row) => ({
        studentId: row.studentId,
        standardId: row.standardId,
        masteryLevel: row.masteryLevel,
        evidenceActivityId: row.evidenceActivityId ?? null,
        lastUpdated: row.lastUpdated,
        updatedBy: row.updatedBy ?? null,
      }));

    return assembleCompetencyHeatmapRows(rawStudents, rawStandards, competencyRows);
  },
});

export const getTeacherStudentCompetencyDetail = internalQuery({
  args: {
    userId: v.id("profiles"),
    studentId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const teacher = await getAuthorizedTeacher(ctx, args.userId);
    if (!teacher) {
      return null;
    }

    const student = await ctx.db.get(args.studentId);
    if (
      !student ||
      student.role !== "student" ||
      student.organizationId !== teacher.organizationId
    ) {
      return null;
    }

    const rawStandards = (await ctx.db.query("competency_standards").collect())
      .map((standard) => ({
        id: standard._id,
        code: standard.code,
        description: standard.description,
        studentFriendlyDescription: standard.studentFriendlyDescription ?? null,
        category: standard.category ?? null,
        isActive: standard.isActive,
      }));

    const competencyRows = (
      await ctx.db
        .query("student_competency")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .collect()
    )
      .map((row) => ({
        studentId: row.studentId,
        standardId: row.standardId,
        masteryLevel: row.masteryLevel,
        evidenceActivityId: row.evidenceActivityId ?? null,
        lastUpdated: row.lastUpdated,
        updatedBy: row.updatedBy ?? null,
      }));

    const lessonStandards = (await ctx.db.query("lesson_standards").collect())
      .map((ls) => ({
        standardId: ls.standardId,
        lessonVersionId: ls.lessonVersionId,
        isPrimary: ls.isPrimary,
      }));

    const lessonVersions = (await ctx.db.query("lesson_versions").collect())
      .filter((lv) => lv.status === "published")
      .map((lv) => ({
        id: lv._id,
        lessonId: lv.lessonId,
      }));

    const lessons = (await ctx.db.query("lessons").collect())
      .map((lesson) => ({
        id: lesson._id,
        unitNumber: lesson.unitNumber,
        title: lesson.title,
      }));

    const rawStudent = {
      id: student._id,
      username: student.username,
      displayName: student.displayName ?? null,
    };

    return assembleStudentCompetencyDetail(
      rawStudent,
      rawStandards,
      competencyRows,
      lessonStandards,
      lessonVersions,
      lessons,
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
      return assembleGradebookRows([], rawLessons, [], [], [], [], [], [], []);
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
      return assembleGradebookRows([], rawLessons, rawLessonVersions, rawPhaseVersions, rawPrimaryStandards, [], [], [], []);
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

    const lessonIdSet = new Set(rawLessons.map((l) => l.id));
    const allCompletions = (await ctx.db.query("activity_completions").collect())
      .filter((c) => lessonIdSet.has(c.lessonId));

    const rawActivities = allCompletions.map((c) => ({
      id: c.activityId,
      lessonId: c.lessonId,
    }));

    const activityIds = new Set(rawActivities.map((activity) => activity.id));

    const rawActivitySubmissions = (
      await Promise.all(
        students.map((student) =>
          ctx.db
            .query("activity_submissions")
            .withIndex("by_user", (q) => q.eq("userId", student._id))
            .collect(),
        ),
      )
    )
      .flat()
      .filter((submission) => activityIds.has(submission.activityId))
      .map((submission) => ({
        id: submission._id,
        userId: submission.userId,
        activityId: submission.activityId,
        mode: submission.submissionData.mode,
        status: submission.submissionData.status,
        score: submission.score ?? null,
        maxScore: submission.maxScore ?? null,
        gradedAt: submission.gradedAt ?? null,
      }));

    return assembleGradebookRows(
      rawStudents,
      rawLessons,
      rawLessonVersions,
      rawPhaseVersions,
      rawPrimaryStandards,
      progressRows,
      competencyRows,
      rawActivities,
      rawActivitySubmissions,
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
    const evidenceByPhaseNumber = new Map<number, SubmissionEvidence[]>();

    if (completionRows.length > 0) {
      const activityIds = completionRows.map((c) => c.activityId);
      const phaseByActivityId = new Map<string, number>();
      for (const c of completionRows) {
        phaseByActivityId.set(c.activityId, c.phaseNumber);
      }

      const [, spreadsheetAttempts, practiceRows, activityRows] = await Promise.all([
        ctx.db
          .query("student_spreadsheet_responses")
          .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
          .filter((q) => q.or(...activityIds.map((id) => q.eq(q.field("activityId"), id))))
          .collect(),

        ctx.db
          .query("spreadsheet_submission_attempts")
          .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
          .filter((q) => q.or(...activityIds.map((id) => q.eq(q.field("activityId"), id))))
          .order("asc")
          .collect(),

        ctx.db
          .query("activity_submissions")
          .withIndex("by_user", (q) => q.eq("userId", args.studentId))
          .filter((q) => q.or(...activityIds.map((id) => q.eq(q.field("activityId"), id))))
          .collect(),

        Promise.all(
          activityIds.map(async (activityId) => [activityId, await ctx.db.get(activityId)] as const),
        ),
      ]);

      // Group attempts by activity ID
      const attemptsByActivityId = new Map<string, typeof spreadsheetAttempts>();
      for (const attempt of spreadsheetAttempts) {
        const activityId = attempt.activityId;
        const existing = attemptsByActivityId.get(activityId) ?? [];
        existing.push(attempt);
        attemptsByActivityId.set(activityId, existing);
      }

      const activityById = new Map<
        string,
        {
          displayName: string;
          componentKey: string;
        }
      >();
      for (const [activityId, activity] of activityRows) {
        if (!activity) continue;
        activityById.set(String(activityId), {
          displayName: activity.displayName,
          componentKey: activity.componentKey,
        });
      }

      // Process spreadsheet attempts (instead of just latest response)
      for (const [activityId, attempts] of attemptsByActivityId.entries()) {
        const phaseNum = phaseByActivityId.get(activityId);
        if (phaseNum === undefined) continue;

        const activity = activityById.get(activityId);
        
        // Set the latest attempt as the phase's spreadsheet data
        const latestAttempt = attempts[attempts.length - 1];
        if (latestAttempt?.spreadsheetData) {
          spreadsheetByPhaseNumber.set(phaseNum, latestAttempt.spreadsheetData);
        }

        // Add all attempts as evidence
        for (const attempt of attempts) {
          const evidence: SubmissionEvidence & {
            attemptNumber?: number;
            aiFeedback?: unknown;
            teacherScoreOverride?: number | null;
            teacherFeedbackOverride?: string | null;
          } = {
            kind: 'spreadsheet',
            activityId,
            activityTitle: activity?.displayName ?? 'Spreadsheet activity',
            componentKey: activity?.componentKey ?? 'spreadsheet',
            submittedAt: new Date(attempt.submittedAt).toISOString(),
            spreadsheetData: attempt.spreadsheetData,
            attemptNumber: attempt.attemptNumber,
            aiFeedback: attempt.aiFeedback,
            teacherScoreOverride: attempt.teacherScoreOverride,
            teacherFeedbackOverride: attempt.teacherFeedbackOverride,
          };

          const existingEvidence = evidenceByPhaseNumber.get(phaseNum) ?? [];
          existingEvidence.push(evidence);
          evidenceByPhaseNumber.set(phaseNum, existingEvidence);
        }
      }

      const latestPracticeByActivity = new Map<string, (typeof practiceRows)[number]>();
      for (const row of practiceRows) {
        const current = latestPracticeByActivity.get(row.activityId);
        if (!current) {
          latestPracticeByActivity.set(row.activityId, row);
          continue;
        }

        if (
          row.submittedAt > current.submittedAt ||
          (row.submittedAt === current.submittedAt && row.updatedAt >= current.updatedAt)
        ) {
          latestPracticeByActivity.set(row.activityId, row);
        }
      }

      for (const [activityId, row] of latestPracticeByActivity.entries()) {
        const phaseNum = phaseByActivityId.get(activityId);
        if (phaseNum === undefined) {
          continue;
        }

        const activity = activityById.get(activityId);
        const submissionData = row.submissionData as PracticeSubmissionEvidence | Record<string, unknown>;
        const evidence: SubmissionEvidence = {
          kind: 'practice',
          activityId,
          activityTitle: activity?.displayName ?? 'Practice submission',
          componentKey: activity?.componentKey ?? 'practice',
          submittedAt: new Date(row.submittedAt).toISOString(),
          attemptNumber:
            typeof submissionData.attemptNumber === 'number' ? submissionData.attemptNumber : 1,
          score: row.score ?? null,
          maxScore: row.maxScore ?? null,
          feedback: row.feedback ?? null,
          submissionData,
        };

        const existingEvidence = evidenceByPhaseNumber.get(phaseNum) ?? [];
        existingEvidence.push(evidence);
        evidenceByPhaseNumber.set(phaseNum, existingEvidence);
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
          evidence: evidenceByPhaseNumber.get(phase.phaseNumber) ?? [],
        };
      });

    const practiceEnvelopes = [];
    for (const evidenceList of evidenceByPhaseNumber.values()) {
      for (const evidence of evidenceList) {
        if (evidence.kind === 'practice' && evidence.submissionData) {
          const data = evidence.submissionData as Record<string, unknown>;
          if (data.contractVersion === 'practice.v1') {
            practiceEnvelopes.push(data);
          }
        }
      }
    }

    let studentErrorSummary = null;
    if (practiceEnvelopes.length > 0) {
      const { buildDeterministicSummary } = await import(
        "../lib/practice/error-analysis"
      );

      const studentIdMap = new Map<string, string>();
      for (const env of practiceEnvelopes) {
        studentIdMap.set(
          env.activityId as string,
          args.studentId,
        );
      }

      studentErrorSummary = buildDeterministicSummary(
        args.lessonId,
        practiceEnvelopes as never,
        studentIdMap,
      );
    }

    return {
      studentName: args.studentName,
      lessonTitle: lesson.title,
      phases,
      studentErrorSummary,
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

export const getLessonErrorSummary = internalQuery({
  args: {
    lessonId: v.id("lessons"),
    teacherOrgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    const completions = await ctx.db
      .query("activity_completions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .collect();

    if (completions.length === 0) return null;

    const studentIds = [...new Set(completions.map((c) => c.studentId))];

    const orgStudentIds: string[] = [];
    await Promise.all(
      studentIds.map(async (sid) => {
        const profile = await ctx.db.get(sid as Id<"profiles">);
        if (profile && profile.organizationId === args.teacherOrgId) {
          orgStudentIds.push(sid);
        }
      }),
    );

    if (orgStudentIds.length === 0) return null;

    const orgCompletions = completions.filter((c) =>
      orgStudentIds.includes(c.studentId),
    );
    const activityIds = [...new Set(orgCompletions.map((c) => c.activityId))];

    const submissionRows = await ctx.db
      .query("activity_submissions")
      .withIndex("by_activity", (q) =>
        q.eq("activityId", activityIds[0] as Id<"activities">),
      )
      .collect();

    const allSubmissions = await Promise.all(
      activityIds.slice(1).map((activityId) =>
        ctx.db
          .query("activity_submissions")
          .withIndex("by_activity", (q) => q.eq("activityId", activityId))
          .collect(),
      ),
    );

    const flatSubmissions = [...submissionRows, ...allSubmissions.flat()];

    const studentSubmissions = flatSubmissions.filter((row) =>
      orgStudentIds.includes(row.userId),
    );

    if (studentSubmissions.length === 0) return null;

    const latestByStudentAndActivity = new Map<
      string,
      (typeof studentSubmissions)[number]
    >();
    for (const row of studentSubmissions) {
      const key = `${row.userId}:${row.activityId}`;
      const current = latestByStudentAndActivity.get(key);
      if (
        !current ||
        row.submittedAt > current.submittedAt ||
        (row.submittedAt === current.submittedAt &&
          row.updatedAt >= current.updatedAt)
      ) {
        latestByStudentAndActivity.set(key, row);
      }
    }

    const envelopes = [];
    const studentIdMap = new Map<string, string>();

    for (const [key, row] of latestByStudentAndActivity.entries()) {
      const data = row.submissionData as Record<string, unknown>;
      if (data.contractVersion === "practice.v1") {
        envelopes.push(data);
        const [, studentId] = key.split(":");
        studentIdMap.set(data.activityId as string, studentId as string);
      }
    }

    if (envelopes.length === 0) return null;

    const { buildDeterministicSummary } = await import(
      "../lib/practice/error-analysis"
    );

    return buildDeterministicSummary(
      args.lessonId,
      envelopes as never,
      studentIdMap,
    );
  },
});
