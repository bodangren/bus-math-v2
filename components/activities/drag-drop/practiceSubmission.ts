import {
  buildPracticeSubmissionEnvelope,
  buildPracticeSubmissionParts,
  normalizePracticeValue,
  type PracticeSubmissionEnvelope,
} from '@/lib/practice/contract';

type CategorizationItem = {
  id: string;
  targetId: string;
};

type ItemMetadata = {
  label: string;
  description?: string;
  details?: Record<string, unknown>;
};

type ZoneMetadata = {
  id: string;
  label: string;
  description?: string;
};

type PracticeMode = 'worked_example' | 'guided_practice' | 'independent_practice' | 'assessment';

export type CategorizationSupportedModes = readonly ['guided_practice', 'independent_practice'];
export const CATEGORIZATION_SUPPORTED_MODES = ['guided_practice', 'independent_practice'] as const satisfies CategorizationSupportedModes;
export const SEQUENCE_SUPPORTED_MODES = ['independent_practice'] as const;

function buildItemDetails<T extends { id: string; targetId?: string }>(
  item: T,
  describeItem: (item: T) => ItemMetadata,
) {
  const metadata = describeItem(item);
  return {
    id: item.id,
    ...(item.targetId ? { targetId: item.targetId } : {}),
    label: metadata.label,
    description: metadata.description,
    details: metadata.details,
  };
}

export function buildCategorizationPracticeSubmission<T extends CategorizationItem>(args: {
  activityId: string;
  mode: PracticeMode;
  attemptNumber: number;
  completedAt: Date | string;
  family: string;
  artifactKind: string;
  items: T[];
  placements: Record<string, T[]>;
  zones: ZoneMetadata[];
  describeItem: (item: T) => ItemMetadata;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
}): PracticeSubmissionEnvelope {
  const answers = Object.fromEntries(
    args.zones.map((zone) => [zone.id, (args.placements[zone.id] ?? []).map((item) => item.id)]),
  );

  const expectedByZone = args.items.reduce<Record<string, string[]>>((acc, item) => {
    const bucket = acc[item.targetId] ?? [];
    bucket.push(item.id);
    acc[item.targetId] = bucket;
    return acc;
  }, {});

  const parts = buildPracticeSubmissionParts(answers).map((part) => {
    const expected = expectedByZone[part.partId] ?? [];
    const isCorrect = normalizePracticeValue(part.rawAnswer) === normalizePracticeValue(expected);

    return {
      ...part,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    };
  });

  return buildPracticeSubmissionEnvelope({
    activityId: args.activityId,
    mode: args.mode,
    status: 'submitted',
    attemptNumber: args.attemptNumber,
    submittedAt: args.completedAt,
    answers,
    parts,
    artifact: {
      kind: args.artifactKind,
      family: args.family,
      zones: args.zones.map((zone) => ({
        ...zone,
        itemIds: (args.placements[zone.id] ?? []).map((item) => item.id),
        items: (args.placements[zone.id] ?? []).map((item) => buildItemDetails(item, args.describeItem)),
      })),
      items: args.items.map((item) => buildItemDetails(item, args.describeItem)),
    },
    interactionHistory: args.interactionHistory,
    analytics: {
      totalItems: args.items.length,
      totalZones: args.zones.length,
      ...args.analytics,
    },
  });
}

export function buildSequentialPracticeSubmission<T extends { id: string }>(args: {
  activityId: string;
  mode: PracticeMode;
  attemptNumber: number;
  completedAt: Date | string;
  family: string;
  artifactKind: string;
  arrangement: T[];
  expectedOrder: string[];
  describeItem: (item: T) => ItemMetadata;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
}): PracticeSubmissionEnvelope {
  const answers = {
    arrangement: args.arrangement.map((item) => item.id),
  };

  const parts = args.arrangement.map((item, index) => {
    const expectedId = args.expectedOrder[index];
    const isCorrect = item.id === expectedId;

    return {
      partId: item.id,
      rawAnswer: {
        position: index + 1,
        itemId: item.id,
      },
      normalizedAnswer: `${index + 1}:${item.id}`,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    };
  });

  return buildPracticeSubmissionEnvelope({
    activityId: args.activityId,
    mode: args.mode,
    status: 'submitted',
    attemptNumber: args.attemptNumber,
    submittedAt: args.completedAt,
    answers,
    parts,
    artifact: {
      kind: args.artifactKind,
      family: args.family,
      expectedOrder: args.expectedOrder,
      arrangement: args.arrangement.map((item, index) => ({
        position: index + 1,
        ...buildItemDetails(item, args.describeItem),
      })),
    },
    interactionHistory: args.interactionHistory,
    analytics: {
      totalItems: args.arrangement.length,
      ...args.analytics,
    },
  });
}
