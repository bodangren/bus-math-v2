import { redirect } from "next/navigation";
import { getServerSessionClaims } from "@/lib/auth/server";
import { TeacherDashboardContent } from "@/components/teacher/TeacherDashboardContent";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { StudentDashboardRow } from "@/lib/teacher/intervention";

export default async function TeacherDashboardPage() {
  const claims = await getServerSessionClaims();

  if (!claims) {
    redirect("/auth/login?redirect=/teacher");
  }

  const data = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    userId: claims.sub as never,
  });

  if (!data) {
    // Teacher not found or not authorized
    redirect("/student/dashboard");
  }

  const courseOverview = await fetchInternalQuery(
    internal.teacher.getTeacherCourseOverviewData,
    {
      userId: claims.sub as never,
    },
  );

  if (!courseOverview) {
    redirect("/student/dashboard");
  }

  return (
    <TeacherDashboardContent
      teacher={{
        username: data.teacher.username,
        organizationName: data.teacher.organizationName,
      }}
      students={data.students as StudentDashboardRow[]}
      courseOverview={courseOverview as never}
    />
  );
}
