import { describe, expect, it } from 'vitest';

import { classificationFamily } from '@/lib/practice/engine/families/classification';
import { getPracticeFamily, practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';

describe('practice family registry', () => {
  it('registers the classification family by familyKey', () => {
    expect(practiceFamilyRegistry.classification).toBe(classificationFamily);
    expect(getPracticeFamily('classification')).toBe(classificationFamily);
  });
});
