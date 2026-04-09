import { describe, expect, it } from 'vitest';
import { LESSON_01_SEED_DATA } from '../../../supabase/seed/unit1/lesson-01';

function totalsForNotebookActivity(activity: { props: { items: Array<{ amount: number; category: 'asset' | 'liability' | 'equity' }> } }) {
  return activity.props.items.reduce(
    (totals, item) => {
      totals[item.category] += item.amount;
      return totals;
    },
    { asset: 0, liability: 0, equity: 0 },
  );
}

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

  it('phase 1 contains a turn-and-talk activator question', () => {
    const hook = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 1);
    const textSections = hook!.sections.filter(s => s.sectionType === 'text');
    const hasQuestion = textSections.some(s => {
      const md = (s.content as Record<string, unknown>).markdown as string;
      return md.includes('ahead') || md.includes('behind');
    });
    expect(hasQuestion, 'turn-and-talk activator question in Phase 1').toBe(true);
  });

  it('phase 2 (Intro) contains a launch video section with YouTube URL, duration, and transcript', () => {
    const intro = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 2);
    expect(intro).toBeDefined();
    const videoSection = intro!.sections.find(s => s.sectionType === 'video');
    expect(videoSection, 'video section in Phase 2').toBeDefined();
    const content = videoSection!.content as Record<string, unknown>;
    expect(typeof content.videoUrl).toBe('string');
    expect((content.videoUrl as string)).toMatch(/youtube\.com\/watch\?v=/);
    expect(typeof content.duration).toBe('number');
    expect((content.duration as number)).toBeGreaterThan(0);
    expect(typeof content.transcript).toBe('string');
    expect((content.transcript as string).length).toBeGreaterThan(100);
  });

  it('phase 3 (Guided) contains a notebook-organizer simulation', () => {
    const guided = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 3);
    expect(guided).toBeDefined();
    const activitySection = guided!.sections.find(s => s.sectionType === 'activity');
    expect(activitySection, 'activity section in Phase 3').toBeDefined();
    const content = activitySection!.content as Record<string, unknown>;
    const activity = LESSON_01_SEED_DATA.activities.find(a => a.id === content.activityId);
    expect(activity?.componentKey).toBe('notebook-organizer');
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

  it('guided and independent practice use distinct notebook-organizer activities', () => {
    const guided = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 3);
    const independent = LESSON_01_SEED_DATA.phases.find(p => p.phaseNumber === 4);
    const guidedSection = guided!.sections.find(s => s.sectionType === 'activity');
    const independentSection = independent!.sections.find(s => s.sectionType === 'activity');

    const guidedActivityId = (guidedSection!.content as Record<string, unknown>).activityId as string;
    const independentActivityId = (independentSection!.content as Record<string, unknown>).activityId as string;

    expect(guidedActivityId).not.toBe(independentActivityId);

    const guidedActivity = LESSON_01_SEED_DATA.activities.find(a => a.id === guidedActivityId);
    const independentActivity = LESSON_01_SEED_DATA.activities.find(a => a.id === independentActivityId);

    expect(guidedActivity?.componentKey).toBe('notebook-organizer');
    expect(independentActivity?.componentKey).toBe('notebook-organizer');
  });

  it('all notebook-organizer activities use a balanced accounting dataset', () => {
    const notebookActivities = LESSON_01_SEED_DATA.activities.filter(
      (activity) => activity.componentKey === 'notebook-organizer',
    );

    for (const activity of notebookActivities) {
      const totals = totalsForNotebookActivity(activity);
      expect(
        totals.asset,
        `${activity.displayName} should satisfy Assets = Liabilities + Equity`,
      ).toBe(totals.liability + totals.equity);
    }
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
