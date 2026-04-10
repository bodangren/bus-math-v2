import { requireStudentSessionClaims } from "@/lib/auth/server";
import { SpeedRoundGame } from "@/components/student/SpeedRoundGame";

export const dynamic = 'force-dynamic';

export default async function SpeedRoundPage() {
  await requireStudentSessionClaims("/student/study/speed-round");

  return <SpeedRoundGame />;
}