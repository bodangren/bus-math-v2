import { describe, expect, it } from 'vitest';
import { LESSON_04_SEED_DATA } from '../../../supabase/seed/unit1/lesson-04';

describe('Lesson 04 seed data — Build the Balance Sheet (ACC-1.3)', () => {
  it('defines exactly 6 phases', () => {
    expect(LESSON_04_SEED_DATA.phases).toHaveLength(6);
  });

  it('every phase has at least 2 sections', () => {
    for (const phase of LESSON_04_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(2);
    }
  });

  it('phase 1 (Hook) contains a why-this-matters callout', () => {
    const hook = LESSON_04_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    expect(hook).toBeDefined();
    const callout = hook!.sections.find(
      s => s.sectionType === 'callout' && (s.content as Record<string, unknown>).variant === 'why-this-matters',
    );
    expect(callout, 'why-this-matters callout in hook phase').toBeDefined();
  });

  it('Independent Practice phase (4) has a required spreadsheet activity', () => {
    const indep = LESSON_04_SEED_DATA.phases.find(p => p.phaseNumber === 4);
    expect(indep).toBeDefined();
    const activitySection = indep!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in independent practice phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_04_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('spreadsheet');
  });

  it('Assessment phase (5) has a required comprehension-quiz activity', () => {
    const assessment = LESSON_04_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    expect(assessment).toBeDefined();
    const activitySection = assessment!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in assessment phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_04_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('comprehension-quiz');
  });

  it('links ACC-1.3 as primary standard', () => {
    const primary = LESSON_04_SEED_DATA.standards.find(s => s.isPrimary);
    expect(primary?.code).toBe('ACC-1.3');
  });

  it('lesson slug is unit-1-lesson-4', () => {
    expect(LESSON_04_SEED_DATA.lesson.slug).toBe('unit-1-lesson-4');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_04_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_04_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text, `phase ${phase.phaseNumber} section placeholder`).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/placeholder/i);
      }
    }
  });

  it('spreadsheet activity uses the balance-sheet template', () => {
    const act = LESSON_04_SEED_DATA.activities.find(a => a.componentKey === 'spreadsheet');
    expect(act).toBeDefined();
    const props = act!.props as Record<string, unknown>;
    expect(props.template).toBe('balance-sheet');
  });
});
