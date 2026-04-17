import { redirect } from "next/navigation";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import { TeacherSRSDashboardClient } from "@/components/teacher/srs/TeacherSRSDashboardClient";
import type { Id } from "@/convex/_generated/dataModel";

export default async function TeacherSRSPage() {
  const claims = await requireTeacherSessionClaims("/teacher/srs");

  const teacherData = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    userId: claims.sub as Id<"profiles">,
  });

  if (!teacherData) {
    redirect("/auth/login");
  }

  const classes = await fetchInternalQuery(internal.srs.getTeacherClasses, {
    userId: claims.sub as Id<"profiles">,
  });

  return (
    <TeacherSRSDashboardClient
      organizationName={teacherData.teacher.organizationName}
      classes={classes ?? []}
    />
  );
}