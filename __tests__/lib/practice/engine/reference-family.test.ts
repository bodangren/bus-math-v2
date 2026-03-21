import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildAccountingEquationReviewFeedback,
  referenceAccountingEquationFamily,
} from '@/lib/practice/engine/reference-family';
import type { ProblemFamily } from '@/lib/practice/engine/types';

describe('accounting equation family', () => {
  it('deterministically generates equation boards and round-trips the practice envelope', () => {
    const family: ProblemFamily<
      ReturnType<typeof referenceAccountingEquationFamily.generate>,
      ReturnType<typeof referenceAccountingEquationFamily.solve>,
      Parameters<typeof referenceAccountingEquationFamily.generate>[1]
    > = referenceAccountingEquationFamily;

    for (let seed = 1; seed <= 10; seed += 1) {
      const config = {
        companyType: 'service' as const,
        hiddenTermId: 'equity' as const,
        mode: 'guided_practice' as const,
        tolerance: 2,
      };

      const definition = family.generate(seed, config);
      const repeat = family.generate(seed, config);

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('accounting-equation');
      expect(definition.parts).toHaveLength(1);
      expect(definition.equation.assets).toBe(definition.equation.liabilities + definition.equation.equity);
      expect(definition.facts.map((fact) => fact.id)).toEqual(['assets', 'liabilities'].filter((termId) => termId !== 'equity'));
    }
  });

  it('scores within tolerance and rejects balances outside the threshold', () => {
    const definition = referenceAccountingEquationFamily.generate(2026, {
      companyType: 'retail',
      hiddenTermId: 'equity',
      mode: 'assessment',
      tolerance: 2,
    });

    const solution = referenceAccountingEquationFamily.solve(definition);
    const studentResponse = {
      equity: solution.equity! + 1,
    };
    const wrongResponse = {
      equity: solution.equity! + 5,
    };

    const gradeResult = referenceAccountingEquationFamily.grade(definition, studentResponse);
    const wrongGrade = referenceAccountingEquationFamily.grade(definition, wrongResponse);
    const reviewed = buildAccountingEquationReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = referenceAccountingEquationFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBe(gradeResult.maxScore);
    expect(wrongGrade.score).toBe(0);
    expect(reviewed.equity).toMatchObject({
      status: 'correct',
      expectedLabel: String(definition.parts[0].targetId),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected accounting-equation envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(studentResponse);
    expect(parsed.data.parts[0]).toMatchObject({
      partId: 'equity',
      isCorrect: true,
      score: 1,
    });
  });
});
