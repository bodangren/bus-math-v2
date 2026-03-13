import type { ContentBlock, PhaseMetadata } from '@/types/curriculum';

export interface PublishedLessonSectionLike {
  id?: string;
  _id?: string;
  sectionType: string;
  content: unknown;
}

const PHASE_TYPE_BY_NUMBER = {
  1: 'intro',
  2: 'example',
  3: 'practice',
  4: 'challenge',
  5: 'assessment',
  6: 'reflection',
} as const satisfies Record<number, PhaseMetadata['phaseType']>;

export function fallbackPublishedPhaseTitle(phaseNumber: number): string {
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

export function publishedPhaseMetadata(phaseNumber: number): PhaseMetadata {
  return {
    phaseType:
      PHASE_TYPE_BY_NUMBER[phaseNumber as keyof typeof PHASE_TYPE_BY_NUMBER],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as Record<string, unknown>;
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  const obj = asRecord(content);
  if (!obj) {
    return '';
  }

  const markdown = obj.markdown;
  const text = obj.text;
  const value = typeof markdown === 'string' ? markdown : text;
  return typeof value === 'string' ? value : '';
}

export function toPublishedContentBlock(
  section: PublishedLessonSectionLike,
  fallbackOrder: number,
): ContentBlock {
  const obj = asRecord(section.content);
  const blockId = section.id ?? section._id ?? `section-${fallbackOrder}`;

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

export const __private__ = {
  asRecord,
  contentToText,
};
