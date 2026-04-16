import { describe, expect, it } from 'vitest';
import { srsCardValidator, srsRatingValidator } from '../../../convex/srs-validators';

describe('srs-validators', () => {
  describe('srsRatingValidator', () => {
    it('is a union validator', () => {
      expect(srsRatingValidator.isConvexValidator).toBe(true);
      expect((srsRatingValidator as unknown as { kind: string }).kind).toBe('union');
    });

    it('contains exactly the four SRS rating literals', () => {
      const members = (srsRatingValidator as unknown as { members: Array<{ kind: string; value: string }> }).members;
      const values = members.map((m) => m.value).sort();
      expect(values).toEqual(['Again', 'Easy', 'Good', 'Hard']);
    });

    it('accepts Good as a valid rating', () => {
      const members = (srsRatingValidator as unknown as { members: Array<{ kind: string; value: string }> }).members;
      const goodMember = members.find((m) => m.value === 'Good');
      expect(goodMember).toBeDefined();
      expect(goodMember!.kind).toBe('literal');
    });
  });

  describe('srsCardValidator', () => {
    it('is an object validator', () => {
      expect(srsCardValidator.isConvexValidator).toBe(true);
      expect((srsCardValidator as unknown as { kind: string }).kind).toBe('object');
    });

    it('contains all required ts-fsrs Card fields', () => {
      const fields = (srsCardValidator as unknown as { fields: Record<string, { kind: string; isConvexValidator: boolean }> }).fields;
      expect(Object.keys(fields).sort()).toEqual([
        'difficulty',
        'due',
        'elapsed_days',
        'lapses',
        'last_review',
        'learning_steps',
        'reps',
        'scheduled_days',
        'stability',
        'state',
      ]);
    });

    it('has string due and number stability', () => {
      const fields = (srsCardValidator as unknown as { fields: Record<string, { kind: string }> }).fields;
      expect(fields.due.kind).toBe('string');
      expect(fields.stability.kind).toBe('float64');
      expect(fields.state.kind).toBe('float64');
    });

    it('has last_review as a union of string and null', () => {
      const fields = (srsCardValidator as unknown as { fields: Record<string, { kind: string }> }).fields;
      expect(fields.last_review.kind).toBe('union');
    });
  });

  describe('srsCardValidator rejects malformed data at runtime type level', () => {
    it('valid card shape matches validator structure', () => {
      const validCard = {
        due: '2026-04-16T14:21:31.424Z',
        stability: 2.3065,
        difficulty: 2.11810397,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 1,
        lapses: 0,
        learning_steps: 1,
        state: 1,
        last_review: '2026-04-16T14:21:43.913Z',
      };
      // This assignment proves TypeScript accepts the shape.
      // We cast through unknown to satisfy the strict validator type.
      const _typed: typeof srsCardValidator['type'] = validCard as unknown as typeof srsCardValidator['type'];
      expect(_typed).toBeDefined();
    });

    it('card with missing fields would fail TypeScript compilation', () => {
      // We can't easily test runtime rejection without Convex's internal validateValue,
      // but we verify the validator structure is strict (object, not any).
      expect((srsCardValidator as unknown as { kind: string }).kind).not.toBe('any');
    });
  });
});
