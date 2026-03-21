import { describe, expect, it } from 'vitest';
import { LESSON_06_SEED_DATA } from '../../../supabase/seed/unit1/lesson-06';

describe('Lesson 06 seed data — Data Validation and Integrity (ACC-1.6)', () => {
  it('defines exactly 6 phases', () => {
    expect(LESSON_06_SEED_DATA.phases).toHaveLength(6);
  });

  it('every phase has at least 2 sections', () => {
    for (const phase of LESSON_06_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(2);
    }
  });

  it('phase 1 (Hook) contains a why-this-matters callout', () => {
    const hook = LESSON_06_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    expect(hook).toBeDefined();
    const callout = hook!.sections.find(
      s => s.sectionType === 'callout' && (s.content as Record<string, unknown>).variant === 'why-this-matters',
    );
    expect(callout, 'why-this-matters callout in hook phase').toBeDefined();
  });

  it('phase 2 (Intro) has no video section and contains text about Data Validation rules', () => {
    const intro = LESSON_06_SEED_DATA.phases.find(p => p.phaseNumber === 2);
    expect(intro).toBeDefined();
    expect(intro!.sections.find(s => (s.sectionType as string) === 'video')).toBeUndefined();
    const textSections = intro!.sections.filter(s => s.sectionType === 'text');
    expect(textSections.length, 'at least 2 text sections in Phase 2').toBeGreaterThanOrEqual(2);
    const hasValidationContent = textSections.some(s =>
      ((s.content as Record<string, unknown>).markdown as string).match(/Data Validation|dropdown|validation/i),
    );
    expect(hasValidationContent, 'Phase 2 covers Data Validation').toBe(true);
  });

  it('Guided Practice phase (3) has a required fill-in-the-blank activity', () => {
    const guided = LESSON_06_SEED_DATA.phases.find(p => p.phaseNumber === 3);
    expect(guided).toBeDefined();
    const activitySection = guided!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in Guided Practice phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_06_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('fill-in-the-blank');
  });

  it('Assessment phase (5) has a required comprehension-quiz activity', () => {
    const assessment = LESSON_06_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    expect(assessment).toBeDefined();
    const activitySection = assessment!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in assessment phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_06_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('comprehension-quiz');
  });

  it('links ACC-1.6 as primary standard', () => {
    const primary = LESSON_06_SEED_DATA.standards.find(s => s.isPrimary);
    expect(primary?.code).toBe('ACC-1.6');
  });

  it('lesson slug is unit-1-lesson-6', () => {
    expect(LESSON_06_SEED_DATA.lesson.slug).toBe('unit-1-lesson-6');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_06_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_06_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text, `phase ${phase.phaseNumber} section placeholder`).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/\bplaceholder\b/i);
      }
    }
  });

  it('fill-in-the-blank activity has at least 3 prompts covering validation concepts', () => {
    const act = LESSON_06_SEED_DATA.activities.find(a => a.componentKey === 'fill-in-the-blank');
    expect(act).toBeDefined();
    const sentences = (act!.props as Record<string, unknown>).sentences as unknown[];
    expect(sentences.length).toBeGreaterThanOrEqual(3);
  });
});
