import {
  buildPracticeSubmissionEnvelope,
  normalizePracticeValue,
  type PracticeSubmissionEnvelope,
} from '@/lib/practice/contract';
import { practiceAccounts, type PracticeAccount } from '@/lib/practice/engine/accounts';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';

type ClassificationCategorySetKey = 'account-type' | 'statement-placement' | 'permanent-temporary';

export interface ClassificationCategory {
  id: string;
  label: string;
  description?: string;
  emoji?: string;
}

export interface ClassificationPart extends ProblemPartDefinition {
  id: string;
  kind: 'categorization';
  label: string;
  description?: string;
  targetId: string;
  details: {
    accountType: PracticeAccount['accountType'];
    normalBalance: PracticeAccount['normalBalance'];
    statementPlacement: PracticeAccount['statementPlacement'];
    retailApplicable: boolean;
    subcategory: string;
    commonConfusionPairs: string[];
  };
}

export interface ClassificationDefinition extends ProblemDefinition {
  categorySet: ClassificationCategorySetKey;
  categories: ClassificationCategory[];
  parts: ClassificationPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type ClassificationResponse = Record<string, string>;

export interface ClassificationConfig {
  mode?: ProblemDefinition['mode'];
  categorySet?: ClassificationCategorySetKey;
  itemCount?: number;
  confusionPairDensity?: number;
  evenlyDistributed?: boolean;
}

interface ClassificationPreset {
  title: string;
  stem: string;
  categories: ClassificationCategory[];
  resolveCategoryId: (account: PracticeAccount) => string;
}

interface CandidateItem {
  account: PracticeAccount;
  targetId: string;
  confusionScore: number;
  priority: number;
}

const CLASSIFICATION_PRESETS: Record<ClassificationCategorySetKey, ClassificationPreset> = {
  'account-type': {
    title: 'Classify the account type',
    stem: 'Place each account into the correct account-type category.',
    categories: [
      { id: 'asset', label: 'Assets', description: 'Resources the business owns' },
      { id: 'liability', label: 'Liabilities', description: 'Debts and obligations' },
      { id: 'equity', label: 'Equity', description: 'Owner claim on the business' },
      { id: 'revenue', label: 'Revenue', description: 'Earned inflows from operations' },
      { id: 'expense', label: 'Expenses', description: 'Costs and outflows' },
    ],
    resolveCategoryId: (account) => account.accountType,
  },
  'statement-placement': {
    title: 'Classify the statement placement',
    stem: 'Place each account into the statement where it belongs.',
    categories: [
      { id: 'balance-sheet', label: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
      { id: 'income-statement', label: 'Income Statement', description: 'Revenue and expense accounts' },
      { id: 'equity-statement', label: 'Equity Statement', description: 'Owner equity changes and closing items' },
    ],
    resolveCategoryId: (account) => account.statementPlacement,
  },
  'permanent-temporary': {
    title: 'Classify permanent and temporary accounts',
    stem: 'Place each account into permanent or temporary.',
    categories: [
      { id: 'permanent', label: 'Permanent', description: 'Carry forward after closing' },
      { id: 'temporary', label: 'Temporary', description: 'Closed at period end' },
    ],
    resolveCategoryId: (account) =>
      account.accountType === 'revenue' ||
      account.accountType === 'expense' ||
      account.id === 'dividends' ||
      account.id === 'withdrawals'
        ? 'temporary'
        : 'permanent',
  },
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getPreset(categorySet: ClassificationCategorySetKey) {
  return CLASSIFICATION_PRESETS[categorySet];
}

function buildCandidateItems(
  categorySet: ClassificationCategorySetKey,
  confusionPairDensity: number,
  rng: () => number,
): CandidateItem[] {
  const preset = getPreset(categorySet);
  const resolveCategoryId = preset.resolveCategoryId;
  const categoryByAccountId = new Map<string, string>(
    practiceAccounts.map((account) => [account.id, resolveCategoryId(account)]),
  );

  return practiceAccounts.map((account) => {
    const targetId = resolveCategoryId(account);
    const confusionScore =
      account.commonConfusionPairs?.reduce((score, confusionId) => {
        const confusionTargetId = categoryByAccountId.get(confusionId);
        return confusionTargetId && confusionTargetId !== targetId ? score + 1 : score;
      }, 0) ?? 0;

    const noise = rng();
    const priority = confusionScore * confusionPairDensity + noise * (1 - confusionPairDensity);

    return {
      account,
      targetId,
      confusionScore,
      priority,
    };
  });
}

function buildSelectionOrder(
  candidates: CandidateItem[],
  categorySet: ClassificationCategorySetKey,
  evenlyDistributed: boolean,
  rng: () => number,
  itemCount: number,
) {
  const preset = getPreset(categorySet);
  const buckets = new Map<string, CandidateItem[]>();
  for (const category of preset.categories) {
    buckets.set(
      category.id,
      candidates
        .filter((candidate) => candidate.targetId === category.id)
        .sort((left, right) => right.priority - left.priority || left.account.label.localeCompare(right.account.label)),
    );
  }

  if (!evenlyDistributed) {
    return [...candidates]
      .sort((left, right) => right.priority - left.priority || left.account.label.localeCompare(right.account.label))
      .slice(0, itemCount);
  }

  const categoryOrder = shuffle(preset.categories.map((category) => category.id), rng);
  const selected: CandidateItem[] = [];
  let progressed = true;

  while (selected.length < itemCount && progressed) {
    progressed = false;
    for (const categoryId of categoryOrder) {
      const bucket = buckets.get(categoryId);
      const next = bucket?.shift();
      if (!next) {
        continue;
      }

      selected.push(next);
      progressed = true;

      if (selected.length >= itemCount) {
        break;
      }
    }
  }

  return selected;
}

function buildParts(
  selected: CandidateItem[],
  categorySet: ClassificationCategorySetKey,
): ClassificationPart[] {
  const preset = getPreset(categorySet);

  return selected.map((candidate) => ({
    id: candidate.account.id,
    kind: 'categorization',
    label: candidate.account.label,
    description: `${candidate.account.accountType} - ${candidate.account.statementPlacement.replace('-', ' ')}`,
    prompt: `Classify ${candidate.account.label}.`,
    expectedAnswerShape: 'category-id',
    canonicalAnswer: candidate.targetId,
    explanation: `This is categorized as ${preset.categories.find((category) => category.id === candidate.targetId)?.label ?? candidate.targetId}.`,
    misconceptionTags: candidate.account.commonConfusionPairs?.map((confusionId) => `confused-with:${confusionId}`),
    hintIds: candidate.account.commonConfusionPairs,
    standardCode: candidate.account.subcategory,
    artifactTarget: candidate.targetId,
    targetId: candidate.targetId,
    details: {
      accountType: candidate.account.accountType,
      normalBalance: candidate.account.normalBalance,
      statementPlacement: candidate.account.statementPlacement,
      retailApplicable: candidate.account.retailApplicable,
      subcategory: candidate.account.subcategory,
      commonConfusionPairs: candidate.account.commonConfusionPairs ?? [],
    },
  }));
}

function getExpectedCategoryId(categorySet: ClassificationCategorySetKey, accountId: string) {
  const preset = getPreset(categorySet);
  const account = practiceAccounts.find((entry) => entry.id === accountId);
  return account ? preset.resolveCategoryId(account) : '';
}

function buildClassificationResponse(definition: ClassificationDefinition): ClassificationResponse {
  return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId]));
}

export function buildClassificationReviewFeedback(
  definition: ClassificationDefinition,
  studentResponse: ClassificationResponse,
  gradeResult: GradeResult,
) {
  const categoryLabelById = new Map(definition.categories.map((category) => [category.id, category.label]));

  return Object.fromEntries(
    gradeResult.parts.map((part) => {
      const expectedCategoryId = getExpectedCategoryId(definition.categorySet, part.partId);
      const expectedZoneLabel = categoryLabelById.get(expectedCategoryId) ?? expectedCategoryId;
      const selectedCategoryId = normalizePracticeValue(studentResponse[part.partId]);
      const selectedZoneLabel = selectedCategoryId
        ? categoryLabelById.get(selectedCategoryId) ?? selectedCategoryId
        : 'Not placed';

      return [
        part.partId,
        {
          status: part.isCorrect ? 'correct' : part.score > 0 ? 'partial' : 'incorrect',
          scoreLabel: `${part.score}/${part.maxScore}`,
          expectedZoneLabel,
          selectedZoneLabel,
          misconceptionTags: part.misconceptionTags,
          message: part.isCorrect
            ? 'Correct placement.'
            : part.score > 0
              ? `Close match: ${selectedZoneLabel}.`
              : `Expected ${expectedZoneLabel}.`,
        },
      ];
    }),
  );
}

export function buildClassificationReviewPlacements(definition: ClassificationDefinition, studentResponse: ClassificationResponse) {
  return definition.categories.reduce<Record<string, ClassificationPart[]>>((acc, category) => {
    acc[category.id] = definition.parts.filter((part) => normalizePracticeValue(studentResponse[part.id]) === category.id);
    return acc;
  }, {});
}

export const classificationFamily: ProblemFamily<ClassificationDefinition, ClassificationResponse, ClassificationConfig> = {
  generate(seed, config = {}) {
    const categorySet = config.categorySet ?? 'account-type';
    const preset = getPreset(categorySet);
    const rng = mulberry32(seed);
    const confusionPairDensity = clamp(config.confusionPairDensity ?? 0.6, 0, 1);
    const evenlyDistributed = config.evenlyDistributed ?? true;
    const candidates = buildCandidateItems(categorySet, confusionPairDensity, rng);
    const itemCount = clamp(
      config.itemCount ?? Math.max(preset.categories.length * 2, preset.categories.length),
      preset.categories.length,
      candidates.length,
    );
    const selected = buildSelectionOrder(candidates, categorySet, evenlyDistributed, rng, itemCount);

    const parts = buildParts(selected, categorySet);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'classification',
      mode: config.mode ?? 'guided_practice',
      activityId: `classification-${categorySet}-${seed}`,
      prompt: {
        title: preset.title,
        stem: preset.stem,
      },
      categories: preset.categories,
      categorySet,
      parts,
      workedExample: parts.length > 0
        ? {
            itemId: parts[0].id,
            categoryId: parts[0].targetId,
            label: parts[0].label,
            explanation: parts[0].explanation,
          }
        : undefined,
      scaffolding: {
        showCategoryDescriptions: true,
        confusionPairDensity,
        evenlyDistributed,
      },
      grading: {
        strategy: 'exact',
        partialCredit: true,
        rubric: {
          confusionPairDensity,
          categorySet,
        },
      },
      analyticsConfig: {
        generator: 'classification-family',
        seed,
        categorySet,
        itemCount: parts.length,
        confusionPairDensity,
        evenlyDistributed,
      },
    };
  },

  solve(definition) {
    return buildClassificationResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const rawAnswer = studentResponse[part.id];
      const normalizedAnswer = normalizePracticeValue(rawAnswer);
      const isCorrect = normalizedAnswer === part.targetId;
      const expectedPartnerCategoryIds = new Set(
        (part.details.commonConfusionPairs ?? [])
          .map((confusionId) => getExpectedCategoryId(definition.categorySet, confusionId))
          .filter((categoryId) => categoryId && categoryId !== part.targetId),
      );
      const isPartial = !isCorrect && expectedPartnerCategoryIds.has(normalizedAnswer);

      return {
        partId: part.id,
        rawAnswer,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : isPartial ? 0.5 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect
          ? []
          : [
              ...(isPartial ? [`confused-with:${normalizedAnswer}`] : ['classification-error']),
              ...((part.details.commonConfusionPairs ?? []).map((confusionId) => `confused-with:${confusionId}`)),
            ],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);
    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} placements correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const categoryLabelById = new Map(definition.categories.map((category) => [category.id, category.label]));
    const placements = definition.categories.reduce<Record<string, string[]>>((acc, category) => {
      acc[category.id] = [];
      return acc;
    }, {});

    const artifactItems = definition.parts.map((part) => {
      const chosenCategoryId = normalizePracticeValue(studentResponse[part.id]);
      const chosenCategoryLabel = categoryLabelById.get(chosenCategoryId) ?? chosenCategoryId;
      const expectedCategoryLabel = categoryLabelById.get(part.targetId) ?? part.targetId;
      if (placements[chosenCategoryId]) {
        placements[chosenCategoryId].push(part.id);
      }

      return {
        id: part.id,
        label: part.label,
        description: part.description,
        details: part.details,
        expectedCategoryId: part.targetId,
        expectedCategoryLabel,
        selectedCategoryId: chosenCategoryId,
        selectedCategoryLabel: chosenCategoryLabel,
        isCorrect: chosenCategoryId === part.targetId,
      };
    });

    return buildPracticeSubmissionEnvelope({
      activityId: definition.activityId,
      mode: definition.mode,
      status: 'submitted',
      attemptNumber: 1,
      answers: studentResponse,
      parts: gradeResult.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer ?? studentResponse[part.partId],
        normalizedAnswer: part.normalizedAnswer,
        isCorrect: part.isCorrect,
        score: part.score,
        maxScore: part.maxScore,
        misconceptionTags: part.misconceptionTags,
      })),
      artifact: {
        kind: 'classification-board',
        family: definition.familyKey,
        categorySet: definition.categorySet,
        categories: definition.categories,
        placements,
        items: artifactItems,
      },
      analytics: {
        score: gradeResult.score,
        maxScore: gradeResult.maxScore,
        categorySet: definition.categorySet,
        itemCount: definition.parts.length,
      },
    });
  },
};
