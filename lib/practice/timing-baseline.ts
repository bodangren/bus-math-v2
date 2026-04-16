import type { PracticeTimingSummary, PracticeTimingConfidence } from './contract';

/**
 * Practice Timing Baselines
 *
 * Problem family identifiers are intentionally generic (`problemFamilyId: string`).
 * Callers may use `activityId`, `componentKey`, or a composite identifier such as
 * `${componentKey}:${problemType}` depending on the granularity needed for the
 * course. This keeps the baseline logic course-agnostic and reusable.
 */

/** Minimum number of high/medium-confidence submissions before a baseline is considered reliable. */
export const TIMING_BASELINE_MIN_SAMPLES = 10;

/**
 * Speed bands are derived from the ratio of a student's active time to the
 * problem-family median active time. Median is preferred over mean because it
 * is robust to outliers (abandoned tabs, interruptions, or students who walk
 * away). Percentiles give additional context about the spread of the
 * distribution without being skewed by extreme values.
 */
export const SPEED_BAND_THRESHOLDS = {
  /** Materially faster than baseline. */
  fast: 0.5,
  /** Upper bound of expected timing. */
  expected: 1.5,
  /** Materially slower than baseline. */
  slow: 2.5,
} as const;

export type TimingSpeedBand = 'fast' | 'expected' | 'slow' | 'very_slow';

export type PracticeTimingBaseline = {
  problemFamilyId: string;
  sampleCount: number;
  medianActiveMs: number;
  p25ActiveMs?: number;
  p75ActiveMs?: number;
  p90ActiveMs?: number;
  lastComputedAt: string;
  minSamplesMet: boolean;
};

export type PracticeTimingFeatures = {
  hasReliableTiming: boolean;
  activeMs?: number;
  baselineMedianActiveMs?: number;
  timeRatio?: number;
  speedBand?: TimingSpeedBand;
  confidence: PracticeTimingConfidence;
  reasons: string[];
};

/** Input for computing a baseline from a collection of timing summaries. */
export type ComputeBaselineInput = {
  problemFamilyId: string;
  /** Only high/medium confidence submissions should be included. */
  timings: Pick<PracticeTimingSummary, 'activeMs' | 'confidence'>[];
  /** Defaults to TIMING_BASELINE_MIN_SAMPLES. */
  minSamples?: number;
  /** Defaults to now. */
  computedAt?: string;
};

/** Derive a timing baseline from a set of eligible submission timings. */
export function computeTimingBaseline(input: ComputeBaselineInput): PracticeTimingBaseline {
  const { problemFamilyId, timings, minSamples = TIMING_BASELINE_MIN_SAMPLES, computedAt } =
    input;

  const eligible = timings.filter((t) => t.confidence !== 'low');
  const activeMsValues = eligible.map((t) => t.activeMs).sort((a, b) => a - b);
  const sampleCount = activeMsValues.length;
  const minSamplesMet = sampleCount >= minSamples;

  const medianActiveMs = computePercentile(activeMsValues, 0.5);

  return {
    problemFamilyId,
    sampleCount,
    medianActiveMs,
    p25ActiveMs: sampleCount > 0 ? computePercentile(activeMsValues, 0.25) : undefined,
    p75ActiveMs: sampleCount > 0 ? computePercentile(activeMsValues, 0.75) : undefined,
    p90ActiveMs: sampleCount > 0 ? computePercentile(activeMsValues, 0.9) : undefined,
    lastComputedAt: computedAt ?? new Date().toISOString(),
    minSamplesMet,
  };
}

/** Derive timing features for a single review attempt given a baseline. */
export function deriveTimingFeatures(
  timing: PracticeTimingSummary,
  baseline: PracticeTimingBaseline | null | undefined,
): PracticeTimingFeatures {
  const reasons: string[] = [];

  if (timing.confidence === 'low') {
    reasons.push('timing_confidence_low');
    return {
      hasReliableTiming: false,
      activeMs: timing.activeMs,
      confidence: 'low',
      reasons,
    };
  }

  if (!baseline || !baseline.minSamplesMet) {
    reasons.push(baseline ? 'baseline_sample_count_insufficient' : 'baseline_missing');
    return {
      hasReliableTiming: false,
      activeMs: timing.activeMs,
      baselineMedianActiveMs: baseline?.medianActiveMs,
      confidence: timing.confidence,
      reasons,
    };
  }

  const timeRatio = timing.activeMs / baseline.medianActiveMs;
  const speedBand = resolveSpeedBand(timeRatio);

  if (speedBand !== 'expected') {
    reasons.push(`timing_${speedBand}`);
  }

  return {
    hasReliableTiming: true,
    activeMs: timing.activeMs,
    baselineMedianActiveMs: baseline.medianActiveMs,
    timeRatio,
    speedBand,
    confidence: timing.confidence,
    reasons,
  };
}

function resolveSpeedBand(timeRatio: number): TimingSpeedBand {
  if (timeRatio < SPEED_BAND_THRESHOLDS.fast) return 'fast';
  if (timeRatio <= SPEED_BAND_THRESHOLDS.expected) return 'expected';
  if (timeRatio <= SPEED_BAND_THRESHOLDS.slow) return 'slow';
  return 'very_slow';
}

function computePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];

  const index = percentile * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sortedValues[lower];

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}