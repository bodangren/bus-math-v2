import { describe, expect, it } from 'vitest';
import { dailyPracticeInputRegistry } from '@/lib/srs/answer-inputs/registry';
import { AccountingEquationInput } from '@/components/student/answer-inputs/AccountingEquationInput';
import { NormalBalanceInput } from '@/components/student/answer-inputs/NormalBalanceInput';

describe('dailyPracticeInputRegistry', () => {
  it('includes accounting-equation input component', () => {
    expect(dailyPracticeInputRegistry['accounting-equation']).toBe(AccountingEquationInput);
  });

  it('includes normal-balance input component', () => {
    expect(dailyPracticeInputRegistry['normal-balance']).toBe(NormalBalanceInput);
  });

  it('does not include unimplemented families', () => {
    expect(dailyPracticeInputRegistry['unknown-family']).toBeUndefined();
    expect(dailyPracticeInputRegistry['classification']).toBeUndefined();
  });
});
