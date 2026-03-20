import { describe, expect, it } from 'vitest';

import { adjustmentEffectsFamily } from '@/lib/practice/engine/families/adjustment-effects';
import { classificationFamily } from '@/lib/practice/engine/families/classification';
import { normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';
import { transactionEffectsFamily } from '@/lib/practice/engine/families/transaction-effects';
import { transactionMatrixFamily } from '@/lib/practice/engine/families/transaction-matrix';
import { getPracticeFamily, practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';

describe('practice family registry', () => {
  it('registers the classification family by familyKey', () => {
    expect(practiceFamilyRegistry.classification).toBe(classificationFamily);
    expect(getPracticeFamily('classification')).toBe(classificationFamily);
  });

  it('registers the adjustment-effects family by familyKey', () => {
    expect(practiceFamilyRegistry['adjustment-effects']).toBe(adjustmentEffectsFamily);
    expect(getPracticeFamily('adjustment-effects')).toBe(adjustmentEffectsFamily);
  });

  it('registers the normal-balance family by familyKey', () => {
    expect(practiceFamilyRegistry['normal-balance']).toBe(normalBalanceFamily);
    expect(getPracticeFamily('normal-balance')).toBe(normalBalanceFamily);
  });

  it('registers the transaction-effects family by familyKey', () => {
    expect(practiceFamilyRegistry['transaction-effects']).toBe(transactionEffectsFamily);
    expect(getPracticeFamily('transaction-effects')).toBe(transactionEffectsFamily);
  });

  it('registers the transaction-matrix family by familyKey', () => {
    expect(practiceFamilyRegistry['transaction-matrix']).toBe(transactionMatrixFamily);
    expect(getPracticeFamily('transaction-matrix')).toBe(transactionMatrixFamily);
  });
});
