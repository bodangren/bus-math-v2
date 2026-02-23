import { describe, expect, it } from 'vitest';

import { generateProblemInstance } from '@/lib/curriculum/problem-generator';
import { parseProblemTemplate } from '@/lib/curriculum/problem-template';
import { UNIT_1_LESSON_SEEDS } from './unit1-fixtures';

describe('curriculum/algorithmic-support', () => {
  it('all auto-graded activities include problemTemplate (or all questions include one)', () => {
    for (const lesson of UNIT_1_LESSON_SEEDS) {
      for (const activity of lesson.activities) {
        if (!activity.gradingConfig?.autoGrade) {
          continue;
        }

        const propsTemplate = activity.props.problemTemplate;
        const questions = activity.props.questions;

        if (Array.isArray(questions)) {
          for (const question of questions as Array<Record<string, unknown>>) {
            expect(
              question.problemTemplate ?? propsTemplate,
              `lesson ${lesson.lesson.slug} activity ${activity.id} question ${String(question.id)}`,
            ).toBeDefined();
          }
          continue;
        }

        expect(propsTemplate, `lesson ${lesson.lesson.slug} activity ${activity.id}`).toBeDefined();
      }
    }
  });

  it('problemTemplate objects can be parsed and generate deterministic instances', () => {
    for (const lesson of UNIT_1_LESSON_SEEDS) {
      for (const activity of lesson.activities) {
        const templates: Array<Record<string, unknown>> = [];

        if (activity.props.problemTemplate && typeof activity.props.problemTemplate === 'object') {
          templates.push(activity.props.problemTemplate as Record<string, unknown>);
        }

        const questions = activity.props.questions;
        if (Array.isArray(questions)) {
          for (const question of questions as Array<Record<string, unknown>>) {
            if (question.problemTemplate && typeof question.problemTemplate === 'object') {
              templates.push(question.problemTemplate as Record<string, unknown>);
            }
          }
        }

        for (const templateLike of templates) {
          const template = parseProblemTemplate(templateLike);
          const a = generateProblemInstance(template, 2026);
          const b = generateProblemInstance(template, 2026);

          expect(a.parameters).toEqual(b.parameters);
          expect(a.questionText).toBe(b.questionText);
          expect(a.correctAnswer).toBe(b.correctAnswer);
          expect(a.questionText).not.toMatch(/{{\w+}}/);
        }
      }
    }
  });
});
