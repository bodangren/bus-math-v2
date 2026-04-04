import { describe, expect, it } from 'vitest';

import {
  MISCONCEPTION_TAGS,
  allMisconceptionTagSlugs,
  getMisconceptionTag,
  isCanonicalMisconceptionTag,
  misconceptionTags,
} from '@/lib/practice/misconception-taxonomy';

describe('misconception taxonomy', () => {
  it('defines all 8 canonical tags from the plan', () => {
    const expected = [
      'debit-credit-reversal',
      'omitted-entry',
      'wrong-normal-balance',
      'sign-error',
      'classification-error',
      'wrong-account-type',
      'computation-error',
      'incomplete-entry',
    ] as const;

    for (const slug of expected) {
      expect(MISCONCEPTION_TAGS[slug]).toBeDefined();
      expect(MISCONCEPTION_TAGS[slug].slug).toBe(slug);
      expect(MISCONCEPTION_TAGS[slug].label.length).toBeGreaterThan(0);
      expect(MISCONCEPTION_TAGS[slug].description.length).toBeGreaterThan(0);
      expect(['mechanics', 'classification', 'computation', 'completeness']).toContain(
        MISCONCEPTION_TAGS[slug].category,
      );
    }
  });

  it('getMisconceptionTag returns definition for valid slugs', () => {
    const tag = getMisconceptionTag('sign-error');
    expect(tag).toBeDefined();
    expect(tag?.slug).toBe('sign-error');
    expect(tag?.category).toBe('computation');
  });

  it('getMisconceptionTag returns undefined for unknown slugs', () => {
    expect(getMisconceptionTag('not-a-real-tag')).toBeUndefined();
  });

  it('isCanonicalMisconceptionTag guards correctly', () => {
    expect(isCanonicalMisconceptionTag('classification-error')).toBe(true);
    expect(isCanonicalMisconceptionTag('arbitrary-string')).toBe(false);
  });

  it('allMisconceptionTagSlugs returns every key', () => {
    const slugs = allMisconceptionTagSlugs();
    expect(slugs).toHaveLength(Object.keys(MISCONCEPTION_TAGS).length);
    for (const slug of slugs) {
      expect(isCanonicalMisconceptionTag(slug)).toBe(true);
    }
  });

  it('misconceptionTags helper prepends canonical tags before context tags', () => {
    const tags = misconceptionTags('computation-error', 'family-context:foo', 'section-error');
    expect(tags[0]).toBe('computation-error');
    expect(tags).toContain('family-context:foo');
    expect(tags).toContain('section-error');
    expect(tags).toHaveLength(3);
  });

  it('misconceptionTags helper accepts arrays of canonical tags', () => {
    const tags = misconceptionTags(['sign-error', 'computation-error'], 'context-tag');
    expect(tags[0]).toBe('sign-error');
    expect(tags[1]).toBe('computation-error');
    expect(tags[2]).toBe('context-tag');
    expect(tags).toHaveLength(3);
  });
});
