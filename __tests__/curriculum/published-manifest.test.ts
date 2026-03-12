import { describe, expect, it } from 'vitest';

import {
  buildPublishedCurriculumManifest,
  buildPublishedCurriculumSeedPlan,
} from '@/lib/curriculum/published-manifest';

describe('published curriculum manifest', () => {
  it('covers the full planned curriculum footprint with authored Unit 1 detail intact', () => {
    const manifest = buildPublishedCurriculumManifest();

    expect(manifest.instructionalUnitCount).toBe(8);
    expect(manifest.capstoneLessonCount).toBe(1);
    expect(manifest.lessons).toHaveLength(89);

    const unit1Lessons = manifest.lessons.filter((lesson) => lesson.unitNumber === 1);
    expect(unit1Lessons).toHaveLength(11);

    expect(manifest.lessons[0]).toMatchObject({
      slug: 'unit-1-lesson-1',
      title: 'Launch Unit: A = L + E',
      source: 'authored',
    });

    expect(unit1Lessons[0]?.activities.length).toBeGreaterThan(0);

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-2-lesson-1')).toMatchObject({
      unitNumber: 2,
      orderIndex: 1,
      source: 'generated',
    });

    expect(manifest.lessons.at(-1)).toMatchObject({
      slug: 'capstone-investor-ready-plan',
      source: 'generated',
    });
  });

  it('builds a deterministic seed plan without duplicate lesson slugs', () => {
    const seedPlan = buildPublishedCurriculumSeedPlan();
    const lessonSlugs = seedPlan.lessons.map((lesson) => lesson.slug);

    expect(seedPlan.lessons).toHaveLength(89);
    expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
    expect(seedPlan.lessons.filter((lesson) => lesson.metadata?.tags?.includes('capstone'))).toHaveLength(1);
  });
});
