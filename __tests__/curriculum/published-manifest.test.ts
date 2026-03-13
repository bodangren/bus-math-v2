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
      source: 'authored',
    });

    expect(manifest.lessons.at(-1)).toMatchObject({
      slug: 'capstone-investor-ready-plan',
      source: 'generated',
    });
  });

  it('publishes Units 2-4 as authored Wave 1 curriculum instead of generated placeholders', () => {
    const manifest = buildPublishedCurriculumManifest();
    const wave1Lessons = manifest.lessons.filter((lesson) => lesson.unitNumber >= 2 && lesson.unitNumber <= 4);

    expect(wave1Lessons).toHaveLength(33);
    expect(new Set(wave1Lessons.map((lesson) => lesson.source))).toEqual(new Set(['authored']));

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-2-lesson-1')).toMatchObject({
      source: 'authored',
      title: 'Launch the Transaction Trail',
    });

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-3-lesson-8')).toMatchObject({
      source: 'authored',
      lessonType: 'project_sprint',
    });

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-4-lesson-11')).toMatchObject({
      source: 'authored',
      lessonType: 'summative_mastery',
    });
  });

  it('builds a deterministic seed plan without duplicate lesson slugs', () => {
    const seedPlan = buildPublishedCurriculumSeedPlan();
    const lessonSlugs = seedPlan.lessons.map((lesson) => lesson.slug);

    expect(seedPlan.lessons).toHaveLength(89);
    expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
    expect(seedPlan.lessons.filter((lesson) => lesson.metadata?.tags?.includes('capstone'))).toHaveLength(1);
  });

  it('keeps Unit 1 as the canonical archetype exemplar set', () => {
    const manifest = buildPublishedCurriculumManifest();
    const unit1Lessons = manifest.lessons.filter((lesson) => lesson.unitNumber === 1);

    expect(
      new Set(unit1Lessons.map((lesson) => lesson.lessonType)),
    ).toEqual(new Set(['core_instruction', 'project_sprint', 'summative_mastery']));

    expect(
      unit1Lessons
        .filter((lesson) => lesson.lessonType === 'project_sprint')
        .map((lesson) => lesson.phases.map((phase) => phase.phaseKey)),
    ).toEqual([
      ['brief', 'workshop', 'checkpoint', 'reflection'],
      ['brief', 'workshop', 'checkpoint', 'reflection'],
      ['brief', 'workshop', 'checkpoint', 'reflection'],
    ]);

    expect(
      unit1Lessons.find((lesson) => lesson.lessonType === 'summative_mastery')?.phases.map(
        (phase) => phase.phaseKey,
      ),
    ).toEqual(['directions', 'assessment', 'review']);
  });

  it('keeps Wave 1 authored lessons aligned to the canonical archetype phase sequences', () => {
    const manifest = buildPublishedCurriculumManifest();
    const sampleLessons = [
      manifest.lessons.find((lesson) => lesson.slug === 'unit-2-lesson-1'),
      manifest.lessons.find((lesson) => lesson.slug === 'unit-2-lesson-8'),
      manifest.lessons.find((lesson) => lesson.slug === 'unit-3-lesson-11'),
      manifest.lessons.find((lesson) => lesson.slug === 'unit-4-lesson-9'),
    ];

    expect(sampleLessons[0]?.phases.map((phase) => phase.phaseKey)).toEqual([
      'hook',
      'instruction',
      'guided_practice',
      'independent_practice',
      'assessment',
      'reflection',
    ]);
    expect(sampleLessons[1]?.phases.map((phase) => phase.phaseKey)).toEqual([
      'brief',
      'workshop',
      'checkpoint',
      'reflection',
    ]);
    expect(sampleLessons[2]?.phases.map((phase) => phase.phaseKey)).toEqual([
      'directions',
      'assessment',
      'review',
    ]);
    expect(sampleLessons[3]?.phases.map((phase) => phase.phaseKey)).toEqual([
      'brief',
      'workshop',
      'checkpoint',
      'reflection',
    ]);
  });
});
