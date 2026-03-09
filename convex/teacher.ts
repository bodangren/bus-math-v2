import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getOrCreateMapEntry } from "./dashboardHelpers";

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

export const getTeacherDashboardData = internalQuery({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    // 1. Get teacher profile
    const teacher = await ctx.db.get(args.userId);
    if (!teacher || (teacher.role !== "teacher" && teacher.role !== "admin")) {
      return null; // Return null if not authorized
    }

    // 2. Get organization name
    const organization = await ctx.db.get(teacher.organizationId);
    const organizationName = organization?.name ?? "Your organization";

    // 3. Get students in organization
    const allProfiles = await ctx.db
      .query("profiles")
      .withIndex("by_organization", (q) => q.eq("organizationId", teacher.organizationId))
      .collect();
      
    const students = allProfiles
      .filter((p) => p.role === "student")
      .sort((a, b) => a.username.localeCompare(b.username));

    const studentIds = students.map((s) => s._id);

    // 4. Get active phases
    const phaseVersions = await ctx.db.query("phase_versions").collect();
    const activePhaseIds = new Set(phaseVersions.map((p) => p._id));
    const totalPhases = activePhaseIds.size;

    // 5. Get student progress snapshots
    const snapshots = new Map<string, TeacherProgressSnapshot>();
    for (const studentId of studentIds) {
      const current = getOrCreateMapEntry(snapshots, studentId, () => ({
        completedPhases: 0,
        totalPhases,
        progressPercentage: 0,
        lastActive: null,
      }));

      const progressRows = await ctx.db
        .query("student_progress")
        .withIndex("by_user", (q) => q.eq("userId", studentId))
        .collect();

      for (const row of progressRows) {
        if (!activePhaseIds.has(row.phaseId)) continue;
        
        if (row.status === "completed") {
          current.completedPhases += 1;
        }

        if (row.updatedAt) {
          const currentLastActive = current.lastActive ? new Date(current.lastActive).getTime() : 0;
          if (row.updatedAt > currentLastActive) {
            current.lastActive = new Date(row.updatedAt).toISOString();
          }
        }
      }

      current.progressPercentage =
        current.totalPhases > 0
          ? Number(((current.completedPhases / current.totalPhases) * 100).toFixed(1))
          : 0;
    }

    // Combine students with their progress
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
