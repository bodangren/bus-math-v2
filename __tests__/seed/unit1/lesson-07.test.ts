import { describe, expect, it } from 'vitest';
import { LESSON_07_SEED_DATA } from '../../../supabase/seed/unit1/lesson-07';

describe('Lesson 07 seed data — Balance Snapshot with Visual (ACC-1.7)', () => {
  it('defines exactly 6 phases', () => {
    expect(LESSON_07_SEED_DATA.phases).toHaveLength(6);
  });

  it('every phase has at least 2 sections', () => {
    for (const phase of LESSON_07_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(2);
    }
  });

  it('phase 1 (Hook) contains a why-this-matters callout', () => {
    const hook = LESSON_07_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    expect(hook).toBeDefined();
    const callout = hook!.sections.find(
      s => s.sectionType === 'callout' && (s.content as Record<string, unknown>).variant === 'why-this-matters',
    );
    expect(callout, 'why-this-matters callout in hook phase').toBeDefined();
  });

  it('phase 2 (Intro) has no video section and contains text about the Balance Snapshot and chart', () => {
    const intro = LESSON_07_SEED_DATA.phases.find(p => p.phaseNumber === 2);
    expect(intro).toBeDefined();
    expect(intro!.sections.find(s => s.sectionType === 'video')).toBeUndefined();
    const textSections = intro!.sections.filter(s => s.sectionType === 'text');
    expect(textSections.length, 'at least 2 text sections in Phase 2').toBeGreaterThanOrEqual(2);
    const hasChartContent = textSections.some(s =>
      ((s.content as Record<string, unknown>).markdown as string).match(/chart|Balance Snapshot|visual/i),
    );
    expect(hasChartContent, 'Phase 2 covers chart and visual communication').toBe(true);
  });

  it('Independent Practice phase (4) has a required spreadsheet activity', () => {
    const indep = LESSON_07_SEED_DATA.phases.find(p => p.phaseNumber === 4);
    expect(indep).toBeDefined();
    const activitySection = indep!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in Independent Practice phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_07_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('spreadsheet');
  });

  it('Assessment phase (5) has a required comprehension-quiz activity', () => {
    const assessment = LESSON_07_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    expect(assessment).toBeDefined();
    const activitySection = assessment!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in assessment phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_07_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('comprehension-quiz');
  });

  it('Closing phase (6) references Milestone 1 — Balance Snapshot v0.9', () => {
    const closing = LESSON_07_SEED_DATA.phases.find(p => p.phaseNumber === 6);
    expect(closing).toBeDefined();
    const textSections = closing!.sections.filter(s => s.sectionType === 'text');
    const hasMilestone = textSections.some(s =>
      JSON.stringify((s.content as Record<string, unknown>).markdown).toLowerCase().includes('milestone'),
    );
    expect(hasMilestone, 'Milestone reference in Closing phase').toBe(true);
  });

  it('links ACC-1.7 as primary standard', () => {
    const primary = LESSON_07_SEED_DATA.standards.find(s => s.isPrimary);
    expect(primary?.code).toBe('ACC-1.7');
  });

  it('lesson slug is unit-1-lesson-7', () => {
    expect(LESSON_07_SEED_DATA.lesson.slug).toBe('unit-1-lesson-7');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_07_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_07_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text, `phase ${phase.phaseNumber} section placeholder`).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/\bplaceholder\b/i);
      }
    }
  });

  it('spreadsheet activity uses the balance-snapshot template', () => {
    const act = LESSON_07_SEED_DATA.activities.find(a => a.componentKey === 'spreadsheet');
    expect(act).toBeDefined();
    const props = act!.props as Record<string, unknown>;
    expect(props.template).toBe('balance-snapshot');
  });
});
