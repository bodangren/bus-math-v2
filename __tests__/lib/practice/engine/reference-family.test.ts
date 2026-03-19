import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import { referenceAccountingEquationFamily } from '@/lib/practice/engine/reference-family';
import type { GradeResult, ProblemFamily } from '@/lib/practice/engine/types';

describe('reference accounting equation family', () => {
  it('implements the ProblemFamily contract and round-trips to a practice envelope', () => {
    const family: ProblemFamily<
      ReturnType<typeof referenceAccountingEquationFamily.generate>,
      ReturnType<typeof referenceAccountingEquationFamily.solve>,
      Parameters<typeof referenceAccountingEquationFamily.generate>[1]
    > = referenceAccountingEquationFamily;

    const definition = family.generate(21, {
      accountCount: 10,
      includeContraAccounts: true,
      capitalMode: 'ending',
      companyType: 'service',
      mode: 'assessment',
    });

    const response = family.solve(definition);
    const gradeResult: GradeResult = family.grade(definition, response);
    const envelope = family.toEnvelope(definition, response, gradeResult);

    expect(family.generate).toBeTypeOf('function');
    expect(family.solve).toBeTypeOf('function');
    expect(family.grade).toBeTypeOf('function');
    expect(family.toEnvelope).toBeTypeOf('function');

    expect(gradeResult.parts).toHaveLength(1);
    expect(gradeResult.parts[0]).toMatchObject({
      partId: 'ownerEquity',
      score: 1,
      maxScore: 1,
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected reference family envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual({ ownerEquity: response.ownerEquity });
    expect(parsed.data.parts[0]).toMatchObject({
      partId: 'ownerEquity',
      rawAnswer: response.ownerEquity,
      isCorrect: true,
    });
  });
});
