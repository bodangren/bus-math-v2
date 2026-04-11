import { requireStudentSessionClaims } from "@/lib/auth/server";
import { PracticeTestSelection } from "@/components/student/PracticeTestSelection";

export const dynamic = 'force-dynamic';

export default async function PracticeTestsHubPage() {
  await requireStudentSessionClaims("/student/study/practice-tests");

  return <PracticeTestSelection />;
}
