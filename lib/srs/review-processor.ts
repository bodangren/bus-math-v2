import type { PracticeSubmissionEnvelope, PracticeTimingSummary } from '../practice/contract';
import type { PracticeTimingBaseline } from '../practice/timing-baseline';
import { deriveTimingFeatures } from '../practice/timing-baseline';
import { mapPracticeToSrsRating } from '../practice/srs-rating';
import { createNewCard, reviewCard } from './scheduler';
import type { SrsCardState, SrsReviewLog, SrsReviewResult } from './contract';

export function processPracticeSubmission(
  envelope: PracticeSubmissionEnvelope,
  cardState: SrsCardState | null,
  timing?: PracticeTimingSummary,
  baseline?: PracticeTimingBaseline,
  studentId?: string,
): SrsReviewResult {
  const effectiveTiming = timing ?? envelope.timing;
  const timingFeatures = effectiveTiming
    ? deriveTimingFeatures(effectiveTiming, baseline)
    : { hasReliableTiming: false, confidence: 'low' as const, reasons: ['timing_missing'] };

  const ratingResult = mapPracticeToSrsRating({
    parts: envelope.parts.map((p) => ({
      isCorrect: p.isCorrect,
      hintsUsed: p.hintsUsed,
      revealStepsSeen: p.revealStepsSeen,
      misconceptionTags: p.misconceptionTags,
    })),
    timingFeatures,
  });

  const effectiveStudentId = studentId ?? cardState?.studentId ?? 'unknown';
  const effectiveCard = cardState ?? createNewCard(envelope.activityId, effectiveStudentId);
  const reviewedCard = reviewCard(effectiveCard, ratingResult.rating);

  const now = Date.now();
  const scheduledAt = now;
  const reviewedAt = now;
  const elapsedDays = Math.floor((reviewedAt - effectiveCard.lastReview) / (24 * 60 * 60 * 1000));
  const scheduledDays = Math.floor((reviewedCard.due - reviewedAt) / (24 * 60 * 60 * 1000));

  const reviewLog: SrsReviewLog = {
    problemFamilyId: reviewedCard.problemFamilyId,
    studentId: reviewedCard.studentId,
    rating: ratingResult.rating,
    scheduledAt,
    reviewedAt,
    elapsedDays,
    scheduledDays,
    reviewDurationMs: effectiveTiming?.wallClockMs,
    timingConfidence: timingFeatures.confidence,
  };

  return {
    card: reviewedCard,
    reviewLog,
    rating: ratingResult.rating,
  };
}