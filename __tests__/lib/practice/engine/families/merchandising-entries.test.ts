import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildMerchandisingEntryReviewFeedback,
  merchandisingEntriesFamily,
  merchandisingEntryScenarioCatalog,
  type MerchandisingEntryDefinition,
  type MerchandisingEntryResponse,
} from '@/lib/practice/engine/families/merchandising-entries';

describe('merchandising entries family', () => {
  it('covers seller and buyer scenarios and stays deterministic across seeds', () => {
    const expectedKinds = ['seller-timeline', 'buyer-timeline'] as const;

    expect(merchandisingEntryScenarioCatalog.map((scenario) => scenario.kind)).toEqual(expectedKinds);

    for (const [index, kind] of expectedKinds.entries()) {
      const seed = index + 7;
      const definition: MerchandisingEntryDefinition = merchandisingEntriesFamily.generate(seed, {
        scenarioKey: kind,
        mode: 'guided_practice',
      });
      const repeat = merchandisingEntriesFamily.generate(seed, {
        scenarioKey: kind,
        mode: 'guided_practice',
      });

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('merchandising-entries');
      expect(definition.scenario.kind).toBe(kind);
      expect(definition.journalLines.length).toBeGreaterThan(0);
      expect(definition.parts).toHaveLength(definition.journalLines.length);
      expect(definition.scenario.focus).toContain(kind === 'seller-timeline' ? 'seller-side' : 'buyer');
    }
  });

  it('round-trips the envelope and accepts equivalent journal-entry order', () => {
    const definition: MerchandisingEntryDefinition = merchandisingEntriesFamily.generate(2026, {
      scenarioKey: 'seller-timeline',
      mode: 'assessment',
    });

    const solution = merchandisingEntriesFamily.solve(definition);
    const studentResponse: MerchandisingEntryResponse = [solution[1], solution[0], ...solution.slice(2)];
    const gradeResult = merchandisingEntriesFamily.grade(definition, studentResponse);
    const feedback = buildMerchandisingEntryReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = merchandisingEntriesFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBe(gradeResult.maxScore);
    expect(feedback['line-1']).toMatchObject({
      status: 'partial',
      message: expect.stringContaining('Accepted equivalent ordering'),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected merchandising-entries envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.artifact).toMatchObject({
      kind: 'merchandising-entry-recording',
      family: 'merchandising-entries',
      scenario: expect.objectContaining({
        kind: 'seller-timeline',
      }),
    });
  });
});
