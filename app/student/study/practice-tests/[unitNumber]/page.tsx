import { requireStudentSessionClaims } from "@/lib/auth/server";
import { PracticeTestPage } from "@/components/student/PracticeTestPage";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PracticeTestUnitPage({ params }: { params: { unitNumber: string } }) {
  const unitNumber = parseInt(params.unitNumber, 10);
  if (!Number.isInteger(unitNumber) || unitNumber < 1 || unitNumber > 8) {
    notFound();
  }

  await requireStudentSessionClaims(`/student/study/practice-tests/${unitNumber}`);

  return <PracticeTestPage unitNumber={unitNumber} />;
}
