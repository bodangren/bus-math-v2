import { describe, expect, it } from 'vitest';
import { LESSON_11_SEED_DATA } from '../../../supabase/seed/unit1/lesson-11';

describe('Lesson 11 seed data — Individual Assessment (ACC-1.1–ACC-1.7)', () => {
  function readMarkdown() {
    return LESSON_11_SEED_DATA.phases
      .flatMap((phase) => phase.sections)
      .filter((section) => section.sectionType === 'text')
      .map((section) => String((section.content as Record<string, unknown>).markdown ?? ''))
      .join('\n');
  }

  it('defines the canonical summative mastery phases', () => {
    expect(LESSON_11_SEED_DATA.phases).toHaveLength(3);
    expect(LESSON_11_SEED_DATA.phases[0]?.title.toLowerCase()).toContain('instruction');
    expect(LESSON_11_SEED_DATA.phases[1]?.title.toLowerCase()).toContain('assessment');
    expect(LESSON_11_SEED_DATA.phases[2]?.title.toLowerCase()).toContain('review');
  });

  it('assessment phase includes the required tier activities', () => {
    const assessmentPhase = LESSON_11_SEED_DATA.phases[1];
    const requiredActivities = assessmentPhase.sections.filter(
      (section) =>
        section.sectionType === 'activity' &&
        (section.content as Record<string, unknown>).required === true,
    );

    expect(requiredActivities).toHaveLength(3);
  });

  it('contains at least 21 tiered questions and 7 application problems', () => {
    const totalQuestions = LESSON_11_SEED_DATA.activities.reduce((count, activity) => {
      const questions = (activity.props as Record<string, unknown>).questions;
      return count + (Array.isArray(questions) ? questions.length : 0);
    }, 0);

    const totalApplicationProblems = LESSON_11_SEED_DATA.activities.reduce((count, activity) => {
      const problems = (activity.props as Record<string, unknown>).applicationProblems;
      return count + (Array.isArray(problems) ? problems.length : 0);
    }, 0);

    expect(totalQuestions).toBeGreaterThanOrEqual(21);
    expect(totalApplicationProblems).toBeGreaterThanOrEqual(7);
  });

  it('summative grading config is auto-graded with passing score 70', () => {
    for (const activity of LESSON_11_SEED_DATA.activities) {
      expect(activity.gradingConfig.autoGrade).toBe(true);
      expect(activity.gradingConfig.passingScore).toBe(70);
    }
  });

  it('frames the summative explicitly as knowledge, understanding, and application', () => {
    expect(LESSON_11_SEED_DATA.lesson.title).toBe('Unit 1 Mastery Check');

    const markdown = readMarkdown().toLowerCase();
    expect(markdown).toContain('knowledge');
    expect(markdown).toContain('understanding');
    expect(markdown).toContain('application');
    expect(markdown).toContain('complete all tiers in order');
  });

  it('links all 7 ACC-1.x standards (ACC-1.1 through ACC-1.7)', () => {
    const codes = LESSON_11_SEED_DATA.standards.map((s) => s.code);
    expect(codes).toContain('ACC-1.1');
    expect(codes).toContain('ACC-1.2');
    expect(codes).toContain('ACC-1.3');
    expect(codes).toContain('ACC-1.4');
    expect(codes).toContain('ACC-1.5');
    expect(codes).toContain('ACC-1.6');
    expect(codes).toContain('ACC-1.7');
    expect(codes).toHaveLength(7);
  });

  it('lesson slug is unit-1-lesson-11', () => {
    expect(LESSON_11_SEED_DATA.lesson.slug).toBe('unit-1-lesson-11');
  });

  it('uses the d6b57545 namespace for deterministic UUIDs', () => {
    expect(LESSON_11_SEED_DATA.lesson.id).toMatch(/^d6b57545-65f6-4c39-80d5-/);
  });

  it('no section contains placeholder text', () => {
    for (const phase of LESSON_11_SEED_DATA.phases) {
      for (const section of phase.sections) {
        const text = JSON.stringify(section.content);
        expect(text).not.toMatch(/content coming soon/i);
        expect(text).not.toMatch(/\bplaceholder\b/i);
      }
    }
  });
});
