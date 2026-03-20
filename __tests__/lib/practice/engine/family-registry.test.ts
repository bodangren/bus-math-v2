import { describe, expect, it } from 'vitest';

import { adjustmentEffectsFamily } from '@/lib/practice/engine/families/adjustment-effects';
import { classificationFamily } from '@/lib/practice/engine/families/classification';
import { normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';
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
});
