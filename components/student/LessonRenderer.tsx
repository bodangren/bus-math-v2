'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ContentBlock } from '@/lib/db/schema/phases';
import { type LessonMetadata } from '@/lib/db/schema/lessons';
import { type PhaseMetadata } from '@/lib/db/schema/phases';
import { PhaseCompleteButton } from '@/components/lesson/PhaseCompleteButton';
import { LessonStepper, type StepperPhase } from '@/components/lesson/LessonStepper';
import { usePhaseProgress } from '@/hooks/usePhaseProgress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  contentBlocks: ContentBlock[];
  estimatedMinutes: number | null;
  metadata: PhaseMetadata;
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

/**
 * Renders a single phase of a lesson with navigation
 * Integrates LessonStepper and enforces phase locking on the client side
 */
export function LessonRenderer({ lesson, phases, currentPhaseNumber, lessonSlug }: LessonRendererProps) {
  const router = useRouter();
  const { data: progressData, isLoading } = usePhaseProgress(lesson.id);

  // Find the current phase
  const currentPhase = phases.find(p => p.phaseNumber === currentPhaseNumber);

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

  // Transform phases data for LessonStepper
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

  // Check if next phase is unlocked
  const nextPhaseStatus = stepperPhases.find(p => p.phaseNumber === currentPhaseNumber + 1)?.status;
  const isNextPhaseUnlocked = nextPhaseStatus === 'available' || nextPhaseStatus === 'current' || nextPhaseStatus === 'completed';

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

            {/* Content Blocks - Basic rendering */}
            <div className="space-y-4">
              {currentPhase.contentBlocks.map((block) => (
                <div key={block.id}>
                  {block.type === 'markdown' && (
                    <div className="prose prose-sm max-w-none">
                      {block.content}
                    </div>
                  )}
                  {block.type === 'callout' && (
                    <div className="border-l-4 border-primary pl-4 py-2 bg-muted/50">
                      <div className="font-semibold capitalize mb-1">
                        {block.variant.replace(/-/g, ' ')}
                      </div>
                      <div className="text-sm">{block.content}</div>
                    </div>
                  )}
                  {block.type === 'video' && (
                    <div className="border rounded p-4 bg-muted/50">
                      <div className="font-semibold mb-2">Video</div>
                      <div className="text-sm text-muted-foreground">
                        {block.props.videoUrl}
                      </div>
                    </div>
                  )}
                  {block.type === 'image' && (
                    <div className="border rounded p-4">
                      <div className="font-semibold mb-2">Image</div>
                      <div className="text-sm text-muted-foreground">
                        {block.props.alt}
                      </div>
                    </div>
                  )}
                  {block.type === 'activity' && (
                    <div className="border rounded p-4 bg-primary/10">
                      <div className="font-semibold mb-2">Activity</div>
                      <div className="text-sm text-muted-foreground">
                        Activity ID: {block.activityId}
                        {block.required && (
                          <span className="ml-2 text-primary">(Required)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <PhaseCompleteButton phaseId={currentPhase.id} />
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
