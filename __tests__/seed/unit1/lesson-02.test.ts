import { describe, expect, it } from 'vitest';
import { LESSON_02_SEED_DATA } from '../../../supabase/seed/unit1/lesson-02';

describe('Lesson 02 seed data — Classify Accounts (ACC-1.2)', () => {
  it('defines exactly 6 phases', () => {
    expect(LESSON_02_SEED_DATA.phases).toHaveLength(6);
  });

  it('every phase has at least 2 sections', () => {
    for (const phase of LESSON_02_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(2);
    }
  });

  it('phase 1 (Hook) contains a why-this-matters callout', () => {
    const hook = LESSON_02_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    const callout = hook!.sections.find(
      s => s.sectionType === 'callout' && (s.content as Record<string, unknown>).variant === 'why-this-matters',
    );
    expect(callout).toBeDefined();
  });

  it('Guided Practice phase (3) has a required account-categorization activity', () => {
    const guided = LESSON_02_SEED_DATA.phases.find(p => p.phaseNumber === 3);
    const activitySection = guided!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection).toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    const activity = LESSON_02_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(activity?.componentKey).toBe('account-categorization');
  });

  it('Assessment phase (5) has a required comprehension-quiz activity', () => {
    const assessment = LESSON_02_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    const activitySection = assessment!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection).toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    const activity = LESSON_02_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(activity?.componentKey).toBe('comprehension-quiz');
  });

  it('links ACC-1.2 as primary standard', () => {
    const primary = LESSON_02_SEED_DATA.standards.find(s => s.isPrimary);
    expect(primary?.code).toBe('ACC-1.2');
  });

  it('lesson slug is unit-1-lesson-2', () => {
    expect(LESSON_02_SEED_DATA.lesson.slug).toBe('unit-1-lesson-2');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_02_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_02_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/placeholder/i);
      }
    }
  });
});
