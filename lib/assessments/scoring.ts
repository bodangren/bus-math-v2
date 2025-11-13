import { z } from 'zod';

import type { Activity } from '@/lib/db/schema/validators';

const DEFAULT_PASSING_SCORE = 70;

const questionSchema = z.object({
  id: z.string(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
});

const sentenceSchema = z.object({
  id: z.string(),
  answer: z.string(),
  alternativeAnswers: z.array(z.string()).optional(),
});

type Question = z.infer<typeof questionSchema>;
type Sentence = z.infer<typeof sentenceSchema>;

export interface ScoreResult {
  /** Number of correctly answered items */
  score: number;
  /** Total number of gradable items */
  maxScore: number;
  /** Percentage score in the 0-100 range */
  percentage: number;
  /** Human-readable feedback for the student */
  feedback: string;
}

/** Normalize answers for comparison regardless of whitespace/case/order */
function normalizeAnswer(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeAnswer(entry))
      .sort()
      .join('|');
  }

  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim().toLowerCase();
  }

  if (value == null) {
    return '';
  }

  return JSON.stringify(value);
}

function calculatePercentage(correct: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

function buildFeedback(percentage: number, passingScore: number): string {
  if (percentage >= passingScore) {
    return `Great work! You scored ${percentage}% which meets the goal.`;
  }

  if (percentage === 0) {
    return 'Keep going! Review the lesson and try again.';
  }

  return `You scored ${percentage}%. Review the hints and give it another shot.`;
}

function hasQuestionBank(props: Activity['props']): props is Activity['props'] & {
  questions: Question[];
} {
  return Boolean(props && typeof props === 'object' && Array.isArray((props as { questions?: unknown }).questions));
}

function hasSentences(props: Activity['props']): props is Activity['props'] & {
  sentences: Sentence[];
} {
  return Boolean(props && typeof props === 'object' && Array.isArray((props as { sentences?: unknown }).sentences));
}

function scoreQuestions(questions: Question[], answers: Record<string, unknown>) {
  const parsed = questions.map((question) => questionSchema.parse(question));

  let correct = 0;
  parsed.forEach((question) => {
    const response = answers[question.id];

    if (Array.isArray(question.correctAnswer)) {
      const expected = normalizeAnswer(question.correctAnswer);
      const provided = normalizeAnswer(Array.isArray(response) ? response : [response]);
      if (expected === provided) {
        correct += 1;
      }
      return;
    }

    if (normalizeAnswer(question.correctAnswer) === normalizeAnswer(response)) {
      correct += 1;
    }
  });

  return { correct, total: parsed.length };
}

function scoreSentences(sentences: Sentence[], answers: Record<string, unknown>) {
  const parsed = sentences.map((sentence) => sentenceSchema.parse(sentence));

  let correct = 0;
  parsed.forEach((sentence) => {
    const provided = answers[sentence.id];
    if (!provided) {
      return;
    }

    const accepted = [sentence.answer, ...(sentence.alternativeAnswers ?? [])];
    const normalizedAccepted = accepted.map((value) => normalizeAnswer(value));
    const normalizedProvided = normalizeAnswer(provided);

    if (normalizedAccepted.includes(normalizedProvided)) {
      correct += 1;
    }
  });

  return { correct, total: parsed.length };
}

export function calculateScore(
  activity: Activity,
  answers: Record<string, unknown>,
): ScoreResult {
  if (!activity.gradingConfig?.autoGrade) {
    throw new Error('Activity is not configured for auto-grading.');
  }

  const passingScore = activity.gradingConfig.passingScore ?? DEFAULT_PASSING_SCORE;

  let correct = 0;
  let total = 0;

  if (hasQuestionBank(activity.props)) {
    const result = scoreQuestions(activity.props.questions as Question[], answers);
    correct = result.correct;
    total = result.total;
  } else if (hasSentences(activity.props)) {
    const result = scoreSentences(activity.props.sentences as Sentence[], answers);
    correct = result.correct;
    total = result.total;
  } else {
    throw new Error('Activity type is not yet supported for auto-grading.');
  }

  const percentage = calculatePercentage(correct, total);

  return {
    score: correct,
    maxScore: total,
    percentage,
    feedback: buildFeedback(percentage, passingScore),
  };
}
