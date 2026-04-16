import { describe, it, expect } from 'vitest';
import {
  SRS_CONTRACT_VERSION,
  srsRatingSchema,
  srsCardStateSchema,
  srsReviewLogSchema,
  srsSessionSchema,
  dailyQueueSchema,
  srsReviewResultSchema,
  type SrsRating,
} from '@/lib/srs/contract';

describe('SRS Contract', () => {
  describe('version', () => {
    it('exports srs.contract.v1', () => {
      expect(SRS_CONTRACT_VERSION).toBe('srs.contract.v1');
    });
  });

  describe('srsRatingSchema', () => {
    it('accepts all four valid ratings', () => {
      const ratings: SrsRating[] = ['Again', 'Hard', 'Good', 'Easy'];
      for (const rating of ratings) {
        expect(srsRatingSchema.safeParse(rating).success).toBe(true);
      }
    });

    it('rejects invalid ratings', () => {
      expect(srsRatingSchema.safeParse('again').success).toBe(false);
      expect(srsRatingSchema.safeParse('Excellent').success).toBe(false);
      expect(srsRatingSchema.safeParse(42).success).toBe(false);
      expect(srsRatingSchema.safeParse(null).success).toBe(false);
    });
  });

  describe('srsCardStateSchema', () => {
    const validCard = {
      problemFamilyId: 'accounting-equation',
      studentId: 'student-123',
      card: { state: 'new' },
      due: Date.now(),
      lastReview: Date.now(),
      reviewCount: 0,
      createdAt: Date.now(),
    };

    it('validates correct card state', () => {
      expect(srsCardStateSchema.safeParse(validCard).success).toBe(true);
    });

    it('rejects missing fields', () => {
      expect(srsCardStateSchema.safeParse({}).success).toBe(false);
    });

    it('rejects empty problemFamilyId', () => {
      expect(
        srsCardStateSchema.safeParse({ ...validCard, problemFamilyId: '' }).success,
      ).toBe(false);
    });

    it('rejects negative reviewCount', () => {
      expect(
        srsCardStateSchema.safeParse({ ...validCard, reviewCount: -1 }).success,
      ).toBe(false);
    });
  });

  describe('srsReviewLogSchema', () => {
    const validLog = {
      problemFamilyId: 'accounting-equation',
      studentId: 'student-123',
      rating: 'Good' as const,
      scheduledAt: Date.now(),
      reviewedAt: Date.now(),
      elapsedDays: 0,
      scheduledDays: 1,
      reviewDurationMs: 15000,
      timingConfidence: 'high',
    };

    it('validates correct review log', () => {
      expect(srsReviewLogSchema.safeParse(validLog).success).toBe(true);
    });

    it('rejects invalid rating', () => {
      expect(
        srsReviewLogSchema.safeParse({ ...validLog, rating: 'Okay' }).success,
      ).toBe(false);
    });

    it('allows optional fields to be omitted', () => {
      const minimalLog = {
        problemFamilyId: 'accounting-equation',
        studentId: 'student-123',
        rating: 'Again' as const,
        scheduledAt: Date.now(),
        reviewedAt: Date.now(),
        elapsedDays: 0,
        scheduledDays: 0,
      };
      expect(srsReviewLogSchema.safeParse(minimalLog).success).toBe(true);
    });
  });

  describe('srsSessionSchema', () => {
    const validSession = {
      sessionId: 'session-abc',
      studentId: 'student-123',
      startedAt: Date.now(),
      completedAt: Date.now(),
      cardCount: 10,
      ratings: { again: 1, hard: 2, good: 5, easy: 2 },
    };

    it('validates correct session', () => {
      expect(srsSessionSchema.safeParse(validSession).success).toBe(true);
    });

    it('allows completedAt to be omitted', () => {
      const incomplete = { ...validSession };
      delete (incomplete as { completedAt?: number }).completedAt;
      expect(srsSessionSchema.safeParse(incomplete).success).toBe(true);
    });

    it('rejects negative ratings', () => {
      expect(
        srsSessionSchema.safeParse({
          ...validSession,
          ratings: { again: -1, hard: 0, good: 0, easy: 0 },
        }).success,
      ).toBe(false);
    });
  });

  describe('dailyQueueSchema', () => {
    const validQueue = {
      cards: [],
      sessionSize: 10,
      generatedAt: Date.now(),
    };

    it('validates empty queue', () => {
      expect(dailyQueueSchema.safeParse(validQueue).success).toBe(true);
    });

    it('rejects non-positive sessionSize', () => {
      expect(
        dailyQueueSchema.safeParse({ ...validQueue, sessionSize: 0 }).success,
      ).toBe(false);
      expect(
        dailyQueueSchema.safeParse({ ...validQueue, sessionSize: -1 }).success,
      ).toBe(false);
    });
  });

  describe('srsReviewResultSchema', () => {
    const validResult = {
      card: {
        problemFamilyId: 'accounting-equation',
        studentId: 'student-123',
        card: { state: 'new' },
        due: Date.now(),
        lastReview: Date.now(),
        reviewCount: 1,
        createdAt: Date.now(),
      },
      reviewLog: {
        problemFamilyId: 'accounting-equation',
        studentId: 'student-123',
        rating: 'Good' as const,
        scheduledAt: Date.now(),
        reviewedAt: Date.now(),
        elapsedDays: 0,
        scheduledDays: 1,
      },
      rating: 'Good' as const,
    };

    it('validates correct review result', () => {
      expect(srsReviewResultSchema.safeParse(validResult).success).toBe(true);
    });

    it('rejects mismatched rating enum', () => {
      expect(
        srsReviewResultSchema.safeParse({ ...validResult, rating: 'Fair' }).success,
      ).toBe(false);
    });
  });
});
