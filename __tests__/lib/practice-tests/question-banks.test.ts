import { describe, it, expect } from 'vitest';
import { filterQuestionsByLessonIds, drawRandomQuestions, shuffleAnswers, UNIT1_CONFIG } from '@/lib/practice-tests/question-banks';

describe('filterQuestionsByLessonIds', () => {
  it('returns only questions for the specified lesson IDs', () => {
    const filtered = filterQuestionsByLessonIds(UNIT1_CONFIG.questions, ['unit1-lesson1']);
    expect(filtered.every(q => q.lessonId === 'unit1-lesson1')).toBe(true);
  });

  it('returns an empty array if no lesson IDs match', () => {
    const filtered = filterQuestionsByLessonIds(UNIT1_CONFIG.questions, ['nonexistent-lesson']);
    expect(filtered).toEqual([]);
  });
});

describe('drawRandomQuestions', () => {
  it('returns the requested number of questions', () => {
    const drawn = drawRandomQuestions(UNIT1_CONFIG.questions, 2);
    expect(drawn).toHaveLength(2);
  });

  it('returns all questions if count is greater than available', () => {
    const drawn = drawRandomQuestions(UNIT1_CONFIG.questions, 100);
    expect(drawn).toHaveLength(UNIT1_CONFIG.questions.length);
  });

  it('returns an empty array if count is 0', () => {
    const drawn = drawRandomQuestions(UNIT1_CONFIG.questions, 0);
    expect(drawn).toEqual([]);
  });

  it('returns questions from the original array', () => {
    const drawn = drawRandomQuestions(UNIT1_CONFIG.questions, 3);
    drawn.forEach(question => {
      expect(UNIT1_CONFIG.questions).toContain(question);
    });
  });
});

describe('shuffleAnswers', () => {
  it('returns the correct answer and all options', () => {
    const question = UNIT1_CONFIG.questions[0];
    const result = shuffleAnswers(question);
    expect(result.answer).toBe(question.correctAnswer);
    expect(result.options).toContain(question.correctAnswer);
    question.distractors.forEach(distractor => {
      expect(result.options).toContain(distractor);
    });
  });

  it('returns options in a different order than original', () => {
    const question = UNIT1_CONFIG.questions[0];
    const originalOrder = [question.correctAnswer, ...question.distractors];
    const result = shuffleAnswers(question);
    expect(result.options).not.toEqual(originalOrder);
  });
});
