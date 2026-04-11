import { requireStudentSessionClaims } from "@/lib/auth/server";
import { PracticeTestPage } from "@/components/student/PracticeTestPage";

export const dynamic = 'force-dynamic';

export default async function PracticeTestUnitPage({ params }: { params: { unitNumber: string } }) {
  await requireStudentSessionClaims(`/student/study/practice-tests/${params.unitNumber}`);

  return <PracticeTestPage unitNumber={parseInt(params.unitNumber)} />;
}
