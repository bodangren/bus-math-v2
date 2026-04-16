import { describe, expect, it } from 'vitest';
import { dailyPracticeInputRegistry } from '@/lib/srs/answer-inputs/registry';
import { AccountingEquationInput } from '@/components/student/answer-inputs/AccountingEquationInput';

describe('dailyPracticeInputRegistry', () => {
  it('includes accounting-equation input component', () => {
    expect(dailyPracticeInputRegistry['accounting-equation']).toBe(AccountingEquationInput);
  });

  it('does not include unimplemented families', () => {
    expect(dailyPracticeInputRegistry['unknown-family']).toBeUndefined();
    expect(dailyPracticeInputRegistry['normal-balance']).toBeUndefined();
    expect(dailyPracticeInputRegistry['classification']).toBeUndefined();
  });
});
