import { describe, expect, it } from 'vitest';
import { LESSON_03_SEED_DATA } from '../../../supabase/seed/unit1/lesson-03';

describe('Lesson 03 seed data — Apply A/L/E to Business Events (ACC-1.4)', () => {
  it('defines exactly 6 phases', () => {
    expect(LESSON_03_SEED_DATA.phases).toHaveLength(6);
  });

  it('every phase has at least 2 sections', () => {
    for (const phase of LESSON_03_SEED_DATA.phases) {
      expect(phase.sections.length, `phase ${phase.phaseNumber} sections`).toBeGreaterThanOrEqual(2);
    }
  });

  it('phase 1 (Hook) contains a why-this-matters callout', () => {
    const hook = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    expect(hook).toBeDefined();
    const callout = hook!.sections.find(
      s => s.sectionType === 'callout' && (s.content as Record<string, unknown>).variant === 'why-this-matters',
    );
    expect(callout, 'why-this-matters callout in hook phase').toBeDefined();
  });

  it('phase 2 (Intro) has no video section and contains text explaining the dual-impact principle', () => {
    const intro = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 2);
    expect(intro).toBeDefined();
    expect(intro!.sections.find(s => s.sectionType === 'video')).toBeUndefined();
    const textSections = intro!.sections.filter(s => s.sectionType === 'text');
    expect(textSections.length, 'at least 2 text sections in Phase 2').toBeGreaterThanOrEqual(2);
    const hasDualImpact = textSections.some(s =>
      ((s.content as Record<string, unknown>).markdown as string).match(/dual.impact|transaction|equation/i),
    );
    expect(hasDualImpact, 'Phase 2 intro covers dual-impact principle').toBe(true);
  });

  it('phase 1 contains an activator question about coffee beans', () => {
    const hook = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    const textSections = hook!.sections.filter(s => s.sectionType === 'text');
    const hasQuestion = textSections.some(s => {
      const md = (s.content as Record<string, unknown>).markdown as string;
      return md.includes('coffee beans') && (md.includes('up') || md.includes('down') || md.includes('same'));
    });
    expect(hasQuestion, 'activator question in Phase 1').toBe(true);
  });

  it('phase 1 includes Sarah Chen narrative in text content', () => {
    const hook = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    const textSection = hook!.sections.find(s => s.sectionType === 'text');
    const markdown = ((textSection?.content) as Record<string, unknown>)?.markdown as string;
    expect(markdown).toMatch(/Sarah|TechStart/i);
  });

  it('Assessment phase (5) has a required comprehension-quiz activity', () => {
    const assessment = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    expect(assessment).toBeDefined();
    const activitySection = assessment!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in assessment phase').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    expect(content.required).toBe(true);
    const act = LESSON_03_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(act?.componentKey).toBe('comprehension-quiz');
  });

  it('keeps the exit ticket only in phase 5 (not guided/independent phases)', () => {
    const guided = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 3);
    const independent = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 4);
    const assessment = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === 5);
    const assessmentActivitySection = assessment?.sections.find(s => s.sectionType === 'activity');
    const exitTicketActivityId = (assessmentActivitySection?.content as Record<string, unknown> | undefined)?.activityId;

    const hasExitTicket = (phaseNumber: number) => {
      const phase = LESSON_03_SEED_DATA.phases.find(p => p.phaseNumber === phaseNumber);
      if (!phase) return false;

      return phase.sections.some((section) => {
        if (section.sectionType !== 'activity') return false;
        const content = section.content as Record<string, unknown>;
        return content.activityId === exitTicketActivityId;
      });
    };

    expect(guided).toBeDefined();
    expect(independent).toBeDefined();
    expect(assessment).toBeDefined();
    expect(hasExitTicket(3)).toBe(false);
    expect(hasExitTicket(4)).toBe(false);
    expect(hasExitTicket(5)).toBe(true);
  });

  it('links ACC-1.4 as primary standard', () => {
    const primary = LESSON_03_SEED_DATA.standards.find(s => s.isPrimary);
    expect(primary?.code).toBe('ACC-1.4');
  });

  it('lesson slug is unit-1-lesson-3', () => {
    expect(LESSON_03_SEED_DATA.lesson.slug).toBe('unit-1-lesson-3');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_03_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_03_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text, `phase ${phase.phaseNumber} section placeholder`).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/placeholder/i);
      }
    }
  });

  it('exit ticket activity has at least 5 questions covering event effects on A/L/E', () => {
    const act = LESSON_03_SEED_DATA.activities.find(a => a.componentKey === 'comprehension-quiz');
    expect(act).toBeDefined();
    const questions = (act!.props as Record<string, unknown>).questions as unknown[];
    expect(questions.length).toBeGreaterThanOrEqual(5);
  });
});
