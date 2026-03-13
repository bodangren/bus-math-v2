import { describe, expect, it } from 'vitest';
import { LESSON_09_SEED_DATA } from '../../../supabase/seed/unit1/lessons-08-10';

describe('Lesson 09 seed data — Group Polish: Investor-Ready Snapshot', () => {
  function readMarkdown() {
    return LESSON_09_SEED_DATA.phases
      .flatMap((phase) => phase.sections)
      .filter((section) => section.sectionType === 'text')
      .map((section) => String((section.content as Record<string, unknown>).markdown ?? ''))
      .join('\n');
  }

  it('defines the canonical four project-sprint phases', () => {
    expect(LESSON_09_SEED_DATA.phases).toHaveLength(4);
    expect(LESSON_09_SEED_DATA.phases.map((phase) => phase.title.toLowerCase())).toEqual([
      expect.stringContaining('advanced-quality'),
      expect.stringContaining('polish'),
      expect.stringContaining('checkpoint'),
      expect.stringContaining('reflection'),
    ]);
  });

  it('locks Lesson 9 to polish and advanced proficiency guidance', () => {
    expect(LESSON_09_SEED_DATA.lesson.title).toBe('Group Polish: Investor-Ready Snapshot');

    const markdown = readMarkdown();
    expect(markdown).toContain('unit_01_polish_guide.pdf');
    expect(markdown).toContain('investor-ready');
    expect(markdown).toContain('60-second script');
    expect(markdown).toContain('Lesson 8 workbook');
  });

  it('checkpoint phase has a required reflection-journal activity', () => {
    const checkpoint = LESSON_09_SEED_DATA.phases.find((phase) => phase.phaseNumber === 3);
    expect(checkpoint).toBeDefined();
    const activitySection = checkpoint!.sections.find((section) => section.sectionType === 'activity');
    expect(activitySection, 'activity section in checkpoint phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_09_SEED_DATA.activities.find((activity) => activity.id === content.activityId);
    expect(act?.componentKey).toBe('reflection-journal');
  });

  it('reflection phase preserves readiness for the formal class presentation', () => {
    const reflection = LESSON_09_SEED_DATA.phases.find((phase) => phase.phaseNumber === 4);
    expect(reflection).toBeDefined();
    const markdown = reflection!.sections
      .filter((section) => section.sectionType === 'text')
      .map((section) => String((section.content as Record<string, unknown>).markdown ?? ''))
      .join('\n');

    expect(markdown).toContain('formal class presentation in Lesson 10');
  });

  it('lesson slug is unit-1-lesson-9', () => {
    expect(LESSON_09_SEED_DATA.lesson.slug).toBe('unit-1-lesson-9');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_09_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_09_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/\bplaceholder\b/i);
      }
    }
  });
});
