import { describe, it, expect } from 'vitest';
import {
  assembleLessonChatbotContext,
} from '@/lib/ai/lesson-context';

describe('lib/ai/lesson-context', () => {
  describe('assembleLessonChatbotContext', () => {
    it('should assemble a valid context package', () => {
      const lesson = {
        id: 'lesson-1',
        title: 'Introduction to Accounting',
        unit: { id: 'unit-1', title: 'Unit 1: The Accounting Equation' },
      };
      const phase = {
        number: 1,
        title: 'What is Accounting?',
        learningObjectives: ['Define accounting', 'Explain the accounting equation'],
        content: '<p>Accounting is the language of business...</p>',
      };

      const context = assembleLessonChatbotContext(lesson, phase);

      expect(context.lessonTitle).toBe('Introduction to Accounting');
      expect(context.unitTitle).toBe('Unit 1: The Accounting Equation');
      expect(context.phaseTitle).toBe('What is Accounting?');
      expect(context.learningObjectives).toEqual([
        'Define accounting',
        'Explain the accounting equation',
      ]);
      expect(typeof context.contentSummary).toBe('string');
    });

    it('should bound the context size', () => {
      const lesson = {
        id: 'lesson-1',
        title: 'Introduction to Accounting',
        unit: { id: 'unit-1', title: 'Unit 1: The Accounting Equation' },
      };
      const longContent = '<p>' + 'a'.repeat(10000) + '</p>';
      const phase = {
        number: 1,
        title: 'What is Accounting?',
        learningObjectives: ['Define accounting'],
        content: longContent,
      };

      const context = assembleLessonChatbotContext(lesson, phase);
      const totalContextLength = JSON.stringify(context).length;

      expect(totalContextLength).toBeLessThan(5000);
    });
  });
});