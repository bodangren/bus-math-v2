'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, FileText } from 'lucide-react';
import { LessonStepper, type StepperPhase } from '@/components/lesson/LessonStepper';
import { PhaseRenderer } from '@/components/lesson/PhaseRenderer';
import { PhaseGuidanceCard } from '@/components/student/PhaseGuidanceCard';
import { usePhaseProgress } from '@/hooks/usePhaseProgress';
import { usePhaseCompletion } from '@/hooks/usePhaseCompletion';
import { Button } from '@/components/ui/button';
import type { DashboardLessonActionLink } from '@/lib/student/dashboard-presentation';
import { formatCurriculumSegmentLabel } from '@/lib/curriculum/segment-labels';
import { getLessonPhaseGuidance, type PhaseGuidance } from '@/lib/curriculum/phase-guidance';
import { studentDashboardPath, studentLessonPath } from '@/lib/student/navigation';
import { cn } from '@/lib/utils';
import { getWorkbookPath, lessonHasWorkbooks } from '@/lib/curriculum/workbooks';
import { Download } from 'lucide-react';
import type { ContentBlock, LessonMetadata, PhaseMetadata } from '@/types/curriculum';

interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  contentBlocks?: ContentBlock[];
  estimatedMinutes: number | null;
  metadata?: PhaseMetadata;
}

interface Lesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  learningObjectives: string[] | null;
  orderIndex: number;
  metadata: LessonMetadata | null;
}

interface LessonRendererProps {
  lesson: Lesson;
  phases: Phase[];
  currentPhaseNumber: number;
  lessonSlug: string;
  isLessonComplete?: boolean;
  recommendedLesson?: DashboardLessonActionLink | null;
}

function buildFallbackPhaseGuidance(phase: Phase, lesson: Lesson): PhaseGuidance {
  return {
    lessonType: 'accounting',
    phaseNumber: phase.phaseNumber,
    phaseLabel: phase.title,
    goal: `Work through ${phase.title.toLowerCase()} in a way that advances the lesson objective.`,
    successCriteria: lesson.learningObjectives?.length
      ? [`Connect your work in this phase to at least one lesson objective.`]
      : ['Complete the current phase and be ready to explain your thinking.'],
  };
}

/**
 * Renders a single phase of a lesson with navigation
 * Integrates LessonStepper and enforces phase locking on the client side
 */
export function LessonRenderer({
  lesson,
  phases,
  currentPhaseNumber,
  lessonSlug,
  isLessonComplete = false,
  recommendedLesson = null,
}: LessonRendererProps) {
  const router = useRouter();
  const { data: progressData, isLoading, refetch } = usePhaseProgress(lesson.slug);

  // Find the current phase
  const currentPhase = phases.find(p => p.phaseNumber === currentPhaseNumber);

  // Determine if it's a "Read" phase (no required activity).
  // Computed before hooks so values are stable regardless of early-return path.
  const hasRequiredActivity = currentPhase?.contentBlocks?.some(
    block => block.type === 'activity' && block.required
  );
  const isReadPhase = !hasRequiredActivity;

  // Get current phase completion status (safe with optional chaining when phase is absent)
  const currentPhaseProgress = progressData?.phases.find(p => p.phaseId === currentPhase?.id);
  const isCurrentPhaseCompleted = currentPhaseProgress?.status === 'completed';
  const phaseGuidance =
    currentPhase
      ? getLessonPhaseGuidance(lesson.orderIndex, currentPhase.phaseNumber) ??
        buildFallbackPhaseGuidance(currentPhase, lesson)
      : null;

  // Hooks must be called unconditionally — placed before any early return.
  const { completePhase: autoMarkComplete, isCompleting: isAutoCompleting } = usePhaseCompletion({
    lessonId: lesson.slug,
    phaseNumber: currentPhaseNumber,
    phaseType: isReadPhase ? 'read' : 'do',
    onSuccess: () => {
      // Refetch progress to update stepper and navigation
      refetch();
    },
  });

  // Auto-capture for Read phases on navigation
  useEffect(() => {
    if (currentPhase && isReadPhase && !isCurrentPhaseCompleted && !isLoading && !isAutoCompleting) {
      autoMarkComplete();
    }
  }, [currentPhase, isReadPhase, isCurrentPhaseCompleted, isLoading, autoMarkComplete, isAutoCompleting]);

  // Early return after all hooks have been called
  if (!currentPhase) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-muted-foreground py-12 border rounded-lg">
            Phase not found.
          </div>
        </div>
      </div>
    );
  }

  // Transform phases data for LessonStepper and navigation logic
  const stepperPhases: StepperPhase[] = phases.map(phase => {
    const phaseProgress = progressData?.phases.find(p => p.phaseId === phase.id);
    return {
      phaseNumber: phase.phaseNumber,
      phaseId: phase.id,
      title: phase.title,
      status: phaseProgress?.status || 'locked',
    };
  });

  // Handle phase navigation
  const handlePhaseClick = (phaseNumber: number) => {
    router.push(`/student/lesson/${lessonSlug}?phase=${phaseNumber}`);
  };

  // Determine if previous/next navigation is available
  const canGoPrevious = currentPhaseNumber > 1;
  const canGoNext = currentPhaseNumber < phases.length;
  const showLessonCompletePanel = isLessonComplete && currentPhaseNumber === phases.length;

  // Check if next phase is unlocked (either already unlocked OR current phase is completed/read-only)
  const nextPhaseStatus = stepperPhases.find(p => p.phaseNumber === currentPhaseNumber + 1)?.status;
  const isNextPhaseUnlocked = 
    isCurrentPhaseCompleted || 
    isReadPhase || 
    nextPhaseStatus === 'available' || 
    nextPhaseStatus === 'current' || 
    nextPhaseStatus === 'completed';

  const handlePrevious = () => {
    if (canGoPrevious) {
      router.push(`/student/lesson/${lessonSlug}?phase=${currentPhaseNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (canGoNext && isNextPhaseUnlocked) {
      router.push(`/student/lesson/${lessonSlug}?phase=${currentPhaseNumber + 1}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href={studentDashboardPath()} className="hover:text-foreground">
            Dashboard
          </Link>
          <ArrowRight className="h-3 w-3" />
          <span className="text-foreground">{lesson.title}</span>
        </nav>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            {formatCurriculumSegmentLabel(lesson.unitNumber)}
          </div>
          <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {lesson.description}
            </p>
          )}
          {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h2 className="font-semibold mb-2">Learning Objectives</h2>
              <ul className="list-disc list-inside space-y-1">
                {lesson.learningObjectives.map((objective, index) => (
                  <li key={index} className="text-sm">
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lessonHasWorkbooks(lesson.unitNumber, lesson.orderIndex) && (
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Workbook Materials
              </h2>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={getWorkbookPath(lesson.unitNumber, lesson.orderIndex, 'student')} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download Student Workbook (.xlsx)
                  </a>
                </Button>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">40-Point Grading Rubric</p>
                  <p className="text-xs mt-1">
                    This assignment will be scored using a 40-point scale. Follow the instructions in the lesson phases carefully.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Stepper */}
        {!isLoading && stepperPhases.length > 0 && (
          <div className="mb-8">
            <LessonStepper
              phases={stepperPhases}
              currentPhase={currentPhaseNumber}
              onPhaseClick={handlePhaseClick}
            />
          </div>
        )}

        {/* Current Phase */}
        <div className="space-y-8">
          <div className="border rounded-lg p-6">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-sm font-semibold text-primary">
                Phase {currentPhase.phaseNumber}
              </span>
              <h2 className="text-2xl font-bold">{currentPhase.title}</h2>
              {currentPhase.estimatedMinutes && (
                <span className="text-sm text-muted-foreground ml-auto">
                  {currentPhase.estimatedMinutes} min
                </span>
              )}
            </div>

            <div className="space-y-4">
              {phaseGuidance ? (
                <PhaseGuidanceCard
                  guidance={phaseGuidance}
                  learningObjectives={lesson.learningObjectives}
                />
              ) : null}
              <PhaseRenderer
                contentBlocks={currentPhase.contentBlocks ?? []}
                lessonId={lesson.slug}
                phaseNumber={currentPhase.phaseNumber}
                activityInitialStatus={currentPhaseProgress?.status}
                onActivityStatusChange={() => refetch()}
              />
            </div>

            <div className="mt-6 flex justify-end">
              {isReadPhase && !isCurrentPhaseCompleted && (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Recording progress...
                </div>
              )}
              {isReadPhase && isCurrentPhaseCompleted && (
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Phase complete
                </div>
              )}
            </div>
          </div>
        </div>

        {showLessonCompletePanel ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Lesson Complete
              </p>
              <h3 className="text-xl font-semibold text-emerald-950">
                You finished every published phase in this lesson.
              </h3>
              <p className="text-sm text-emerald-900/80">
                Review the phase sequence here, head back to the dashboard, or continue into the
                next recommended lesson.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href={studentDashboardPath()}>Back to Dashboard</Link>
              </Button>
              {recommendedLesson ? (
                <Button asChild>
                  <Link href={studentLessonPath(recommendedLesson.slug)}>
                    {recommendedLesson.actionLabel}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={cn(!canGoPrevious && 'opacity-50 cursor-not-allowed')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Phase
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canGoNext || !isNextPhaseUnlocked}
            title={!isNextPhaseUnlocked ? 'Complete current phase to unlock' : ''}
            className={cn(
              (!canGoNext || !isNextPhaseUnlocked) && 'opacity-50 cursor-not-allowed'
            )}
          >
            Next Phase
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
