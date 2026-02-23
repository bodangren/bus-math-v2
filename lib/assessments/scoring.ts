import { z } from 'zod';

import { generateProblemInstance } from '@/lib/curriculum/problem-generator';
import type { Activity } from '@/lib/db/schema/validators';

const DEFAULT_PASSING_SCORE = 70;

const questionSchema = z.object({
  id: z.string(),
  correctAnswer: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
  ]),
});

const sentenceSchema = z.object({
  id: z.string(),
  answer: z.string(),
  alternativeAnswers: z.array(z.string()).optional(),
});

const applicationProblemSchema = z.object({
  id: z.string(),
  problemTemplate: z.object({
    tolerance: z.number().nonnegative().optional(),
  }).passthrough(),
});

type Question = z.infer<typeof questionSchema>;
type Sentence = z.infer<typeof sentenceSchema>;
type ApplicationProblem = z.infer<typeof applicationProblemSchema>;

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

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
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

function hasApplicationProblems(props: Activity['props']): props is Activity['props'] & {
  applicationProblems: ApplicationProblem[];
} {
  return Boolean(
    props &&
    typeof props === 'object' &&
    Array.isArray((props as { applicationProblems?: unknown }).applicationProblems),
  );
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

function scoreApplicationProblems(
  activityId: string,
  applicationProblems: ApplicationProblem[],
  answers: Record<string, unknown>,
) {
  const parsed = applicationProblems.map((problem) => applicationProblemSchema.parse(problem));

  let correct = 0;
  parsed.forEach((problem) => {
    const response = answers[problem.id];
    if (response == null || response === '') {
      return;
    }

    const seed = stableHash(`${activityId}:${problem.id}`);
    const generated = generateProblemInstance(problem.problemTemplate, seed);
    const tolerance = problem.problemTemplate.tolerance ?? 1;

    const numericResponse =
      typeof response === 'number'
        ? response
        : typeof response === 'string'
          ? Number(response.replaceAll(',', '').trim())
          : Number.NaN;

    if (Number.isFinite(numericResponse) && Math.abs(numericResponse - generated.correctAnswer) <= tolerance) {
      correct += 1;
      return;
    }

    if (normalizeAnswer(response) === normalizeAnswer(generated.correctAnswer)) {
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
  let foundSupportedScoring = false;

  if (hasQuestionBank(activity.props)) {
    const result = scoreQuestions(activity.props.questions as Question[], answers);
    correct += result.correct;
    total += result.total;
    foundSupportedScoring = true;
  }

  if (hasSentences(activity.props)) {
    const result = scoreSentences(activity.props.sentences as Sentence[], answers);
    correct += result.correct;
    total += result.total;
    foundSupportedScoring = true;
  }

  if (hasApplicationProblems(activity.props)) {
    const result = scoreApplicationProblems(
      activity.id,
      activity.props.applicationProblems as ApplicationProblem[],
      answers,
    );
    correct += result.correct;
    total += result.total;
    foundSupportedScoring = true;
  }

  if (!foundSupportedScoring) {
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
