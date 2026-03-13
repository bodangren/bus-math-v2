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

  it('publishes Units 5-8 as authored Wave 2 curriculum instead of generated placeholders', () => {
    const manifest = buildPublishedCurriculumManifest();
    const wave2Lessons = manifest.lessons.filter((lesson) => lesson.unitNumber >= 5 && lesson.unitNumber <= 8);

    expect(wave2Lessons).toHaveLength(44);
    expect(new Set(wave2Lessons.map((lesson) => lesson.source))).toEqual(new Set(['authored']));

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-5-lesson-1')).toMatchObject({
      source: 'authored',
      title: 'Launch the Asset Lifecycle',
    });

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-6-lesson-8')).toMatchObject({
      source: 'authored',
      lessonType: 'project_sprint',
    });

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-7-lesson-11')).toMatchObject({
      source: 'authored',
      lessonType: 'summative_mastery',
    });

    expect(manifest.lessons.find((lesson) => lesson.slug === 'unit-8-lesson-10')).toMatchObject({
      source: 'authored',
      lessonType: 'project_sprint',
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

  it('keeps Unit 1 aligned to the redesign-first lesson contract', () => {
    const manifest = buildPublishedCurriculumManifest();
    const unit1Lessons = manifest.lessons.filter((lesson) => lesson.unitNumber === 1);

    expect(unit1Lessons.map((lesson) => lesson.title)).toEqual([
      'Launch Unit: A = L + E',
      'Classify Accounts: A, L, and E',
      'Apply A/L/E to Business Events',
      'Build the Balance Sheet',
      'Detect and Fix Ledger Errors',
      'Data Validation and Integrity',
      'Whole-Class Guided Build: Balance Snapshot',
      'Group Build: Six Dataset Challenge',
      'Group Polish: Investor-Ready Snapshot',
      'Class Presentation: Balance by Design',
      'Unit 1 Mastery Check',
    ]);

    const lesson7 = unit1Lessons.find((lesson) => lesson.orderIndex === 7);
    const lesson8 = unit1Lessons.find((lesson) => lesson.orderIndex === 8);
    const lesson9 = unit1Lessons.find((lesson) => lesson.orderIndex === 9);
    const lesson10 = unit1Lessons.find((lesson) => lesson.orderIndex === 10);
    const lesson11 = unit1Lessons.find((lesson) => lesson.orderIndex === 11);

    expect(readLessonMarkdown(lesson7)).toContain('unit_01_class_snapshot_dataset.csv');
    expect(readLessonMarkdown(lesson7)).toContain('unit_01_balance_snapshot_guided.xlsx');
    expect(readLessonMarkdown(lesson7)).toContain('unit_01_foundational_build_guide.pdf');
    expect(readLessonMarkdown(lesson7)).toContain('unit_01_polish_guide.pdf');

    expect(readLessonMarkdown(lesson8)).toContain('unit_01_group_dataset_01.csv');
    expect(readLessonMarkdown(lesson8)).toContain('unit_01_group_dataset_06.csv');
    expect(readLessonMarkdown(lesson8).toLowerCase()).toContain('same product structure as lesson 7');
    expect(readLessonMarkdown(lesson8).toLowerCase()).toContain('dataset');

    expect(readLessonMarkdown(lesson9)).toContain('unit_01_polish_guide.pdf');
    expect(readLessonMarkdown(lesson9)).toContain('investor-ready');
    expect(readLessonMarkdown(lesson9)).toContain('60-second script');

    expect(readLessonMarkdown(lesson10)).toContain('unit_01_presentation_rubric.pdf');
    expect(readLessonMarkdown(lesson10)).toContain('answer at least one audience or teacher question');
    expect(readLessonMarkdown(lesson10)).toContain('public presentation');

    expect(readLessonMarkdown(lesson11).toLowerCase()).toContain('knowledge');
    expect(readLessonMarkdown(lesson11).toLowerCase()).toContain('understanding');
    expect(readLessonMarkdown(lesson11).toLowerCase()).toContain('application');
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

  it('keeps Wave 2 authored lessons aligned to the canonical redesign contract', () => {
    const manifest = buildPublishedCurriculumManifest();

    for (const unitNumber of [5, 6, 7, 8]) {
      const lesson7 = manifest.lessons.find((lesson) => lesson.slug === `unit-${unitNumber}-lesson-7`);
      const lesson8 = manifest.lessons.find((lesson) => lesson.slug === `unit-${unitNumber}-lesson-8`);
      const lesson9 = manifest.lessons.find((lesson) => lesson.slug === `unit-${unitNumber}-lesson-9`);
      const lesson10 = manifest.lessons.find((lesson) => lesson.slug === `unit-${unitNumber}-lesson-10`);
      const lesson11 = manifest.lessons.find((lesson) => lesson.slug === `unit-${unitNumber}-lesson-11`);

      expect(lesson7?.phases.map((phase) => phase.phaseKey)).toEqual([
        'hook',
        'instruction',
        'guided_practice',
        'independent_practice',
        'assessment',
        'reflection',
      ]);
      expect(lesson8?.phases.map((phase) => phase.phaseKey)).toEqual([
        'brief',
        'workshop',
        'checkpoint',
        'reflection',
      ]);
      expect(lesson11?.phases.map((phase) => phase.phaseKey)).toEqual([
        'directions',
        'assessment',
        'review',
      ]);

      const lesson7Markdown = readLessonMarkdown(lesson7);
      const lesson8Markdown = readLessonMarkdown(lesson8);
      const lesson9Markdown = readLessonMarkdown(lesson9);
      const lesson10Markdown = readLessonMarkdown(lesson10);
      const lesson11Markdown = readLessonMarkdown(lesson11).toLowerCase();

      expect(lesson7Markdown).toContain(`unit_0${unitNumber}_class_dataset.csv`);
      expect(lesson7Markdown).toContain(`unit_0${unitNumber}_guided_workbook.xlsx`);
      expect(lesson7Markdown).toContain(`unit_0${unitNumber}_foundation_guide.pdf`);
      expect(lesson7Markdown).toContain(`unit_0${unitNumber}_polish_guide.pdf`);

      expect(lesson8Markdown).toContain(`unit_0${unitNumber}_group_dataset_01.csv`);
      expect(lesson8Markdown).toContain(`unit_0${unitNumber}_group_dataset_06.csv`);
      expect(lesson8Markdown.toLowerCase()).toContain('same product structure as lesson 7');

      expect(lesson9Markdown).toContain(`unit_0${unitNumber}_polish_guide.pdf`);
      expect(lesson10Markdown).toContain(`unit_0${unitNumber}_presentation_rubric.pdf`);
      expect(lesson10Markdown.toLowerCase()).toContain('public presentation');
      expect(lesson11Markdown).toContain('knowledge');
      expect(lesson11Markdown).toContain('understanding');
      expect(lesson11Markdown).toContain('application');
    }
  });
});

function readLessonMarkdown(
  lesson:
    | ReturnType<typeof buildPublishedCurriculumManifest>['lessons'][number]
    | undefined,
): string {
  if (!lesson) {
    return '';
  }

  return lesson.phases
    .flatMap((phase) => phase.sections)
    .filter((section) => section.sectionType === 'text')
    .map((section) => String(section.content.markdown ?? ''))
    .join('\n');
}
