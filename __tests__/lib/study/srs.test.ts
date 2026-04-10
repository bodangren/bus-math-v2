import { describe, it, expect } from 'vitest';
import {
  scheduleNewTerm,
  processReview,
  getDueTerms,
  proficiencyBand,
  updateMastery,
} from '@/lib/study/srs';

describe('srs', () => {
  describe('scheduleNewTerm', () => {
    it('should return a scheduled term with FSRS state', () => {
      const result = scheduleNewTerm('test-term');
      expect(result).toHaveProperty('termSlug');
      expect(result).toHaveProperty('fsrsState');
      expect(result).toHaveProperty('scheduledFor');
      expect(result.termSlug).toEqual('test-term');
    });
  });

  describe('processReview', () => {
    it('should return updated mastery and FSRS state after a review', () => {
      const initial = scheduleNewTerm('test-term');
      const result = processReview(initial, 'good');
      expect(result).toHaveProperty('masteryDelta');
      expect(result).toHaveProperty('fsrsState');
      expect(result).toHaveProperty('scheduledFor');
    });
  });

  describe('getDueTerms', () => {
    it('should filter terms that are due now', () => {
      const now = Date.now();
      const dueTerm = { ...scheduleNewTerm('due-term'), scheduledFor: now - 1000 };
      const futureTerm = { ...scheduleNewTerm('future-term'), scheduledFor: now + 1000 };
      const result = getDueTerms([dueTerm, futureTerm], now);
      expect(result.length).toEqual(1);
      expect(result[0].termSlug).toEqual('due-term');
    });
  });

  describe('proficiencyBand', () => {
    it('should return correct band for given mastery score', () => {
      expect(proficiencyBand(0.1)).toEqual('learning');
      expect(proficiencyBand(0.5)).toEqual('familiar');
      expect(proficiencyBand(0.9)).toEqual('mastered');
    });
  });

  describe('updateMastery', () => {
    it('should update mastery score with given delta, clamped to [0,1]', () => {
      expect(updateMastery(0.5, 0.1)).toEqual(0.6);
      expect(updateMastery(0.9, 0.2)).toEqual(1.0);
      expect(updateMastery(0.1, -0.2)).toEqual(0.0);
    });
  });
});
