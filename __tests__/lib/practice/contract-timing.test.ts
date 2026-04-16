import { describe, it, expect } from 'vitest';
import {
  buildPracticeSubmissionEnvelope,
  normalizePracticeSubmissionInput,
  practiceTimingSummarySchema,
} from '@/lib/practice/contract';

describe('contract timing integration', () => {
  const validTiming = {
    startedAt: '2026-01-01T00:00:01.000Z',
    submittedAt: '2026-01-01T00:02:00.000Z',
    wallClockMs: 119000,
    activeMs: 90000,
    idleMs: 29000,
    pauseCount: 0,
    focusLossCount: 0,
    visibilityHiddenCount: 0,
    confidence: 'high' as const,
  };

  describe('buildPracticeSubmissionEnvelope with timing', () => {
    it('accepts timing and includes it in output', () => {
      const envelope = buildPracticeSubmissionEnvelope({
        activityId: 'test-activity',
        mode: 'assessment',
        answers: { q1: 'correct' },
        timing: validTiming,
      });

      expect(envelope.timing).toEqual(validTiming);
    });

    it('envelope without timing is valid (backward compat)', () => {
      const envelope = buildPracticeSubmissionEnvelope({
        activityId: 'test-activity',
        mode: 'assessment',
        answers: { q1: 'correct' },
      });

      expect(envelope.timing).toBeUndefined();
    });

    it('rejects timing where activeMs exceeds wallClockMs', () => {
      const invalidTiming = {
        ...validTiming,
        activeMs: 200000,
        wallClockMs: 100000,
      };

      expect(() =>
        buildPracticeSubmissionEnvelope({
          activityId: 'test-activity',
          mode: 'assessment',
          answers: { q1: 'correct' },
          timing: invalidTiming,
        }),
      ).toThrow();
    });
  });

  describe('normalizePracticeSubmissionInput with timing', () => {
    it('passes timing through if provided', () => {
      const result = normalizePracticeSubmissionInput({
        activityId: 'test-activity',
        mode: 'assessment',
        answers: { q1: 'correct' },
        timing: validTiming,
      });

      expect(result.timing).toEqual(validTiming);
    });

    it('envelope without timing is valid (backward compat)', () => {
      const result = normalizePracticeSubmissionInput({
        activityId: 'test-activity',
        mode: 'assessment',
        answers: { q1: 'correct' },
      });

      expect(result.timing).toBeUndefined();
    });
  });

  describe('practiceTimingSummarySchema validation', () => {
    it('accepts valid timing summary', () => {
      const result = practiceTimingSummarySchema.safeParse(validTiming);
      expect(result.success).toBe(true);
    });

    it('rejects timing where activeMs > wallClockMs', () => {
      const result = practiceTimingSummarySchema.safeParse({
        ...validTiming,
        activeMs: 200000,
        wallClockMs: 100000,
      });
      expect(result.success).toBe(false);
    });

    it('accepts timing with optional longestIdleMs', () => {
      const result = practiceTimingSummarySchema.safeParse({
        ...validTiming,
        longestIdleMs: 5000,
      });
      expect(result.success).toBe(true);
    });

    it('accepts timing with confidenceReasons', () => {
      const result = practiceTimingSummarySchema.safeParse({
        ...validTiming,
        confidenceReasons: ['focus_loss', 'visibility_hidden'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid confidence value', () => {
      const result = practiceTimingSummarySchema.safeParse({
        ...validTiming,
        confidence: 'invalid' as 'high',
      });
      expect(result.success).toBe(false);
    });
  });
});