import { describe, it, expect } from 'vitest';
import { processPracticeSubmission } from '../../../lib/srs/review-processor';
import { createNewCard } from '../../../lib/srs/scheduler';
import type { PracticeSubmissionEnvelope } from '../../../lib/practice/contract';
import type { PracticeTimingSummary } from '../../../lib/practice/contract';

function makeEnvelope(parts: Array<{
  partId: string;
  isCorrect?: boolean;
  hintsUsed?: number;
  misconceptionTags?: string[];
}>): PracticeSubmissionEnvelope {
  return {
    contractVersion: 'practice.v1',
    activityId: 'transaction-effects',
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers: {},
    parts: parts.map((p) => ({
      partId: p.partId,
      rawAnswer: null,
      isCorrect: p.isCorrect,
      hintsUsed: p.hintsUsed,
      misconceptionTags: p.misconceptionTags,
    })),
  };
}

function makeTiming(confidence: 'high' | 'medium' | 'low' = 'high'): PracticeTimingSummary {
  return {
    startedAt: new Date(Date.now() - 60000).toISOString(),
    submittedAt: new Date().toISOString(),
    wallClockMs: 60000,
    activeMs: 45000,
    idleMs: 15000,
    pauseCount: 0,
    focusLossCount: 0,
    visibilityHiddenCount: 0,
    confidence,
    confidenceReasons: [],
  };
}

describe('lib/srs/review-processor', () => {
  describe('processPracticeSubmission', () => {
    it('all-correct submission produces Good or Easy rating', () => {
      const envelope = makeEnvelope([
        { partId: 'p1', isCorrect: true },
        { partId: 'p2', isCorrect: true },
      ]);
      const result = processPracticeSubmission(envelope, null, makeTiming('high'), undefined, 'student-1');
      expect(['Good', 'Easy']).toContain(result.rating);
    });

    it('incorrect submission produces Again rating', () => {
      const envelope = makeEnvelope([
        { partId: 'p1', isCorrect: false },
        { partId: 'p2', isCorrect: true },
      ]);
      const result = processPracticeSubmission(envelope, null, makeTiming('high'), undefined, 'student-1');
      expect(result.rating).toBe('Again');
    });

    it('submission with hints used produces Hard rating', () => {
      const envelope = makeEnvelope([
        { partId: 'p1', isCorrect: true, hintsUsed: 1 },
        { partId: 'p2', isCorrect: true },
      ]);
      const result = processPracticeSubmission(envelope, null, makeTiming('high'), undefined, 'student-1');
      expect(result.rating).toBe('Hard');
    });

    it('null cardState creates new card with provided studentId', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      const result = processPracticeSubmission(envelope, null, makeTiming('high'), undefined, 'student-42');
      expect(result.card.problemFamilyId).toBe('transaction-effects');
      expect(result.card.studentId).toBe('student-42');
      expect(result.card.reviewCount).toBe(1);
    });

    it('null cardState without studentId throws error', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      expect(() => processPracticeSubmission(envelope, null, makeTiming('high'))).toThrow(
        'studentId is required when no existing card state is provided'
      );
    });

    it('existing cardState updates card', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      const existingCard = createNewCard('transaction-effects', 'student-1');
      existingCard.reviewCount = 3;
      const result = processPracticeSubmission(envelope, existingCard, makeTiming('high'));
      expect(result.card.reviewCount).toBe(4);
    });

it('timing data with fast speed band can upgrade Good to Easy', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      const timing = makeTiming('high');
      timing.activeMs = 5000;
      const baseline: import('../../../lib/practice/timing-baseline').PracticeTimingBaseline = {
        problemFamilyId: 'transaction-effects',
        sampleCount: 15,
        medianActiveMs: 30000,
        minSamplesMet: true,
        lastComputedAt: new Date().toISOString(),
      };
      const result = processPracticeSubmission(envelope, null, timing, baseline, 'student-1');
      expect(result.rating).toBe('Easy');
    });

    it('timing data with slow speed band can downgrade Good to Hard', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      const timing = makeTiming('high');
      timing.activeMs = 120000;
      const baseline: import('../../../lib/practice/timing-baseline').PracticeTimingBaseline = {
        problemFamilyId: 'transaction-effects',
        sampleCount: 15,
        medianActiveMs: 30000,
        minSamplesMet: true,
        lastComputedAt: new Date().toISOString(),
      };
      const result = processPracticeSubmission(envelope, null, timing, baseline, 'student-1');
      expect(result.rating).toBe('Hard');
    });

    it('low confidence timing is ignored', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      const result = processPracticeSubmission(envelope, null, makeTiming('low'), undefined, 'student-1');
      expect(result.rating).toBe('Good');
    });

    it('misconception tags produce Again rating', () => {
      const envelope = makeEnvelope([
        { partId: 'p1', isCorrect: true, misconceptionTags: ['misconception-1'] },
      ]);
      const result = processPracticeSubmission(envelope, null, makeTiming('high'), undefined, 'student-1');
      expect(result.rating).toBe('Again');
    });

    it('reviewLog has correct fields', () => {
      const envelope = makeEnvelope([{ partId: 'p1', isCorrect: true }]);
      const result = processPracticeSubmission(envelope, null, makeTiming('high'), undefined, 'student-1');
      expect(result.reviewLog.problemFamilyId).toBe('transaction-effects');
      expect(result.reviewLog.rating).toBe(result.rating);
      expect(result.reviewLog.scheduledAt).toBeGreaterThan(0);
      expect(result.reviewLog.reviewedAt).toBeGreaterThan(0);
    });
  });
});