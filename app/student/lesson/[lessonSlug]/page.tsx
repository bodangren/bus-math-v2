import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { lessons, phases } from '@/lib/db/schema';
import { LessonRenderer } from '@/components/student/LessonRenderer';
import { createClient } from '@/lib/supabase/server';

interface LessonPageProps {
  params: Promise<{
    lessonSlug: string;
  }>;
  searchParams: Promise<{
    phase?: string;
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
 * Lesson page - displays a single lesson with a single phase
 * Server component that fetches data and enforces server-side phase locking
 */
export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { lessonSlug } = await params;
  const { phase: phaseParam } = await searchParams;

  // Create Supabase client and verify authentication
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch lesson and phases
  const data = await getLessonWithPhases(lessonSlug);

  // Show 404 if lesson not found
  if (!data) {
    notFound();
  }

  const { lesson, phases: lessonPhases } = data;

  // Determine requested phase number (default to 1)
  const requestedPhaseNumber = phaseParam ? parseInt(phaseParam, 10) : 1;

  // Validate phase number
  if (isNaN(requestedPhaseNumber) || requestedPhaseNumber < 1 || requestedPhaseNumber > lessonPhases.length) {
    redirect(`/student/lesson/${lessonSlug}?phase=1`);
  }

  // Check if user can access this phase using RPC function
  const { data: canAccess, error: rpcError } = await supabase.rpc('can_access_phase', {
    p_lesson_id: lesson.id,
    p_phase_number: requestedPhaseNumber,
  });

  if (rpcError) {
    console.error('Error checking phase access:', rpcError);
    // On error, redirect to phase 1 for safety
    redirect(`/student/lesson/${lessonSlug}?phase=1`);
  }

  // If user cannot access this phase, find the latest accessible phase
  if (!canAccess) {
    // Find the latest unlocked phase
    let latestAccessiblePhase = 1;

    for (let i = lessonPhases.length; i >= 1; i--) {
      const { data: phaseAccess } = await supabase.rpc('can_access_phase', {
        p_lesson_id: lesson.id,
        p_phase_number: i,
      });

      if (phaseAccess) {
        latestAccessiblePhase = i;
        break;
      }
    }

    // Redirect to the latest accessible phase
    redirect(`/student/lesson/${lessonSlug}?phase=${latestAccessiblePhase}`);
  }

  return (
    <LessonRenderer
      lesson={lesson}
      phases={lessonPhases}
      currentPhaseNumber={requestedPhaseNumber}
      lessonSlug={lessonSlug}
    />
  );
}
