import { requireStudentSessionClaims } from "@/lib/auth/server";
import { ReviewSession } from "@/components/student/ReviewSession";

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  await requireStudentSessionClaims("/student/study/review");

  return <ReviewSession />;
}
