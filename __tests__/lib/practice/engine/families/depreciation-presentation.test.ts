import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildDepreciationPresentationReviewFeedback,
  depreciationPresentationFamily,
  type DepreciationPresentationDefinition,
  type DepreciationPresentationResponse,
} from '@/lib/practice/engine/families/depreciation-presentation';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('depreciation presentation family', () => {
  it('generates deterministic direct and derived presentation variants with land contrast cases', () => {
    const family: ProblemFamily<
      DepreciationPresentationDefinition,
      DepreciationPresentationResponse,
      Parameters<typeof depreciationPresentationFamily.generate>[1]
    > = depreciationPresentationFamily;

    for (const layout of ['direct', 'derived'] as const) {
      for (let seed = 1; seed <= 5; seed += 1) {
        const config = {
          mode: 'guided_practice' as const,
          layout,
        };

        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('depreciation-presentation');
        expect(definition.layout).toBe(layout);
        expect(definition.assetRegister.some((item) => item.isLand)).toBe(true);
        expect(definition.parts.length).toBeGreaterThan(0);
        expect(definition.sections.length).toBeGreaterThan(0);

        if (layout === 'direct') {
          expect(definition.parts.some((part) => part.details.rowRole === 'net-presentation')).toBe(true);
        } else {
          expect(definition.parts.some((part) => part.details.rowRole === 'accumulated-depreciation')).toBe(true);
        }
      }
    }
  });

  it('scores presentation rows and round-trips the practice envelope', () => {
    const definition = depreciationPresentationFamily.generate(2026, {
      mode: 'assessment',
      layout: 'derived',
      tolerance: 1,
    });

    const solution = depreciationPresentationFamily.solve(definition);
    const changedPart = definition.parts[0];
    const studentResponse: DepreciationPresentationResponse = {
      ...solution,
      [changedPart.id]: Number(solution[changedPart.id] ?? 0) + 2,
    };

    const gradeResult = depreciationPresentationFamily.grade(definition, studentResponse);
    const reviewed = buildDepreciationPresentationReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = depreciationPresentationFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[changedPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected depreciation-presentation envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers[changedPart.id]).toBe(studentResponse[changedPart.id]);
    expect(parsed.data.parts).toHaveLength(definition.parts.length);
  });

  it('includes full depreciation chain in feedback for derived layout', () => {
    const definition = depreciationPresentationFamily.generate(2026, {
      mode: 'assessment',
      layout: 'derived',
      tolerance: 1,
    });

    const solution = depreciationPresentationFamily.solve(definition);
    const accumulatedPart = definition.parts.find((part) => part.details.rowRole === 'accumulated-depreciation');
    if (!accumulatedPart) {
      throw new Error('Expected accumulated-depreciation part in derived layout');
    }

    const studentResponse: DepreciationPresentationResponse = {
      ...solution,
      [accumulatedPart.id]: Number(solution[accumulatedPart.id] ?? 0) + 100,
    };

    const gradeResult = depreciationPresentationFamily.grade(definition, studentResponse);
    const reviewed = buildDepreciationPresentationReviewFeedback(definition, studentResponse, gradeResult);

    expect(reviewed[accumulatedPart.id].message).toContain('$');
    expect(reviewed[accumulatedPart.id].message).toMatch(/\(.*\$[\d,]+.*−.*\$[\d,]+.*\).*÷.*\d+.*×.*\d+.*=.*\$[\d,]+/);
  });

  it('includes net book value chain in feedback for direct layout', () => {
    const definition = depreciationPresentationFamily.generate(2026, {
      mode: 'assessment',
      layout: 'direct',
      tolerance: 1,
    });

    const solution = depreciationPresentationFamily.solve(definition);
    const netBookValuePart = definition.parts.find((part) => part.details.rowRole === 'net-presentation');
    if (!netBookValuePart) {
      throw new Error('Expected net-presentation part in direct layout');
    }

    const studentResponse: DepreciationPresentationResponse = {
      ...solution,
      [netBookValuePart.id]: Number(solution[netBookValuePart.id] ?? 0) + 100,
    };

    const gradeResult = depreciationPresentationFamily.grade(definition, studentResponse);
    const reviewed = buildDepreciationPresentationReviewFeedback(definition, studentResponse, gradeResult);

    expect(reviewed[netBookValuePart.id].message).toContain('$');
    expect(reviewed[netBookValuePart.id].message).toMatch(/\$[\d,]+.*−.*\$[\d,]+.*=.*\$[\d,]+/);
  });
});
