import type { PracticeSubmissionPart } from './contract';
import type { PracticeTimingFeatures } from './timing-baseline';

export type SrsRating = 'Again' | 'Hard' | 'Good' | 'Easy';

export type SrsRatingInput = {
  parts: Pick<
    PracticeSubmissionPart,
    'isCorrect' | 'hintsUsed' | 'revealStepsSeen' | 'misconceptionTags'
  >[];
  timingFeatures: PracticeTimingFeatures;
  baselineSampleCount?: number;
};

export type SrsRatingResult = {
  rating: SrsRating;
  baseRating: SrsRating;
  timingAdjusted: boolean;
  reasons: string[];
  timingFeatures?: {
    hasReliableTiming: boolean;
    timeRatio?: number;
    speedBand?: string;
    baselineSampleCount?: number;
  };
};

/**
 * Compute a base SRS rating from practice submission parts.
 *
 * Rules (in order of priority):
 * 1. Any incorrect part → Again
 * 2. Any misconception tag → Again
 * 3. Any hints or reveal steps used → Hard
 * 4. All correct with no aids → Good
 * 5. No correctness data → Again (conservative default)
 */
export function computeBaseRating(parts: SrsRatingInput['parts']): SrsRating {
  let allCorrect = true;
  let hasAid = false;

  for (const part of parts) {
    if (part.isCorrect === false) {
      return 'Again';
    }

    if (part.misconceptionTags && part.misconceptionTags.length > 0) {
      return 'Again';
    }

    if ((part.hintsUsed ?? 0) > 0 || (part.revealStepsSeen ?? 0) > 0) {
      hasAid = true;
    }

    if (part.isCorrect !== true) {
      allCorrect = false;
    }
  }

  if (!allCorrect) {
    return 'Again';
  }

  if (hasAid) {
    return 'Hard';
  }

  return 'Good';
}

/**
 * Apply timing features as a conservative modifier to a base SRS rating.
 *
 * Timing never overrides correctness:
 * - Again stays Again regardless of timing
 * - Hard stays Hard regardless of timing (already penalized for hints/reveals)
 * - Good may become Easy (fast + reliable) or Hard (slow/very_slow + reliable)
 */
export function applyTimingToRating(
  baseRating: SrsRating,
  timingFeatures: PracticeTimingFeatures,
): Pick<SrsRatingResult, 'rating' | 'timingAdjusted' | 'reasons'> {
  const reasons: string[] = [];

  if (!timingFeatures.hasReliableTiming) {
    reasons.push('timing_ignored_unreliable');
    return { rating: baseRating, timingAdjusted: false, reasons };
  }

  if (timingFeatures.speedBand && timingFeatures.speedBand !== 'expected') {
    reasons.push(`timing_${timingFeatures.speedBand}`);
  }

  if (baseRating === 'Again') {
    return { rating: 'Again', timingAdjusted: false, reasons };
  }

  if (baseRating === 'Good') {
    if (timingFeatures.speedBand === 'fast') {
      reasons.push('timing_upgraded_easy');
      return { rating: 'Easy', timingAdjusted: true, reasons };
    }
    if (timingFeatures.speedBand === 'slow' || timingFeatures.speedBand === 'very_slow') {
      reasons.push('timing_downgraded_hard');
      return { rating: 'Hard', timingAdjusted: true, reasons };
    }
  }

  if (baseRating === 'Hard') {
    return { rating: 'Hard', timingAdjusted: false, reasons };
  }

  return { rating: baseRating, timingAdjusted: false, reasons };
}

/**
 * Map a practice submission and its timing features to a time-aware SRS rating.
 *
 * Returns the final rating, the base rating before timing, whether timing modified
 * the result, and an audit trail of reasons.
 */
export function mapPracticeToSrsRating(input: SrsRatingInput): SrsRatingResult {
  const baseRating = computeBaseRating(input.parts);
  const timingResult = applyTimingToRating(baseRating, input.timingFeatures);

  return {
    rating: timingResult.rating,
    baseRating,
    timingAdjusted: timingResult.timingAdjusted,
    reasons: timingResult.reasons,
    timingFeatures: {
      hasReliableTiming: input.timingFeatures.hasReliableTiming,
      timeRatio: input.timingFeatures.timeRatio,
      speedBand: input.timingFeatures.speedBand,
      baselineSampleCount: input.baselineSampleCount,
    },
  };
}