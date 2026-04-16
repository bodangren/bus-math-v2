import { requireStudentSessionClaims } from '@/lib/auth/server';
import { DailyPracticeSession } from '@/components/student/DailyPracticeSession';

export const dynamic = 'force-dynamic';

export default async function DailyPracticePage() {
  const claims = await requireStudentSessionClaims('/student/practice');

  return <DailyPracticeSession studentId={claims.sub} />;
}