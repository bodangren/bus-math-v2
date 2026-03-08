import { notFound, redirect } from 'next/navigation';
import { LessonRenderer } from '@/components/student/LessonRenderer';
import { getServerSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, fetchQuery, api, internal } from '@/lib/convex/server';
import type { ContentBlock } from '@/types/curriculum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny = api as any;

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
  section: { _id: string; sectionType: string; content: unknown },
  fallbackOrder: number,
): ContentBlock {
  const obj = asRecord(section.content);
  const blockId = section._id || `section-${fallbackOrder}`;

  if (section.sectionType === 'callout') {
    const variantRaw = obj?.variant;
    const variant =
      variantRaw === 'why-this-matters' ||
      variantRaw === 'tip' ||
      variantRaw === 'warning' ||
      variantRaw === 'example'
        ? variantRaw
        : 'tip';
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

function NoPhaseError({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-900 mb-4">Lesson Not Available</h1>
        <p className="text-red-700 mb-4">
          The lesson &ldquo;{lessonTitle}&rdquo; does not have any phases configured. Please
          contact your instructor.
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

function AccessCheckError({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-900 mb-4">Unable to Verify Access</h1>
        <p className="text-red-700 mb-4">
          We encountered an error while checking your access to &ldquo;{lessonTitle}&rdquo;. This
          may be due to a temporary server issue.
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

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { lessonSlug } = await params;
  const { phase: phaseParam } = await searchParams;

  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect('/auth/login');
  }

  const userId = claims.sub;

  // Fetch full lesson content (lesson + phases + sections) from Convex
  const data = await fetchQuery(apiAny.api.getLessonWithContent, { slug: lessonSlug });

  // Legacy URLs like unit01-lesson01 may not match current seeded slugs.
  if (!data && /^unit\d{2}-lesson\d{2}$/i.test(lessonSlug)) {
    const firstSlug: string | null = await fetchQuery(apiAny.api.getFirstLessonSlug, {});
    if (firstSlug) {
      return redirect(`/student/lesson/${firstSlug}?phase=1`);
    }
    return redirect('/preface');
  }

  if (!data) {
    notFound();
  }

  const { lesson, phases: rawPhases } = data;

  if (rawPhases.length === 0) {
    return <NoPhaseError lessonTitle={lesson.title} />;
  }

  // Map raw Convex sections into typed ContentBlock arrays
  const lessonPhases = rawPhases.map(
    (phase: {
      _id: string;
      phaseNumber: number;
      title?: string;
      estimatedMinutes?: number;
      createdAt: number;
      sections: Array<{ _id: string; sectionType: string; content: unknown }>;
    }) => ({
      id: phase._id,
      lessonId: lesson._id,
      phaseNumber: phase.phaseNumber,
      title: phase.title ?? fallbackPhaseTitle(phase.phaseNumber),
      contentBlocks: phase.sections.map((s, idx) => toContentBlock(s, idx + 1)) as ContentBlock[],
      estimatedMinutes: phase.estimatedMinutes,
      metadata: {
        phaseType:
          PHASE_TYPE_BY_NUMBER[phase.phaseNumber as keyof typeof PHASE_TYPE_BY_NUMBER],
      },
      createdAt: new Date(phase.createdAt),
      updatedAt: new Date(lesson.updatedAt),
    }),
  );

  // Fetch user profile from Convex to check role
  let userProfile: { role?: string } | null = null;
  try {
    userProfile = await fetchInternalQuery(internal.activities.getProfileById, { profileId: userId });
  } catch (profileError) {
    console.error('Error loading user profile from Convex:', profileError);
  }

  const isBypassRole = userProfile?.role === 'teacher' || userProfile?.role === 'admin';

  const requestedPhaseNumber = phaseParam ? parseInt(phaseParam, 10) : 1;

  if (isNaN(requestedPhaseNumber) || requestedPhaseNumber < 1 || requestedPhaseNumber > lessonPhases.length) {
    redirect(`/student/lesson/${lessonSlug}?phase=1`);
  }

  if (!isBypassRole) {
    let convexLesson: { _id: string } | null = null;
    try {
      convexLesson = await fetchQuery(apiAny.api.getLessonBySlugOrId, {
        identifier: lesson.slug,
      });
    } catch (convexLessonError) {
      console.error('Error resolving lesson in Convex:', convexLessonError);
      return <AccessCheckError lessonTitle={lesson.title} />;
    }

    if (!convexLesson) {
      console.error('Lesson was not found in Convex for slug:', lesson.slug);
      return <AccessCheckError lessonTitle={lesson.title} />;
    }

    if (!phaseParam) {
      try {
        const progressResponse = await fetchInternalQuery(internal.student.getLessonProgress, {
          userId,
          lessonIdentifier: lesson.slug,
        });

        const completedPhaseNumbers = new Set<number>(
          (progressResponse?.phases ?? [])
            .filter((phase: { status?: string }) => phase.status === 'completed')
            .map((phase: { phaseNumber: number }) => phase.phaseNumber),
        );

        const firstIncompletePhase = lessonPhases.find(
          (phase: { phaseNumber: number }) => !completedPhaseNumbers.has(phase.phaseNumber),
        );
        const targetPhaseNumber = firstIncompletePhase?.phaseNumber || 1;

        if (targetPhaseNumber !== requestedPhaseNumber) {
          redirect(`/student/lesson/${lessonSlug}?phase=${targetPhaseNumber}`);
        }
      } catch (progressError) {
        console.error('Error loading lesson progress from Convex:', progressError);
        return <AccessCheckError lessonTitle={lesson.title} />;
      }
    }

    let canAccess = false;
    try {
      canAccess = await fetchInternalQuery(internal.api.canAccessPhase, {
        userId,
        lessonId: convexLesson._id,
        phaseNumber: requestedPhaseNumber,
      });
    } catch (accessError) {
      console.error('Error checking phase access:', accessError);
      return <AccessCheckError lessonTitle={lesson.title} />;
    }

    if (!canAccess) {
      let latestAccessiblePhase = 1;

      for (let i = lessonPhases.length; i >= 1; i--) {
        try {
          const phaseAccess = await fetchInternalQuery(internal.api.canAccessPhase, {
            userId,
            lessonId: convexLesson._id,
            phaseNumber: i,
          });

          if (phaseAccess) {
            latestAccessiblePhase = i;
            break;
          }
        } catch (phaseAccessError) {
          console.error('Error checking latest accessible phase:', phaseAccessError);
          return <AccessCheckError lessonTitle={lesson.title} />;
        }
      }

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
