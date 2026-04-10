import { requireStudentSessionClaims } from "@/lib/auth/server";
import { FlashcardPlayer } from "@/components/student/FlashcardPlayer";

export const dynamic = 'force-dynamic';

export default async function FlashcardsPage() {
  await requireStudentSessionClaims("/student/study/flashcards");

  return <FlashcardPlayer />;
}