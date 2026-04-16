import { describe, it, expect } from 'vitest';
import {
  computeComponentContentHash,
  resolveComponentKind,
  type HashableComponent,
} from '@/lib/activities/content-hash';

describe('computeComponentContentHash', () => {
  it('returns same hash for identical inputs', async () => {
    const component: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { title: 'Test', count: 5 },
    };
    const hash1 = await computeComponentContentHash(component);
    const hash2 = await computeComponentContentHash(component);
    expect(hash1).toBe(hash2);
  });

  it('returns different hash when props change', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { title: 'Test A' },
    };
    const component2: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { title: 'Test B' },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('returns different hash when componentKind changes', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { title: 'Test' },
    };
    const component2: HashableComponent = {
      componentKind: 'practice',
      componentKey: 'comprehension-quiz',
      props: { title: 'Test' },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('returns different hash when componentKey changes', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { title: 'Test' },
    };
    const component2: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'tiered-assessment',
      props: { title: 'Test' },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });

  it('handles undefined/empty props gracefully', async () => {
    const component: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
    };
    const hash = await computeComponentContentHash(component);
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64);
  });

  it('produces consistent hash regardless of key ordering', async () => {
    const component1: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { a: 1, b: 2, c: 3 },
    };
    const component2: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: { c: 3, a: 1, b: 2 },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).toBe(hash2);
  });

  it('handles deeply nested props', async () => {
    const component: HashableComponent = {
      componentKind: 'activity',
      componentKey: 'comprehension-quiz',
      props: {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      },
    };
    const hash = await computeComponentContentHash(component);
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64);
  });

  it('includes gradingConfig in hash when provided', async () => {
    const component1: HashableComponent = {
      componentKind: 'practice',
      componentKey: 'markup-margin-mastery',
      props: { title: 'Test' },
      gradingConfig: { points: 40 },
    };
    const component2: HashableComponent = {
      componentKind: 'practice',
      componentKey: 'markup-margin-mastery',
      props: { title: 'Test' },
      gradingConfig: { points: 50 },
    };
    const hash1 = await computeComponentContentHash(component1);
    const hash2 = await computeComponentContentHash(component2);
    expect(hash1).not.toBe(hash2);
  });
});

describe('resolveComponentKind', () => {
  it('maps worked_example to example', () => {
    expect(resolveComponentKind('worked_example')).toBe('example');
  });

  it('maps guided_practice to practice', () => {
    expect(resolveComponentKind('guided_practice')).toBe('practice');
  });

  it('maps independent_practice to practice', () => {
    expect(resolveComponentKind('independent_practice')).toBe('practice');
  });

  it('maps assessment to practice', () => {
    expect(resolveComponentKind('assessment')).toBe('practice');
  });

  it('maps explore to activity', () => {
    expect(resolveComponentKind('explore')).toBe('activity');
  });

  it('maps learn to activity', () => {
    expect(resolveComponentKind('learn')).toBe('activity');
  });

  it('maps discourse to activity', () => {
    expect(resolveComponentKind('discourse')).toBe('activity');
  });

  it('maps vocabulary to activity', () => {
    expect(resolveComponentKind('vocabulary')).toBe('activity');
  });

  it('maps reflection to activity', () => {
    expect(resolveComponentKind('reflection')).toBe('activity');
  });

  it('maps key_concept to activity', () => {
    expect(resolveComponentKind('key_concept')).toBe('activity');
  });

  it('maps unknown phase types to activity', () => {
    expect(resolveComponentKind('some_unknown_phase')).toBe('activity');
  });
});