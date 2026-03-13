import { describe, expect, it } from 'vitest';
import { LESSON_10_SEED_DATA } from '../../../supabase/seed/unit1/lessons-08-10';

describe('Lesson 10 seed data — Class Presentation: Balance by Design', () => {
  function readMarkdown() {
    return LESSON_10_SEED_DATA.phases
      .flatMap((phase) => phase.sections)
      .filter((section) => section.sectionType === 'text')
      .map((section) => String((section.content as Record<string, unknown>).markdown ?? ''))
      .join('\n');
  }

  it('defines the canonical four project-sprint phases', () => {
    expect(LESSON_10_SEED_DATA.phases).toHaveLength(4);
    expect(LESSON_10_SEED_DATA.phases.map((phase) => phase.title.toLowerCase())).toEqual([
      expect.stringContaining('presentation setup'),
      expect.stringContaining('final preparation'),
      expect.stringContaining('class presentation'),
      expect.stringContaining('audience feedback'),
    ]);
  });

  it('treats Lesson 10 as the public presentation lesson', () => {
    expect(LESSON_10_SEED_DATA.lesson.title).toBe('Class Presentation: Balance by Design');

    const markdown = readMarkdown();
    expect(markdown).toContain('unit_01_presentation_rubric.pdf');
    expect(markdown).toContain('audience or teacher question');
    expect(markdown).toContain('public presentation');
    expect(markdown).toContain('workbook as evidence');
  });

  it('presentation phase includes a required activity to capture audience feedback', () => {
    const presentation = LESSON_10_SEED_DATA.phases.find((phase) => phase.phaseNumber === 3);
    expect(presentation).toBeDefined();
    const activitySection = presentation!.sections.find((section) => section.sectionType === 'activity');
    expect(activitySection, 'activity section in presentation phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_10_SEED_DATA.activities.find((activity) => activity.id === content.activityId);
    expect(act?.componentKey).toBe('reflection-journal');
  });

  it('lesson slug is unit-1-lesson-10', () => {
    expect(LESSON_10_SEED_DATA.lesson.slug).toBe('unit-1-lesson-10');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_10_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_10_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/\bplaceholder\b/i);
      }
    }
  });
});
