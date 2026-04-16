import { z } from 'zod';

export const SRS_CONTRACT_VERSION = 'srs.contract.v1' as const;

export const srsRatingSchema = z.enum(['Again', 'Hard', 'Good', 'Easy']);
export type SrsRating = z.infer<typeof srsRatingSchema>;

export const srsCardStateSchema = z.object({
  problemFamilyId: z.string().min(1),
  studentId: z.string().min(1),
  card: z.record(z.string(), z.unknown()),
  due: z.number(),
  lastReview: z.number(),
  reviewCount: z.number().int().nonnegative(),
  createdAt: z.number(),
});
export type SrsCardState = z.infer<typeof srsCardStateSchema>;

export const srsReviewLogSchema = z.object({
  problemFamilyId: z.string().min(1),
  studentId: z.string().min(1),
  rating: srsRatingSchema,
  scheduledAt: z.number(),
  reviewedAt: z.number(),
  elapsedDays: z.number(),
  scheduledDays: z.number(),
  reviewDurationMs: z.number().nonnegative().optional(),
  timingConfidence: z.string().optional(),
});
export type SrsReviewLog = z.infer<typeof srsReviewLogSchema>;

export const srsSessionSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  startedAt: z.number(),
  completedAt: z.number().optional(),
  cardCount: z.number().int().nonnegative(),
  ratings: z.object({
    again: z.number().int().nonnegative(),
    hard: z.number().int().nonnegative(),
    good: z.number().int().nonnegative(),
    easy: z.number().int().nonnegative(),
  }),
});
export type SrsSession = z.infer<typeof srsSessionSchema>;

export const dailyQueueSchema = z.object({
  cards: z.array(srsCardStateSchema),
  sessionSize: z.number().int().positive(),
  generatedAt: z.number(),
});
export type DailyQueue = z.infer<typeof dailyQueueSchema>;

export const srsReviewResultSchema = z.object({
  card: srsCardStateSchema,
  reviewLog: srsReviewLogSchema,
  rating: srsRatingSchema,
});
export type SrsReviewResult = z.infer<typeof srsReviewResultSchema>;
