import { describe, it, expect } from 'vitest';
import {
  computeTimingBaseline,
  deriveTimingFeatures,
  TIMING_BASELINE_MIN_SAMPLES,
  type PracticeTimingBaseline,
} from '@/lib/practice/timing-baseline';
import type { PracticeTimingSummary } from '@/lib/practice/contract';

function makeTiming(activeMs: number, confidence: PracticeTimingSummary['confidence']): PracticeTimingSummary {
  return {
    startedAt: '2026-01-01T00:00:00.000Z',
    submittedAt: '2026-01-01T00:00:00.000Z',
    wallClockMs: activeMs,
    activeMs,
    idleMs: 0,
    pauseCount: 0,
    focusLossCount: 0,
    visibilityHiddenCount: 0,
    confidence,
  };
}

describe('computeTimingBaseline', () => {
  it('returns zeroed baseline when no timings are provided', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: [],
      computedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(baseline.problemFamilyId).toBe('family-a');
    expect(baseline.sampleCount).toBe(0);
    expect(baseline.medianActiveMs).toBe(0);
    expect(baseline.minSamplesMet).toBe(false);
    expect(baseline.p25ActiveMs).toBeUndefined();
    expect(baseline.p75ActiveMs).toBeUndefined();
    expect(baseline.p90ActiveMs).toBeUndefined();
  });

  it('excludes low-confidence submissions from baseline', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: [
        makeTiming(1000, 'high'),
        makeTiming(2000, 'medium'),
        makeTiming(999_999, 'low'),
      ],
      computedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(baseline.sampleCount).toBe(2);
    expect(baseline.medianActiveMs).toBe(1500);
  });

  it('computes median correctly for odd and even sample counts', () => {
    const odd = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: [
        makeTiming(1000, 'high'),
        makeTiming(2000, 'high'),
        makeTiming(3000, 'high'),
      ],
    });
    expect(odd.medianActiveMs).toBe(2000);

    const even = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: [
        makeTiming(1000, 'high'),
        makeTiming(2000, 'high'),
        makeTiming(3000, 'high'),
        makeTiming(4000, 'high'),
      ],
    });
    expect(even.medianActiveMs).toBe(2500);
  });

  it('computes percentiles (p25, p75, p90)', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: Array.from({ length: 10 }, (_, i) => makeTiming((i + 1) * 1000, 'high')),
    });

    expect(baseline.p25ActiveMs).toBe(3250);
    expect(baseline.p75ActiveMs).toBe(7750);
    expect(baseline.p90ActiveMs).toBe(9100);
  });

  it('is robust to outliers because it uses median, not mean', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: [
        makeTiming(1000, 'high'),
        makeTiming(2000, 'high'),
        makeTiming(3000, 'high'),
        makeTiming(10_000_000, 'high'),
      ],
    });

    expect(baseline.medianActiveMs).toBe(2500);
  });

  it('marks minSamplesMet false when sample count is below threshold', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: Array.from({ length: TIMING_BASELINE_MIN_SAMPLES - 1 }, () =>
        makeTiming(1000, 'high'),
      ),
    });

    expect(baseline.sampleCount).toBe(TIMING_BASELINE_MIN_SAMPLES - 1);
    expect(baseline.minSamplesMet).toBe(false);
  });

  it('marks minSamplesMet true when sample count meets threshold', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: Array.from({ length: TIMING_BASELINE_MIN_SAMPLES }, () =>
        makeTiming(1000, 'high'),
      ),
    });

    expect(baseline.sampleCount).toBe(TIMING_BASELINE_MIN_SAMPLES);
    expect(baseline.minSamplesMet).toBe(true);
  });

  it('uses custom minSamples when provided', () => {
    const baseline = computeTimingBaseline({
      problemFamilyId: 'family-a',
      timings: Array.from({ length: 5 }, () => makeTiming(1000, 'high')),
      minSamples: 5,
    });

    expect(baseline.minSamplesMet).toBe(true);
  });
});

describe('deriveTimingFeatures', () => {
  const baseline: PracticeTimingBaseline = {
    problemFamilyId: 'family-a',
    sampleCount: TIMING_BASELINE_MIN_SAMPLES,
    medianActiveMs: 10_000,
    lastComputedAt: '2026-01-01T00:00:00.000Z',
    minSamplesMet: true,
  };

  it('returns hasReliableTiming false when submission confidence is low', () => {
    const features = deriveTimingFeatures(makeTiming(5000, 'low'), baseline);

    expect(features.hasReliableTiming).toBe(false);
    expect(features.confidence).toBe('low');
    expect(features.reasons).toContain('timing_confidence_low');
    expect(features.timeRatio).toBeUndefined();
  });

  it('returns hasReliableTiming false when baseline is missing', () => {
    const features = deriveTimingFeatures(makeTiming(5000, 'high'), null);

    expect(features.hasReliableTiming).toBe(false);
    expect(features.reasons).toContain('baseline_missing');
    expect(features.timeRatio).toBeUndefined();
  });

  it('returns hasReliableTiming false when baseline has insufficient samples', () => {
    const inactiveBaseline: PracticeTimingBaseline = {
      ...baseline,
      sampleCount: TIMING_BASELINE_MIN_SAMPLES - 1,
      minSamplesMet: false,
    };
    const features = deriveTimingFeatures(makeTiming(5000, 'high'), inactiveBaseline);

    expect(features.hasReliableTiming).toBe(false);
    expect(features.reasons).toContain('baseline_sample_count_insufficient');
    expect(features.timeRatio).toBeUndefined();
  });

  it('classifies fast timing when timeRatio is below threshold', () => {
    const features = deriveTimingFeatures(makeTiming(4000, 'high'), baseline);

    expect(features.hasReliableTiming).toBe(true);
    expect(features.timeRatio).toBe(0.4);
    expect(features.speedBand).toBe('fast');
    expect(features.reasons).toContain('timing_fast');
  });

  it('classifies expected timing when timeRatio is within normal range', () => {
    const features = deriveTimingFeatures(makeTiming(12_000, 'high'), baseline);

    expect(features.hasReliableTiming).toBe(true);
    expect(features.timeRatio).toBe(1.2);
    expect(features.speedBand).toBe('expected');
    expect(features.reasons).not.toContain('timing_expected');
  });

  it('classifies slow timing when timeRatio exceeds expected threshold', () => {
    const features = deriveTimingFeatures(makeTiming(20_000, 'high'), baseline);

    expect(features.hasReliableTiming).toBe(true);
    expect(features.timeRatio).toBe(2);
    expect(features.speedBand).toBe('slow');
    expect(features.reasons).toContain('timing_slow');
  });

  it('classifies very_slow timing when timeRatio far exceeds baseline', () => {
    const features = deriveTimingFeatures(makeTiming(30_000, 'high'), baseline);

    expect(features.hasReliableTiming).toBe(true);
    expect(features.timeRatio).toBe(3);
    expect(features.speedBand).toBe('very_slow');
    expect(features.reasons).toContain('timing_very_slow');
  });

  it('preserves submission activeMs and baseline median in output', () => {
    const features = deriveTimingFeatures(makeTiming(7500, 'high'), baseline);

    expect(features.activeMs).toBe(7500);
    expect(features.baselineMedianActiveMs).toBe(10_000);
  });
});