import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { lessons, phases, profiles } from '@/lib/db/schema';
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
 * Error component for lessons with no phases
 */
function NoPhaseError({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-900 mb-4">
          Lesson Not Available
        </h1>
        <p className="text-red-700 mb-4">
          The lesson &ldquo;{lessonTitle}&rdquo; does not have any phases configured. Please contact your instructor.
        </p>
        <a
          href="/student/dashboard"
          className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

/**
 * Error component for RPC failures
 */
function AccessCheckError({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-900 mb-4">
          Unable to Verify Access
        </h1>
        <p className="text-red-700 mb-4">
          We encountered an error while checking your access to &ldquo;{lessonTitle}&rdquo;.
          This may be due to a temporary server issue.
        </p>
        <p className="text-red-700 mb-4">
          Please try again in a few moments. If the problem persists, contact your instructor.
        </p>
        <a
          href="/student/dashboard"
          className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

/**
 * Fetch user profile with role information
 */
async function getUserProfile(userId: string) {
  const [profile] = await db
    .select({
      id: profiles.id,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return profile ?? null;
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

  // FIX #1: Check if lesson has zero phases - show error instead of redirecting
  if (lessonPhases.length === 0) {
    return <NoPhaseError lessonTitle={lesson.title} />;
  }

  // Fetch user profile to check role
  const userProfile = await getUserProfile(user.id);

  // Teachers and admins can access any phase without restrictions
  const isBypassRole = userProfile?.role === 'teacher' || userProfile?.role === 'admin';

  // Determine requested phase number (default to 1)
  const requestedPhaseNumber = phaseParam ? parseInt(phaseParam, 10) : 1;

  // Validate phase number - if invalid, redirect to phase 1 (only if phases exist)
  if (isNaN(requestedPhaseNumber) || requestedPhaseNumber < 1 || requestedPhaseNumber > lessonPhases.length) {
    redirect(`/student/lesson/${lessonSlug}?phase=1`);
  }

  // Skip access checks for teachers and admins
  if (!isBypassRole) {
    // Check if user can access this phase using RPC function
    const { data: canAccess, error: rpcError } = await supabase.rpc('can_access_phase', {
      p_lesson_id: lesson.id,
      p_phase_number: requestedPhaseNumber,
    });

    // FIX #2: On RPC error, show error page instead of redirecting
    if (rpcError) {
      console.error('Error checking phase access:', rpcError);
      return <AccessCheckError lessonTitle={lesson.title} />;
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
