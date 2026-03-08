import { redirect } from "next/navigation";
import { getServerSessionClaims } from "@/lib/auth/server";
import {
  TeacherDashboardContent,
  type StudentDashboardRow,
} from "@/components/teacher/TeacherDashboardContent";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import { fetchCourseOverviewData } from "@/lib/teacher/course-overview-data";

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

  // Fetch course overview data (still uses Drizzle for now, to be migrated next)
  const courseOverview = await fetchCourseOverviewData(data.teacher.organizationId);

  return (
    <TeacherDashboardContent
      teacher={{
        username: data.teacher.username,
        organizationName: data.teacher.organizationName,
      }}
      students={data.students as StudentDashboardRow[]}
      courseOverview={courseOverview}
    />
  );
}
