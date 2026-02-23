import { describe, expect, it } from 'vitest';
import { LESSON_11_SEED_DATA } from '../../../supabase/seed/unit1/lesson-11';

describe('Lesson 11 seed data — Individual Assessment (ACC-1.1–ACC-1.7)', () => {
  it('defines instructions + three assessment tiers', () => {
    expect(LESSON_11_SEED_DATA.phases).toHaveLength(4);
    expect(LESSON_11_SEED_DATA.phases[0]?.title.toLowerCase()).toContain('instruction');
    expect(LESSON_11_SEED_DATA.phases[1]?.title.toLowerCase()).toContain('knowledge');
    expect(LESSON_11_SEED_DATA.phases[2]?.title.toLowerCase()).toContain('understanding');
    expect(LESSON_11_SEED_DATA.phases[3]?.title.toLowerCase()).toContain('application');
  });

  it('tier phases each include a required activity section', () => {
    for (const phase of LESSON_11_SEED_DATA.phases.slice(1)) {
      const activitySection = phase.sections.find((section) => section.sectionType === 'activity');
      expect(activitySection, `activity section in phase ${phase.phaseNumber}`).toBeDefined();
      const content = activitySection!.content as Record<string, unknown>;
      expect(content.required).toBe(true);
    }
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
