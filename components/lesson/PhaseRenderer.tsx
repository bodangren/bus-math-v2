'use client';

import Image from 'next/image';
import { contentBlockSchema, type ContentBlock } from '@/lib/db/schema/phases';
import { VideoPlayer } from './VideoPlayer';
import { Callout } from './Callout';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ActivityRenderer } from './ActivityRenderer';
import { ContentBlockErrorBoundary } from './ContentBlockErrorBoundary';

interface PhaseRendererProps {
  contentBlocks: ContentBlock[];
  lessonId: string;
  phaseNumber: number;
}

/**
 * PhaseRenderer iterates over phase.contentBlocks and renders each block
 * according to its type using discriminated union pattern.
 */
export function PhaseRenderer({ contentBlocks, lessonId, phaseNumber }: PhaseRendererProps) {
  // Validate content blocks with Zod
  const validatedBlocks = contentBlocks.map((block, index) => {
    try {
      return contentBlockSchema.parse(block);
    } catch (error) {
      console.error(`Invalid content block at index ${index}:`, error);
      return null;
    }
  }).filter((block): block is ContentBlock => block !== null);

  if (validatedBlocks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No content available for this phase.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validatedBlocks.map((block) => (
        <ContentBlockErrorBoundary key={block.id}>
          <ContentBlockRenderer block={block} lessonId={lessonId} phaseNumber={phaseNumber} />
        </ContentBlockErrorBoundary>
      ))}
    </div>
  );
}

/**
 * Renders a single content block based on its type
 */
function ContentBlockRenderer({
  block,
  lessonId,
  phaseNumber
}: {
  block: ContentBlock;
  lessonId: string;
  phaseNumber: number;
}) {
  switch (block.type) {
    case 'markdown':
      return <MarkdownRenderer content={block.content} />;

    case 'video':
      return (
        <VideoPlayer
          videoUrl={block.props.videoUrl}
          duration={block.props.duration}
          transcript={block.props.transcript}
          thumbnailUrl={block.props.thumbnailUrl}
        />
      );

    case 'image':
      return (
        <figure className="my-4">
          <div className="relative w-full h-auto">
            <Image
              src={block.props.imageUrl}
              alt={block.props.alt}
              width={800}
              height={600}
              className="rounded-lg"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          {block.props.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2">
              {block.props.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'callout':
      return <Callout variant={block.variant} content={block.content} />;

    case 'activity':
      return (
        <ActivityRenderer
          activityId={block.activityId}
          lessonId={lessonId}
          phaseNumber={phaseNumber}
          required={block.required}
        />
      );

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = block;
      console.error('Unknown content block type:', _exhaustive);
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
          Unknown content block type
        </div>
      );
  }
}
