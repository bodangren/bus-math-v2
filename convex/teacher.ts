import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTeacherDashboardData = query({
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
    const snapshots = new Map<string, any>();
    for (const studentId of studentIds) {
      snapshots.set(studentId, {
        completedPhases: 0,
        totalPhases,
        progressPercentage: 0,
        lastActive: null,
      });

      const progressRows = await ctx.db
        .query("student_progress")
        .withIndex("by_user", (q) => q.eq("userId", studentId))
        .collect();

      const current = snapshots.get(studentId);
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
