'use client';

import { type ContentBlock } from '@/lib/db/schema/phases';
import { type LessonMetadata } from '@/lib/db/schema/lessons';
import { type PhaseMetadata } from '@/lib/db/schema/phases';
import { PhaseCompleteButton } from '@/components/lesson/PhaseCompleteButton';

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
}

/**
 * Renders a complete lesson with all its phases
 * This is a placeholder component that will be enhanced with full content rendering
 */
export function LessonRenderer({ lesson, phases }: LessonRendererProps) {
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

        {/* Phases */}
        <div className="space-y-8">
          {phases.map((phase) => (
            <div key={phase.id} className="border rounded-lg p-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-sm font-semibold text-primary">
                  Phase {phase.phaseNumber}
                </span>
                <h2 className="text-2xl font-bold">{phase.title}</h2>
                {phase.estimatedMinutes && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    {phase.estimatedMinutes} min
                  </span>
                )}
              </div>

              {/* Content Blocks - Basic rendering */}
              <div className="space-y-4">
                {phase.contentBlocks.map((block) => (
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
                <PhaseCompleteButton phaseId={phase.id} />
              </div>
            </div>
          ))}
        </div>

        {phases.length === 0 && (
          <div className="text-center text-muted-foreground py-12 border rounded-lg">
            No phases available for this lesson yet.
          </div>
        )}
      </div>
    </div>
  );
}
