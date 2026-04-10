import { requireStudentSessionClaims } from "@/lib/auth/server";
import { ExportPage } from "@/components/student/ExportPage";

export const dynamic = 'force-dynamic';

export default async function ExportStudyDataPage() {
  await requireStudentSessionClaims("/student/study/export");

  return <ExportPage />;
}
