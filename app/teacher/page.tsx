import { redirect } from "next/navigation";
import { getServerSessionClaims } from "@/lib/auth/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  TeacherDashboardContent,
  type StudentDashboardRow,
} from "@/components/teacher/TeacherDashboardContent";
import { fetchCourseOverviewData } from "@/lib/teacher/course-overview-data";

export default async function TeacherDashboardPage() {
  const claims = await getServerSessionClaims();

  if (!claims) {
    redirect("/auth/login?redirect=/teacher");
  }

  // Use Convex HTTP client for server-side fetching
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:6790/";
  const convex = new ConvexHttpClient(convexUrl);

  const profileId = claims.sub;

  // Fetch all teacher dashboard metrics from Convex
  const data = await convex.query(api.teacher.getTeacherDashboardData, {
    userId: profileId as Id<"profiles">,
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
