import { requireStudentSessionClaims } from "@/lib/auth/server";
import { MatchingGame } from "@/components/student/MatchingGame";

export const dynamic = 'force-dynamic';

export default async function MatchingPage() {
  await requireStudentSessionClaims("/student/study/matching");

  return <MatchingGame />;
}
