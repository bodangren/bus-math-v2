import { notFound, redirect } from 'next/navigation';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { lessonVersions, lessons, phaseSections, phaseVersions, profiles } from '@/lib/db/schema';
import { LessonRenderer } from '@/components/student/LessonRenderer';
import { createClient } from '@/lib/supabase/server';
import type { ContentBlock } from '@/types/curriculum';

interface LessonPageProps {
  params: Promise<{
    lessonSlug: string;
  }>;
  searchParams: Promise<{
    phase?: string;
  }>;
}

const PHASE_TYPE_BY_NUMBER = {
  1: 'intro',
  2: 'example',
  3: 'practice',
  4: 'challenge',
  5: 'assessment',
  6: 'reflection',
} as const;

function fallbackPhaseTitle(phaseNumber: number): string {
  const labels: Record<number, string> = {
    1: 'Hook',
    2: 'Introduction',
    3: 'Guided Practice',
    4: 'Independent Practice',
    5: 'Assessment',
    6: 'Closing',
  };

  return labels[phaseNumber] ?? `Phase ${phaseNumber}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  const obj = asRecord(content);
  if (!obj) return '';
  const markdown = obj.markdown;
  const text = obj.text;
  const value = typeof markdown === 'string' ? markdown : text;
  return typeof value === 'string' ? value : '';
}

function toContentBlock(
  section: { id: string; sectionType: string; content: unknown },
  fallbackOrder: number,
): ContentBlock {
  const obj = asRecord(section.content);
  const blockId = section.id || `section-${fallbackOrder}`;

  if (section.sectionType === 'callout') {
    const variantRaw = obj?.variant;
    const variant =
      variantRaw === 'why-this-matters' ||
      variantRaw === 'tip' ||
      variantRaw === 'warning' ||
      variantRaw === 'example'
        ? variantRaw
        : 'tip';
    // Callout seeds store their text in content.content, not content.markdown
    const calloutContent = typeof obj?.content === 'string' ? obj.content : '';
    return {
      id: blockId,
      type: 'callout',
      variant,
      content: calloutContent || 'Callout content',
    };
  }

  if (section.sectionType === 'activity') {
    const activityId = obj?.activityId;
    const required = obj?.required;
    if (typeof activityId === 'string') {
      const linkedStandardId =
        typeof obj?.linkedStandardId === 'string' ? obj.linkedStandardId : undefined;
      return {
        id: blockId,
        type: 'activity',
        activityId,
        required: required === true,
        ...(linkedStandardId ? { linkedStandardId } : {}),
      };
    }
  }

  if (section.sectionType === 'video') {
    const videoUrl = obj?.videoUrl;
    const duration = obj?.duration;
    const transcript = obj?.transcript;
    if (typeof videoUrl === 'string' && typeof duration === 'number' && duration > 0) {
      return {
        id: blockId,
        type: 'video',
        props: {
          videoUrl,
          duration,
          transcript: typeof transcript === 'string' ? transcript : undefined,
        },
      };
    }
  }

  if (section.sectionType === 'image') {
    const imageUrl = obj?.imageUrl;
    const alt = obj?.alt;
    const caption = obj?.caption;
    if (typeof imageUrl === 'string' && typeof alt === 'string') {
      return {
        id: blockId,
        type: 'image',
        props: {
          imageUrl,
          alt,
          caption: typeof caption === 'string' ? caption : undefined,
        },
      };
    }
  }

  return {
    id: blockId,
    type: 'markdown',
    content: contentToText(section.content) || 'Content coming soon.',
  };
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

  const queryApi = (
    db as {
      query?: {
        lessonVersions?: {
          findMany?: (args: unknown) => Promise<Array<typeof lessonVersions.$inferSelect>>;
        };
        phaseVersions?: {
          findMany?: (args: unknown) => Promise<Array<typeof phaseVersions.$inferSelect>>;
        };
        phaseSections?: {
          findMany?: (args: unknown) => Promise<Array<typeof phaseSections.$inferSelect>>;
        };
      };
    }
  ).query;

  const lessonVersionRows = queryApi?.lessonVersions?.findMany
    ? await queryApi.lessonVersions.findMany({
        where: eq(lessonVersions.lessonId, lesson.id),
      })
    : [];

  const normalizedLessonVersionRows = Array.isArray(lessonVersionRows) ? lessonVersionRows : [];
  const latestVersion = [...normalizedLessonVersionRows].sort((a, b) => b.version - a.version)[0];
  if (!latestVersion || !queryApi?.phaseVersions?.findMany) {
    return {
      lesson,
      phases: [],
    };
  }

  const versionedPhaseRows = await queryApi.phaseVersions.findMany({
    where: eq(phaseVersions.lessonVersionId, latestVersion.id),
  });
  const normalizedVersionedPhases = Array.isArray(versionedPhaseRows) ? versionedPhaseRows : [];
  const versionedPhases = [...normalizedVersionedPhases].sort((a, b) => a.phaseNumber - b.phaseNumber);

  if (versionedPhases.length === 0) {
    return {
      lesson: {
        ...lesson,
        title: latestVersion.title ?? lesson.title,
        description: latestVersion.description ?? lesson.description,
      },
      phases: [],
    };
  }

  let sections: Array<typeof phaseSections.$inferSelect> = [];
  const phaseVersionIds = versionedPhases.map((phase) => phase.id);
  if (phaseVersionIds.length > 0 && queryApi?.phaseSections?.findMany) {
    const sectionRows = await queryApi.phaseSections.findMany({
      where: inArray(phaseSections.phaseVersionId, phaseVersionIds),
    });
    sections = Array.isArray(sectionRows) ? sectionRows : [];
    sections.sort((a, b) => {
      if (a.phaseVersionId === b.phaseVersionId) {
        return a.sequenceOrder - b.sequenceOrder;
      }
      return a.phaseVersionId.localeCompare(b.phaseVersionId);
    });
  }

  const sectionsByPhaseId = new Map<string, Array<typeof phaseSections.$inferSelect>>();
  for (const section of sections) {
    const current = sectionsByPhaseId.get(section.phaseVersionId) ?? [];
    current.push(section);
    sectionsByPhaseId.set(section.phaseVersionId, current);
  }

  const mappedPhases = versionedPhases.map((phase) => {
    const phaseSectionsForPhase = sectionsByPhaseId.get(phase.id) ?? [];
    const contentBlocks = phaseSectionsForPhase.map((section, index) =>
      toContentBlock(section, index + 1),
    );

    return {
      id: phase.id,
      lessonId: lesson.id,
      phaseNumber: phase.phaseNumber,
      title: phase.title ?? fallbackPhaseTitle(phase.phaseNumber),
      contentBlocks,
      estimatedMinutes: phase.estimatedMinutes,
      metadata: {
        phaseType: PHASE_TYPE_BY_NUMBER[phase.phaseNumber as keyof typeof PHASE_TYPE_BY_NUMBER],
      },
      createdAt: phase.createdAt,
      updatedAt: lesson.updatedAt,
    };
  });

  return {
    lesson: {
      ...lesson,
      title: latestVersion.title ?? lesson.title,
      description: latestVersion.description ?? lesson.description,
    },
    phases: mappedPhases,
  };
}

async function getFirstLessonSlug() {
  const [firstLesson] = await db
    .select({ slug: lessons.slug })
    .from(lessons)
    .orderBy(lessons.unitNumber, lessons.orderIndex)
    .limit(1);

  return firstLesson?.slug ?? null;
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

  // Legacy URLs like unit01-lesson01 may not match current seeded slugs.
  if (!data && /^unit\d{2}-lesson\d{2}$/i.test(lessonSlug)) {
    const firstLessonSlug = await getFirstLessonSlug();
    if (firstLessonSlug) {
      return redirect(`/student/lesson/${firstLessonSlug}?phase=1`);
    }
    return redirect('/preface');
  }

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
    // If no phase specified (default to 1), redirect to first incomplete phase
    if (!phaseParam) {
      // Fetch user's progress to find first incomplete phase
      const { data: progressResponse } = await supabase
        .from('student_progress')
        .select('phase_id, status')
        .eq('user_id', user.id)
        .in('phase_id', lessonPhases.map(p => p.id));

      // Create a map of completed phases
      const completedPhaseIds = new Set(
        progressResponse
          ?.filter(p => p.status === 'completed')
          ?.map(p => p.phase_id) || []
      );

      // Find first incomplete phase
      const firstIncompletePhase = lessonPhases.find(p => !completedPhaseIds.has(p.id));
      const targetPhaseNumber = firstIncompletePhase?.phaseNumber || 1;

      // Redirect to first incomplete phase
      if (targetPhaseNumber !== requestedPhaseNumber) {
        redirect(`/student/lesson/${lessonSlug}?phase=${targetPhaseNumber}`);
      }
    }

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
