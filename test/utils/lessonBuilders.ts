import type { Lesson, Phase } from '@/lib/db/schema/validators';
import type { ContentBlock, PhaseMetadata } from '@/lib/db/schema/phases';

type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends object ? PartialDeep<T[K]> : T[K];
};

const baseDate = new Date('2024-01-01T00:00:00Z');

export const createLesson = (overrides: PartialDeep<Lesson> = {}): Lesson => {
  const {
    metadata: metadataOverrides,
    createdAt,
    updatedAt,
    ...rest
  } = overrides;

  return {
    id: 'lesson-001',
    unitNumber: 1,
    title: 'Balance Ledgers with Confidence',
    slug: 'unit01-lesson01',
    description: 'Students learn how Sarah stabilized her books using structured ledgers.',
    learningObjectives: [
      'Diagnose Sarah\'s accounting gaps with structured data review.',
      'Translate financial stories into spreadsheet automations.'
    ],
    orderIndex: 1,
    currentVersionId: null,
    metadata: {
      duration: 90,
      difficulty: 'beginner',
      tags: ['ledger design', 'accounting equation', 'professional polish'],
      ...(metadataOverrides ?? {})
    },
    createdAt: (createdAt as Date) ?? baseDate,
    updatedAt: (updatedAt as Date) ?? baseDate,
    ...rest
  };
};

export const createPhase = (overrides: PartialDeep<Phase> = {}): Phase => {
  const {
    metadata: metadataOverrides,
    createdAt,
    updatedAt,
    contentBlocks,
    ...rest
  } = overrides;

  return {
    id: overrides.id ?? `phase-${overrides.phaseNumber ?? 1}`,
    lessonId: overrides.lessonId ?? 'lesson-001',
    phaseNumber: overrides.phaseNumber ?? 1,
    title: overrides.title ?? 'Hook: Sarah’s Ledger Crisis',
    contentBlocks: (contentBlocks as ContentBlock[] | undefined) ?? [
      {
        id: 'block-markdown',
        type: 'markdown',
        content: 'Students meet Sarah and identify the stakes.'
      }
    ],
    estimatedMinutes: overrides.estimatedMinutes ?? 15,
    metadata: {
      phaseType: 'intro',
      color: '#2563eb',
      icon: 'PlayCircle',
      ...((metadataOverrides ?? {}) as PhaseMetadata)
    },
    createdAt: (createdAt as Date) ?? baseDate,
    updatedAt: (updatedAt as Date) ?? baseDate,
    ...rest
  };
};

export const createContentBlocks = (blocks: ContentBlock[]): ContentBlock[] => blocks;
