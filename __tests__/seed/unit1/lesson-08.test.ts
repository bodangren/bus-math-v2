import { describe, expect, it } from 'vitest';
import { LESSON_08_SEED_DATA } from '../../../supabase/seed/unit1/lessons-08-10';

describe('Lesson 08 seed data — Group Build: Six Dataset Challenge', () => {
  function readMarkdown() {
    return LESSON_08_SEED_DATA.phases
      .flatMap((phase) => phase.sections)
      .filter((section) => section.sectionType === 'text')
      .map((section) => String((section.content as Record<string, unknown>).markdown ?? ''))
      .join('\n');
  }

  it('defines the canonical four project-sprint phases', () => {
    expect(LESSON_08_SEED_DATA.phases).toHaveLength(4);
    expect(LESSON_08_SEED_DATA.phases.map((phase) => phase.title.toLowerCase())).toEqual([
      expect.stringContaining('dataset assignment'),
      expect.stringContaining('foundational'),
      expect.stringContaining('checkpoint'),
      expect.stringContaining('reflection'),
    ]);
  });

  it('replaces the generic project shell with the six-dataset contract', () => {
    expect(LESSON_08_SEED_DATA.lesson.title).toBe('Group Build: Six Dataset Challenge');

    const markdown = readMarkdown();
    const normalized = markdown.toLowerCase();
    expect(markdown).toContain('unit_01_group_dataset_01.csv');
    expect(markdown).toContain('unit_01_group_dataset_06.csv');
    expect(normalized).toContain('six');
    expect(normalized).toContain('dataset');
    expect(normalized).toContain('same product structure as lesson 7');
    expect(normalized).toContain('foundational-proficiency build guide');
  });

  it('checkpoint phase includes a required activity to document the draft workbook handoff', () => {
    const checkpoint = LESSON_08_SEED_DATA.phases.find((phase) => phase.phaseNumber === 3);
    expect(checkpoint).toBeDefined();

    const activitySection = checkpoint!.sections.find((section) => section.sectionType === 'activity');
    expect(activitySection, 'activity section in checkpoint phase').toBeDefined();

    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);

    const act = LESSON_08_SEED_DATA.activities.find((activity) => activity.id === content.activityId);
    expect(act?.componentKey).toBe('peer-critique-form');
  });

  it('reflection phase records what still needs support before polish', () => {
    const reflection = LESSON_08_SEED_DATA.phases.find((phase) => phase.phaseNumber === 4);
    expect(reflection).toBeDefined();

    const markdown = reflection!.sections
      .filter((section) => section.sectionType === 'text')
      .map((section) => String((section.content as Record<string, unknown>).markdown ?? ''))
      .join('\n');

    expect(markdown).toContain('balanced workbook draft');
    expect(markdown).toContain('Lesson 9 polish');
  });

  it('lesson slug is unit-1-lesson-8', () => {
    expect(LESSON_08_SEED_DATA.lesson.slug).toBe('unit-1-lesson-8');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_08_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_08_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/\bplaceholder\b/i);
      }
    }
  });
});
