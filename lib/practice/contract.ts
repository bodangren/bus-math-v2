import { z } from 'zod';

export const PRACTICE_CONTRACT_VERSION = 'practice.v1' as const;

export const PRACTICE_MODE_VALUES = [
  'worked_example',
  'guided_practice',
  'independent_practice',
  'assessment',
  'teaching',
] as const;

export const PRACTICE_SUBMISSION_STATUS_VALUES = [
  'draft',
  'submitted',
  'graded',
  'returned',
] as const;

export const practiceModeSchema = z.enum(PRACTICE_MODE_VALUES);
export const practiceSubmissionStatusSchema = z.enum(PRACTICE_SUBMISSION_STATUS_VALUES);

const jsonRecordSchema = z.record(z.string(), z.unknown());

function normalizeSubmittedAt(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function normalizePracticeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizePracticeValue(entry)).sort().join('|');
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

export const practiceSubmissionPartSchema = z.object({
  partId: z.string().trim().min(1),
  rawAnswer: z.unknown(),
  normalizedAnswer: z.string().optional(),
  isCorrect: z.boolean().optional(),
  score: z.number().optional(),
  maxScore: z.number().optional(),
  misconceptionTags: z.array(z.string()).optional(),
  hintsUsed: z.number().int().nonnegative().optional(),
  revealStepsSeen: z.number().int().nonnegative().optional(),
  changedCount: z.number().int().nonnegative().optional(),
});

export type PracticeSubmissionPart = z.infer<typeof practiceSubmissionPartSchema>;

export const practiceSubmissionEnvelopeSchema = z.object({
  contractVersion: z.literal(PRACTICE_CONTRACT_VERSION),
  activityId: z.string().trim().min(1),
  mode: practiceModeSchema,
  status: practiceSubmissionStatusSchema,
  attemptNumber: z.number().int().positive(),
  submittedAt: z.string().min(1),
  answers: jsonRecordSchema,
  parts: z.array(practiceSubmissionPartSchema),
  artifact: jsonRecordSchema.optional(),
  interactionHistory: z.array(z.unknown()).optional(),
  analytics: jsonRecordSchema.optional(),
  studentFeedback: z.string().optional(),
  teacherSummary: z.string().optional(),
});

export type PracticeSubmissionEnvelope = z.infer<typeof practiceSubmissionEnvelopeSchema>;

export type PracticeSubmissionCallbackPayload = PracticeSubmissionEnvelope;

export function isPracticeSubmissionEnvelope(
  value: unknown,
): value is PracticeSubmissionEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'contractVersion' in value &&
    (value as { contractVersion?: unknown }).contractVersion === PRACTICE_CONTRACT_VERSION
  );
}

const practiceSubmissionInputSchema = z.object({
  contractVersion: z.literal(PRACTICE_CONTRACT_VERSION).optional(),
  activityId: z.string().trim().min(1).optional(),
  mode: practiceModeSchema.optional(),
  status: practiceSubmissionStatusSchema.optional(),
  attemptNumber: z.number().int().positive().optional(),
  submittedAt: z.union([z.string().min(1), z.date()]).optional(),
  answers: jsonRecordSchema.optional(),
  responses: jsonRecordSchema.optional(),
  parts: z.array(practiceSubmissionPartSchema).optional(),
  artifact: jsonRecordSchema.optional(),
  interactionHistory: z.array(z.unknown()).optional(),
  analytics: jsonRecordSchema.optional(),
  metadata: jsonRecordSchema.optional(),
  studentFeedback: z.string().optional(),
  teacherSummary: z.string().optional(),
});

export type PracticeSubmissionInput = z.infer<typeof practiceSubmissionInputSchema>;

export function buildPracticeSubmissionParts(
  answers: Record<string, unknown>,
): PracticeSubmissionPart[] {
  return Object.entries(answers).map(([partId, rawAnswer]) => ({
    partId,
    rawAnswer,
    normalizedAnswer: normalizePracticeValue(rawAnswer),
  }));
}

export function buildPracticeSubmissionEnvelope(input: {
  activityId: string;
  mode: z.infer<typeof practiceModeSchema>;
  status?: z.infer<typeof practiceSubmissionStatusSchema>;
  attemptNumber?: number;
  submittedAt?: string | Date;
  answers: Record<string, unknown>;
  parts?: PracticeSubmissionPart[];
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
}): PracticeSubmissionEnvelope {
  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: PRACTICE_CONTRACT_VERSION,
    activityId: input.activityId,
    mode: input.mode,
    status: input.status ?? 'submitted',
    attemptNumber: input.attemptNumber ?? 1,
    submittedAt: normalizeSubmittedAt(input.submittedAt ?? new Date()),
    answers: input.answers,
    parts: input.parts ?? buildPracticeSubmissionParts(input.answers),
    artifact: input.artifact,
    interactionHistory: input.interactionHistory,
    analytics: input.analytics,
    studentFeedback: input.studentFeedback,
    teacherSummary: input.teacherSummary,
  });
}

export function normalizePracticeSubmissionInput(
  input: unknown,
  defaults: {
    activityId?: string;
    mode?: z.infer<typeof practiceModeSchema>;
    status?: z.infer<typeof practiceSubmissionStatusSchema>;
    attemptNumber?: number;
    submittedAt?: string | Date;
  } = {},
): PracticeSubmissionEnvelope {
  const parsed = practiceSubmissionInputSchema.parse(input);

  const activityId = parsed.activityId ?? defaults.activityId;
  if (!activityId) {
    throw new Error('activityId is required to normalize a practice submission.');
  }

  const answers = parsed.answers ?? parsed.responses ?? {};
  const submittedAt = parsed.submittedAt ?? defaults.submittedAt ?? new Date();
  const analytics = parsed.analytics ?? parsed.metadata;

  return practiceSubmissionEnvelopeSchema.parse({
    contractVersion: PRACTICE_CONTRACT_VERSION,
    activityId,
    mode: parsed.mode ?? defaults.mode ?? 'assessment',
    status: parsed.status ?? defaults.status ?? 'submitted',
    attemptNumber: parsed.attemptNumber ?? defaults.attemptNumber ?? 1,
    submittedAt: normalizeSubmittedAt(submittedAt),
    answers,
    parts: parsed.parts ?? buildPracticeSubmissionParts(answers),
    artifact: parsed.artifact,
    interactionHistory: parsed.interactionHistory,
    analytics,
    studentFeedback: parsed.studentFeedback,
    teacherSummary: parsed.teacherSummary,
  });
}
