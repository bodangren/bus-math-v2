import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  adjustingCalculationsFamily,
  buildAdjustingCalculationsReviewFeedback,
  type AdjustingCalculationsDefinition,
  type AdjustingCalculationsJournalLine,
  type AdjustingCalculationsResponse,
} from '@/lib/practice/engine/families/adjusting-calculations';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('adjusting calculations family', () => {
  it('generates deterministic calculation and journal-entry variants across the adjustment scenarios', () => {
    const family: ProblemFamily<
      AdjustingCalculationsDefinition,
      AdjustingCalculationsResponse,
      Parameters<typeof adjustingCalculationsFamily.generate>[1]
    > = adjustingCalculationsFamily;

    for (const presentation of ['calculation', 'journal-entry'] as const) {
      for (const scenarioKind of ['deferral', 'accrual', 'depreciation'] as const) {
        for (let seed = 1; seed <= 5; seed += 1) {
          const config = {
            mode: 'guided_practice' as const,
            presentation,
            scenarioKind,
          };

          const definition = family.generate(seed, config);
          const repeat = family.generate(seed, config);

          expect(definition).toEqual(repeat);
          expect(definition.familyKey).toBe('adjusting-calculations');
          expect(definition.presentation).toBe(presentation);
          expect(definition.scenario.kind).toBe(scenarioKind);
          expect(definition.parts.length).toBeGreaterThan(0);

          if (presentation === 'calculation') {
            expect(definition.parts.every((part) => part.kind === 'numeric')).toBe(true);
          } else {
            expect(definition.entryLines?.length).toBeGreaterThan(0);
            expect(definition.parts.every((part) => part.kind === 'journal-entry')).toBe(true);
          }
        }
      }
    }
  });

  it('scores the calculation answer and journal entry rows, then round-trips the envelope', () => {
    const calculationDefinition = adjustingCalculationsFamily.generate(2026, {
      mode: 'assessment',
      presentation: 'calculation',
      scenarioKind: 'deferral',
      tolerance: 1,
    });
    const calculationSolution = adjustingCalculationsFamily.solve(calculationDefinition);
    const calculationPart = calculationDefinition.parts[0];
    const calculationResponse: AdjustingCalculationsResponse = {
      ...calculationSolution,
      [calculationPart.id]: Number(calculationSolution[calculationPart.id] ?? 0) + 2,
    };

    const calculationGrade = adjustingCalculationsFamily.grade(calculationDefinition, calculationResponse);
    const calculationFeedback = buildAdjustingCalculationsReviewFeedback(
      calculationDefinition,
      calculationResponse,
      calculationGrade,
    );
    const calculationEnvelope = adjustingCalculationsFamily.toEnvelope(
      calculationDefinition,
      calculationResponse,
      calculationGrade,
    );

    expect(calculationGrade.score).toBeLessThan(calculationGrade.maxScore);
    expect(calculationFeedback[calculationPart.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const calculationParsed = practiceSubmissionEnvelopeSchema.safeParse(calculationEnvelope);
    expect(calculationParsed.success).toBe(true);
    if (!calculationParsed.success) {
      throw new Error('Expected adjusting-calculations calculation envelope to parse');
    }

    expect(calculationParsed.data.contractVersion).toBe('practice.v1');
    expect(calculationParsed.data.answers[calculationPart.id]).toBe(calculationResponse[calculationPart.id]);

    const entryDefinition = adjustingCalculationsFamily.generate(2026, {
      mode: 'assessment',
      presentation: 'journal-entry',
      scenarioKind: 'depreciation',
      tolerance: 1,
    });
    const entrySolution = adjustingCalculationsFamily.solve(entryDefinition);
    const entryLine = entryDefinition.parts[0];
    const solutionLine = entrySolution[entryLine.id] as AdjustingCalculationsJournalLine;
    const entryResponse: AdjustingCalculationsResponse = {
      ...entrySolution,
      [entryLine.id]: {
        ...solutionLine,
        memo: 'Wrong memo',
      },
    };

    const entryGrade = adjustingCalculationsFamily.grade(entryDefinition, entryResponse);
    const entryFeedback = buildAdjustingCalculationsReviewFeedback(entryDefinition, entryResponse, entryGrade);
    const entryEnvelope = adjustingCalculationsFamily.toEnvelope(entryDefinition, entryResponse, entryGrade);

    expect(entryGrade.score).toBeLessThan(entryGrade.maxScore);
    expect(entryFeedback[entryLine.id]).toMatchObject({
      status: 'incorrect',
      expectedLabel: expect.any(String),
    });

    const entryParsed = practiceSubmissionEnvelopeSchema.safeParse(entryEnvelope);
    expect(entryParsed.success).toBe(true);
    if (!entryParsed.success) {
      throw new Error('Expected adjusting-calculations journal-entry envelope to parse');
    }

    expect(entryParsed.data.contractVersion).toBe('practice.v1');
    expect(entryParsed.data.answers[entryLine.id]).toMatchObject({
      memo: 'Wrong memo',
    });
    expect(entryParsed.data.parts).toHaveLength(entryDefinition.parts.length);
  });
});
