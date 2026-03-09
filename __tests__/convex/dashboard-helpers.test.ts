import { describe, expect, it } from 'vitest';

import { coerceNullableString, getOrCreateMapEntry } from '@/convex/dashboardHelpers';

describe('convex/dashboardHelpers', () => {
  it('normalizes undefined descriptions to null', () => {
    expect(coerceNullableString(undefined)).toBeNull();
    expect(coerceNullableString(null)).toBeNull();
    expect(coerceNullableString('Lesson summary')).toBe('Lesson summary');
  });

  it('returns an existing map entry instead of recreating it', () => {
    const units = new Map<number, { lessons: string[] }>();
    const existing = { lessons: ['Phase 1'] };

    units.set(1, existing);

    const result = getOrCreateMapEntry(units, 1, () => ({ lessons: [] }));

    expect(result).toBe(existing);
    expect(units.get(1)).toBe(existing);
  });

  it('creates and stores a map entry when one does not exist', () => {
    const units = new Map<number, { lessons: string[] }>();

    const result = getOrCreateMapEntry(units, 2, () => ({ lessons: [] }));

    expect(result).toEqual({ lessons: [] });
    expect(units.get(2)).toBe(result);
  });
});
