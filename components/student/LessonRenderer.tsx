'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LessonStepper, type StepperPhase } from '@/components/lesson/LessonStepper';
import { PhaseRenderer } from '@/components/lesson/PhaseRenderer';
import { PhaseGuidanceCard } from '@/components/student/PhaseGuidanceCard';
import { usePhaseProgress } from '@/hooks/usePhaseProgress';
import { usePhaseCompletion } from '@/hooks/usePhaseCompletion';
import { Button } from '@/components/ui/button';
import { getLessonPhaseGuidance, type PhaseGuidance } from '@/lib/curriculum/phase-guidance';
import { cn } from '@/lib/utils';
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
export function LessonRenderer({ lesson, phases, currentPhaseNumber, lessonSlug }: LessonRendererProps) {
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
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            Unit {lesson.unitNumber}
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
