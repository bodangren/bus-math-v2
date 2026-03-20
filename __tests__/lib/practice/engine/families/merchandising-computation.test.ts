import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildMerchandisingComputationReviewFeedback,
  merchandisingComputationFamily,
  type MerchandisingComputationDefinition,
  type MerchandisingComputationResponse,
} from '@/lib/practice/engine/families/merchandising-computation';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('merchandising computation family', () => {
  it('generates deterministic numeric and statement variants from the merchandising timeline', () => {
    const family: ProblemFamily<
      MerchandisingComputationDefinition,
      MerchandisingComputationResponse,
      Parameters<typeof merchandisingComputationFamily.generate>[1]
    > = merchandisingComputationFamily;

    for (const presentation of ['numeric', 'statement'] as const) {
      for (let seed = 1; seed <= 5; seed += 1) {
        const config = {
          mode: 'guided_practice' as const,
          presentation,
        };

        const definition = family.generate(seed, config);
        const repeat = family.generate(seed, config);

        expect(definition).toEqual(repeat);
        expect(definition.familyKey).toBe('merchandising-computation');
        expect(definition.presentation).toBe(presentation);
        expect(definition.timeline.role).toBe('seller');
        expect(definition.parts.length).toBeGreaterThan(0);

        if (presentation === 'numeric') {
          expect(definition.questionRows.length).toBeGreaterThan(0);
        } else {
          expect(definition.sections.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('scores numeric merchandising results and round-trips the practice envelope', () => {
    const definition = merchandisingComputationFamily.generate(2026, {
      mode: 'assessment',
      presentation: 'numeric',
      tolerance: 1,
    });

    const solution = merchandisingComputationFamily.solve(definition);
    const changedPart = definition.parts[0];
    const studentResponse: MerchandisingComputationResponse = {
      ...solution,
      [changedPart.id]: Number(solution[changedPart.id] ?? 0) + 5,
    };

    const gradeResult = merchandisingComputationFamily.grade(definition, studentResponse);
    const reviewed = buildMerchandisingComputationReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = merchandisingComputationFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBeLessThan(gradeResult.maxScore);
    expect(reviewed[changedPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected merchandising-computation envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers[changedPart.id]).toBe(studentResponse[changedPart.id]);
    expect(parsed.data.parts).toHaveLength(definition.parts.length);
  });
});
