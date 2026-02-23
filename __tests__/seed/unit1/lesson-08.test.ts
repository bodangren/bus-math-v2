import { describe, expect, it } from 'vitest';
import { LESSON_08_SEED_DATA } from '../../../supabase/seed/unit1/lessons-08-10';

describe('Lesson 08 seed data — Group Project Day 1', () => {
  it('defines exactly 1 phase', () => {
    expect(LESSON_08_SEED_DATA.phases).toHaveLength(1);
  });

  it('phase 1 has at least 2 sections', () => {
    expect(LESSON_08_SEED_DATA.phases[0].sections.length).toBeGreaterThanOrEqual(2);
  });

  it('phase 1 has a required peer-critique-form activity', () => {
    const activitySection = LESSON_08_SEED_DATA.phases[0].sections.find(
      s => s.sectionType === 'activity',
    );
    expect(activitySection, 'activity section in Phase 1').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_08_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('peer-critique-form');
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
