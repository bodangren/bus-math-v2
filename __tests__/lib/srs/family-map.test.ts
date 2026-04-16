import { describe, it, expect } from 'vitest';
import { getProblemFamilyId, getFamilyForProblemFamilyId, getAllProblemFamilyIds } from '../../../lib/srs/family-map';

describe('lib/srs/family-map', () => {
  it('getProblemFamilyId returns the family key directly', () => {
    expect(getProblemFamilyId('accounting-equation')).toBe('accounting-equation');
    expect(getProblemFamilyId('transaction-effects')).toBe('transaction-effects');
  });

  it('getFamilyForProblemFamilyId returns key for registered families', () => {
    expect(getFamilyForProblemFamilyId('accounting-equation')).toBe('accounting-equation');
    expect(getFamilyForProblemFamilyId('cvp-analysis')).toBe('cvp-analysis');
  });

  it('getFamilyForProblemFamilyId returns null for unknown families', () => {
    expect(getFamilyForProblemFamilyId('unknown-family')).toBeNull();
  });

  it('roundtrip: getFamilyForProblemFamilyId(getProblemFamilyId(key)) === key', () => {
    const allIds = getAllProblemFamilyIds();
    for (const key of allIds) {
      expect(getFamilyForProblemFamilyId(getProblemFamilyId(key))).toBe(key);
    }
  });

  it('getAllProblemFamilyIds returns all registered families', () => {
    const ids = getAllProblemFamilyIds();
    expect(ids).toContain('accounting-equation');
    expect(ids).toContain('transaction-effects');
    expect(ids).toContain('cvp-analysis');
    expect(ids.length).toBeGreaterThan(15);
  });

  it('unknown family key does not crash', () => {
    expect(getProblemFamilyId('some-random-key')).toBe('some-random-key');
    expect(getFamilyForProblemFamilyId('some-random-key')).toBeNull();
  });
});