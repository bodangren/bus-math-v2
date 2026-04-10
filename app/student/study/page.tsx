import { requireStudentSessionClaims } from "@/lib/auth/server";
import { StudyHubHome } from "@/components/student/StudyHubHome";

export const dynamic = 'force-dynamic';

export default async function StudyHubPage() {
  await requireStudentSessionClaims("/student/study");

  return <StudyHubHome />;
}
