import type { ReactNode } from 'react';
import Image from 'next/image';

import type { Lesson, Phase } from '@/lib/db/schema/validators';
import type { ContentBlock } from '@/lib/db/schema/phases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhaseHeader } from './PhaseHeader';
import { PhaseFooter } from './PhaseFooter';

type CalloutVariant = Extract<ContentBlock, { type: 'callout' }>['variant'];

const calloutVariants: Record<CalloutVariant, string> = {
  'why-this-matters': 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/30',
  tip: 'border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/30',
  warning: 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30',
  example: 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-900/30'
};

const renderMarkdown = (content: string) => {
  const paragraphs = content.split('\n').filter(Boolean);
  return (
    <Card className="border-border/40 bg-card/60 shadow-sm">
      <CardContent className="space-y-4 text-base leading-relaxed text-foreground">
        {paragraphs.map((paragraph, idx) => (
          <p key={`${paragraph}-${idx}`}>{paragraph}</p>
        ))}
      </CardContent>
    </Card>
  );
};

const renderCallout = (block: Extract<ContentBlock, { type: 'callout' }>) => (
  <Card className={`${calloutVariants[block.variant]} border-2`}>
    <CardHeader>
      <CardTitle className="text-base font-semibold capitalize text-foreground">
        {block.variant.replace(/-/g, ' ')}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm leading-relaxed text-muted-foreground">{block.content}</p>
    </CardContent>
  </Card>
);

const renderVideo = (block: Extract<ContentBlock, { type: 'video' }>) => (
  <div className="overflow-hidden rounded-xl border border-border/50 shadow-lg">
    <iframe
      src={block.props.videoUrl}
      title={`Video block: ${block.id}`}
      className="aspect-video w-full"
      allowFullScreen
    />
    {block.props.transcript && (
      <div className="border-t border-border/50 bg-muted/50 p-4 text-sm text-muted-foreground">
        <p>{block.props.transcript}</p>
      </div>
    )}
  </div>
);

const renderActivity = (block: Extract<ContentBlock, { type: 'activity' }>) => (
  <Card className="border-dashed border-primary/40">
    <CardHeader>
      <CardTitle className="text-base font-semibold text-primary">Interactive Activity</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <p>Activity ID: {block.activityId}</p>
      <p>{block.required ? 'Required to advance' : 'Optional enrichment'}</p>
    </CardContent>
  </Card>
);

const renderImage = (block: Extract<ContentBlock, { type: 'image' }>) => (
  <figure className="overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm">
    <Image
      src={block.props.imageUrl}
      alt={block.props.alt}
      width={1200}
      height={675}
      className="h-auto w-full object-cover"
      sizes="(max-width: 768px) 100vw, 768px"
    />
    {block.props.caption && (
      <figcaption className="border-t border-border/40 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
        {block.props.caption}
      </figcaption>
    )}
  </figure>
);

const renderBlock = (block: ContentBlock): ReactNode => {
  switch (block.type) {
    case 'markdown':
      return renderMarkdown(block.content);
    case 'callout':
      return renderCallout(block);
    case 'video':
      return renderVideo(block);
    case 'activity':
      return renderActivity(block);
    case 'image':
      return renderImage(block);
    default:
      return null;
  }
};

export interface Lesson01Phase1Props {
  lesson: Lesson;
  unit: {
    title: string;
    summary?: string;
    sequence?: number;
  };
  phase: Phase;
  phases: Phase[];
  contentBlocks?: ContentBlock[];
}

export default function Lesson01Phase1({
  lesson,
  unit,
  phase,
  phases,
  contentBlocks
}: Lesson01Phase1Props) {
  const resolvedBlocks = contentBlocks ?? phase.contentBlocks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <PhaseHeader lesson={lesson} unit={{ title: unit.title }} phase={phase} phases={phases} />

      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-10">
        {unit.summary && (
          <Card className="border-border/40 bg-card/60">
            <CardContent className="space-y-4 py-6">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                Why we’re here
              </Badge>
              <p className="text-base leading-relaxed text-muted-foreground">{unit.summary}</p>
            </CardContent>
          </Card>
        )}

        {resolvedBlocks.map((block) => (
          <div key={block.id} data-block-type={block.type} data-testid={`content-block-${block.type}`}>
            {renderBlock(block)}
          </div>
        ))}
      </div>

      <PhaseFooter lesson={lesson} phase={phase} phases={phases} />
    </div>
  );
}
