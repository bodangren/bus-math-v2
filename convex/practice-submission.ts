import { v } from 'convex/values';

export const practiceModeValidator = v.union(
  v.literal('worked_example'),
  v.literal('guided_practice'),
  v.literal('independent_practice'),
  v.literal('assessment'),
);

export const practiceSubmissionStatusValidator = v.union(
  v.literal('draft'),
  v.literal('submitted'),
  v.literal('graded'),
  v.literal('returned'),
);

export const practiceSubmissionPartValidator = v.object({
  partId: v.string(),
  rawAnswer: v.any(),
  normalizedAnswer: v.optional(v.string()),
  isCorrect: v.optional(v.boolean()),
  score: v.optional(v.number()),
  maxScore: v.optional(v.number()),
  misconceptionTags: v.optional(v.array(v.string())),
  hintsUsed: v.optional(v.number()),
  revealStepsSeen: v.optional(v.number()),
  changedCount: v.optional(v.number()),
});

export const practiceSubmissionEnvelopeValidator = v.object({
  contractVersion: v.literal('practice.v1'),
  activityId: v.string(),
  mode: practiceModeValidator,
  status: practiceSubmissionStatusValidator,
  attemptNumber: v.number(),
  submittedAt: v.string(),
  answers: v.record(v.string(), v.any()),
  parts: v.array(practiceSubmissionPartValidator),
  artifact: v.optional(v.record(v.string(), v.any())),
  interactionHistory: v.optional(v.array(v.any())),
  analytics: v.optional(v.record(v.string(), v.any())),
  studentFeedback: v.optional(v.string()),
  teacherSummary: v.optional(v.string()),
});
