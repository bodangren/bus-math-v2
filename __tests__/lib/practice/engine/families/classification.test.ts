import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import { practiceAccounts } from '@/lib/practice/engine/accounts';
import {
  buildClassificationReviewFeedback,
  classificationFamily,
  type ClassificationDefinition,
  type ClassificationResponse,
} from '@/lib/practice/engine/families/classification';
import type { ProblemFamily } from '@/lib/practice/engine/types';

function resolveCategoryId(categorySet: ClassificationDefinition['categorySet'], accountId: string) {
  const account = practiceAccounts.find((entry) => entry.id === accountId);
  if (!account) {
    return '';
  }

  if (categorySet === 'account-type') {
    return account.accountType;
  }

  if (categorySet === 'statement-placement') {
    return account.statementPlacement;
  }

  return account.accountType === 'revenue' || account.accountType === 'expense' || account.id === 'dividends' || account.id === 'withdrawals'
    ? 'temporary'
    : 'permanent';
}

describe('classification family', () => {
  it('generates deterministic, balanced account-type boards across multiple seeds', () => {
    const family: ProblemFamily<
      ClassificationDefinition,
      ClassificationResponse,
      Parameters<typeof classificationFamily.generate>[1]
    > = classificationFamily;

    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        categorySet: 'account-type' as const,
        itemCount: 10,
        confusionPairDensity: 0.75,
        evenlyDistributed: true,
        mode: 'guided_practice' as const,
      };

      const definition = family.generate(seed, config);
      const repeat = family.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.parts).toHaveLength(10);
      expect(definition.categories).toHaveLength(5);
      expect(new Set(definition.parts.map((part) => part.targetId))).toEqual(new Set(definition.categories.map((category) => category.id)));

      const counts = definition.parts.reduce<Record<string, number>>((acc, part) => {
        acc[part.targetId] = (acc[part.targetId] ?? 0) + 1;
        return acc;
      }, {});

      const values = Object.values(counts);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
      expect(definition.parts.every((part) => part.details.commonConfusionPairs.length >= 0)).toBe(true);
    }
  });

  it('supports statement-placement generation, partial credit, and envelope round-tripping', () => {
    const definition = classificationFamily.generate(24, {
      categorySet: 'statement-placement',
      itemCount: 6,
      confusionPairDensity: 1,
      evenlyDistributed: false,
      mode: 'assessment',
    });

    const response = classificationFamily.solve(definition);
    const confusedPart = definition.parts.find((part) =>
      part.details.commonConfusionPairs.some((confusionId) => resolveCategoryId(definition.categorySet, confusionId) !== part.targetId),
    );

    expect(confusedPart).toBeDefined();
    if (!confusedPart) {
      throw new Error('Expected a part with a cross-category confusion pair');
    }

    const confusionId = confusedPart.details.commonConfusionPairs.find((candidateId) => {
      const confusionCategoryId = resolveCategoryId(definition.categorySet, candidateId);
      return confusionCategoryId && confusionCategoryId !== confusedPart.targetId;
    });

    expect(confusionId).toBeDefined();
    if (!confusionId) {
      throw new Error('Expected a usable confusion partner');
    }

    const studentResponse: ClassificationResponse = {
      ...response,
      [confusedPart.id]: resolveCategoryId(definition.categorySet, confusionId),
    };

    const gradeResult = classificationFamily.grade(definition, studentResponse);
    const reviewed = buildClassificationReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = classificationFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeGreaterThan(0);
    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(gradeResult.parts.some((part) => part.partId === confusedPart.id && part.score === 0.5)).toBe(true);
    expect(reviewed[confusedPart.id]).toMatchObject({
      status: 'partial',
      expectedZoneLabel: expect.any(String),
      selectedZoneLabel: expect.any(String),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected classification envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.artifact).toMatchObject({
      kind: 'classification-board',
      family: 'classification',
      categorySet: 'statement-placement',
    });
  });

  it('emits canonical classification-error tag when student places an account in the wrong category', () => {
    const definition = classificationFamily.generate(42, {
      categorySet: 'account-type',
      itemCount: 6,
      mode: 'assessment',
    });

    const solution = classificationFamily.solve(definition);
    const wrongPart = definition.parts[0];
    const wrongCategories = definition.categories.filter((cat) => cat.id !== wrongPart.targetId);
    const wrongResponse: ClassificationResponse = {
      ...solution,
      [wrongPart.id]: wrongCategories[0].id,
    };

    const gradeResult = classificationFamily.grade(definition, wrongResponse);
    const partResult = gradeResult.parts.find((p) => p.partId === wrongPart.id);

    expect(partResult).toBeDefined();
    expect(partResult?.isCorrect).toBe(false);
    expect(partResult?.misconceptionTags).toContain('classification-error');
  });
});
