import { describe, expect, it } from 'vitest';
import { LESSON_10_SEED_DATA } from '../../../supabase/seed/unit1/lessons-08-10';

describe('Lesson 10 seed data — Group Project Day 3 (Final Polish)', () => {
  it('defines the canonical four project-sprint phases', () => {
    expect(LESSON_10_SEED_DATA.phases).toHaveLength(4);
    expect(LESSON_10_SEED_DATA.phases.map((phase) => phase.title.toLowerCase())).toEqual([
      expect.stringContaining('brief'),
      expect.stringContaining('workshop'),
      expect.stringContaining('checkpoint'),
      expect.stringContaining('reflection'),
    ]);
  });

  it('every phase has at least one section', () => {
    for (const phase of LESSON_10_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(1);
    }
  });

  it('checkpoint phase has a required reflection-journal activity', () => {
    const checkpoint = LESSON_10_SEED_DATA.phases.find((phase) => phase.phaseNumber === 3);
    expect(checkpoint).toBeDefined();
    const activitySection = checkpoint!.sections.find((section) => section.sectionType === 'activity');
    expect(activitySection, 'activity section in checkpoint phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_10_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('reflection-journal');
  });

  it('checkpoint phase references Milestone 2 in its content', () => {
    const checkpoint = LESSON_10_SEED_DATA.phases.find((phase) => phase.phaseNumber === 3);
    expect(checkpoint).toBeDefined();
    const textSections = checkpoint!.sections.filter((section) => section.sectionType === 'text');
    const hasMilestone = textSections.some(s =>
      JSON.stringify((s.content as Record<string, unknown>).markdown).toLowerCase().includes('milestone'),
    );
    expect(hasMilestone, 'Milestone 2 reference in Phase 1').toBe(true);
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
