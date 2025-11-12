import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { lessons, phases } from '@/lib/db/schema';
import { LessonRenderer } from '@/components/student/LessonRenderer';

interface LessonPageProps {
  params: Promise<{
    lessonSlug: string;
  }>;
}

/**
 * Fetch lesson and associated phases from database
 */
async function getLessonWithPhases(slug: string) {
  // Query lesson by slug
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.slug, slug))
    .limit(1);

  if (!lesson) {
    return null;
  }

  // Query phases for this lesson, ordered by phase number
  const lessonPhases = await db
    .select()
    .from(phases)
    .where(eq(phases.lessonId, lesson.id))
    .orderBy(phases.phaseNumber);

  return {
    lesson,
    phases: lessonPhases,
  };
}

/**
 * Lesson page - displays a single lesson with all its phases
 * Server component that fetches data from Supabase database
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;

  // Fetch lesson and phases
  const data = await getLessonWithPhases(lessonSlug);

  // Show 404 if lesson not found
  if (!data) {
    notFound();
  }

  return <LessonRenderer lesson={data.lesson} phases={data.phases} />;
}
