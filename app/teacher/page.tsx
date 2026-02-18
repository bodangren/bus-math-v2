import { redirect } from "next/navigation";
import { and, asc, inArray, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { organizations, phaseVersions, profiles, studentProgress } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  TeacherDashboardContent,
  type StudentDashboardRow,
} from "@/components/teacher/TeacherDashboardContent";
import { fetchCourseOverviewData } from "@/lib/teacher/course-overview-data";

async function getTeacherProfile(userId: string) {
  const [teacher] = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      role: profiles.role,
      organizationId: profiles.organizationId,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return teacher ?? null;
}

async function getOrganizationName(orgId: string) {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return organization?.name ?? "Your organization";
}

async function getStudentsInOrganization(orgId: string) {
  return db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(profiles)
    .where(and(eq(profiles.organizationId, orgId), eq(profiles.role, "student")))
    .orderBy(asc(profiles.username));
}

interface StudentProgressSnapshot {
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  lastActive: string | null;
}

export async function getStudentProgressSnapshots(studentIds: string[]) {
  const snapshots = new Map<string, StudentProgressSnapshot>();

  if (studentIds.length === 0) {
    return snapshots;
  }

  const versionedPhaseRows = await db
    .select({ id: phaseVersions.id })
    .from(phaseVersions);

  const activePhaseIds = new Set(versionedPhaseRows.map((row) => row.id));

  const progressRows = await db
    .select({
      userId: studentProgress.userId,
      phaseId: studentProgress.phaseId,
      status: studentProgress.status,
      updatedAt: studentProgress.updatedAt,
    })
    .from(studentProgress)
    .where(inArray(studentProgress.userId, studentIds));

  const totalPhases = activePhaseIds.size;

  for (const studentId of studentIds) {
    snapshots.set(studentId, {
      completedPhases: 0,
      totalPhases,
      progressPercentage: 0,
      lastActive: null,
    });
  }

  for (const row of progressRows) {
    if (!activePhaseIds.has(row.phaseId)) continue;

    const current = snapshots.get(row.userId);
    if (!current) continue;

    if (row.status === "completed") {
      current.completedPhases += 1;
    }

    if (row.updatedAt) {
      const currentLastActive = current.lastActive ? new Date(current.lastActive).getTime() : 0;
      const rowUpdatedAt = row.updatedAt.getTime();
      if (rowUpdatedAt > currentLastActive) {
        current.lastActive = row.updatedAt.toISOString();
      }
    }
  }

  for (const snapshot of snapshots.values()) {
    snapshot.progressPercentage =
      snapshot.totalPhases > 0
        ? Number(((snapshot.completedPhases / snapshot.totalPhases) * 100).toFixed(1))
        : 0;
  }

  return snapshots;
}

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/teacher");
  }

  const teacher = await getTeacherProfile(user.id);

  if (!teacher) {
    redirect("/auth/login?redirect=/teacher");
  }

  if (teacher.role !== "teacher" && teacher.role !== "admin") {
    redirect("/student/dashboard");
  }

  const [organizationName, students, courseOverview] = await Promise.all([
    getOrganizationName(teacher.organizationId),
    getStudentsInOrganization(teacher.organizationId),
    fetchCourseOverviewData(teacher.organizationId),
  ]);

  const progressSnapshots = await getStudentProgressSnapshots(students.map((student) => student.id));
  const studentsWithProgress = students.map((student) => {
    const snapshot = progressSnapshots.get(student.id);

    return {
      id: student.id,
      username: student.username,
      displayName: student.displayName,
      completedPhases: snapshot?.completedPhases ?? 0,
      totalPhases: snapshot?.totalPhases ?? 0,
      progressPercentage: snapshot?.progressPercentage ?? 0,
      lastActive: snapshot?.lastActive ?? null,
    } satisfies StudentDashboardRow;
  });

  return (
    <TeacherDashboardContent
      teacher={{
        username: teacher.username,
        organizationName,
      }}
      students={studentsWithProgress}
      courseOverview={courseOverview}
    />
  );
}
