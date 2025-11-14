import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { organizations, profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import {
  TeacherDashboardContent,
  type StudentDashboardRow,
} from "@/components/teacher/TeacherDashboardContent";

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

  const [organizationName, students] = await Promise.all([
    getOrganizationName(teacher.organizationId),
    getStudentsInOrganization(teacher.organizationId),
  ]);

  const studentsWithProgress = await Promise.all(
    students.map(async (student) => {
      const { data, error } = await supabase.rpc("get_student_progress", {
        student_uuid: student.id,
      });

      if (error) {
        console.error("Error fetching progress for student", student.id, error.message);
      }

      const progressRow = data?.[0] ?? null;

      return {
        id: student.id,
        username: student.username,
        displayName: student.displayName,
        completedPhases: Number(progressRow?.completed_phases ?? 0),
        totalPhases: Number(progressRow?.total_phases ?? 0),
        progressPercentage: Number(progressRow?.progress_percentage ?? 0),
        lastActive: progressRow?.last_active ?? null,
      } satisfies StudentDashboardRow;
    }),
  );

  return (
    <TeacherDashboardContent
      teacher={{
        username: teacher.username,
        organizationName,
      }}
      students={studentsWithProgress}
    />
  );
}
