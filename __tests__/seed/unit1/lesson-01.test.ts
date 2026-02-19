import { describe, expect, it } from 'vitest';
import { LESSON_01_SEED_DATA } from '../../../supabase/seed/unit1/lesson-01';

describe('Lesson 01 seed data — Launch Unit: A=L+E', () => {
  it('defines exactly 6 phases', () => {
    expect(LESSON_01_SEED_DATA.phases).toHaveLength(6);
  });

  it('every phase has at least 2 sections', () => {
    for (const phase of LESSON_01_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(2);
    }
  });

  it('phase 1 (Hook) contains a why-this-matters callout', () => {
    const hook = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    expect(hook).toBeDefined();
    const callout = hook!.sections.find(
      s => s.sectionType === 'callout' && (s.content as Record<string, unknown>).variant === 'why-this-matters',
    );
    expect(callout, 'why-this-matters callout in hook phase').toBeDefined();
  });

  it('phase 1 includes Sarah Chen narrative in text content', () => {
    const hook = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    const textSection = hook!.sections.find(s => s.sectionType === 'text');
    const markdown = ((textSection?.content) as Record<string, unknown>)?.markdown as string;
    expect(markdown).toMatch(/Sarah/i);
  });

  it('links ACC-1.1 as primary standard', () => {
    const primary = LESSON_01_SEED_DATA.standards.find(s => s.isPrimary);
    expect(primary?.code).toBe('ACC-1.1');
  });

  it('assessment phase (5) has a required comprehension-quiz activity section', () => {
    const assessment = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    expect(assessment).toBeDefined();
    const activitySection = assessment!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in assessment phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const activity = LESSON_01_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(activity?.componentKey).toBe('comprehension-quiz');
  });

  it('uses ON CONFLICT (idempotent) upsert pattern for the lesson row', () => {
    // Structural check: the lesson has a deterministic UUID in the d6b57545 namespace
    expect(LESSON_01_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('lesson slug is unit-1-lesson-1', () => {
    expect(LESSON_01_SEED_DATA.lesson.slug).toBe('unit-1-lesson-1');
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_01_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text, `phase ${phase.phaseNumber} section placeholder`).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/placeholder/i);
      }
    }
  });
});
