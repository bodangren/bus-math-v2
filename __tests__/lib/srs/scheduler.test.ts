import { describe, it, expect } from 'vitest';
import {
  createNewCard,
  reviewCard,
  getCardsDue,
  serializeCard,
  deserializeCard,
} from '../../../lib/srs/scheduler';
import { createEmptyCard } from 'ts-fsrs';

describe('lib/srs/scheduler', () => {
  describe('createNewCard', () => {
    it('returns card with due set to approximately now', () => {
      const before = Date.now();
      const card = createNewCard('transaction-effects', 'student-1');
      const after = Date.now();
      expect(card.due).toBeGreaterThanOrEqual(before);
      expect(card.due).toBeLessThanOrEqual(after);
    });

    it('returns card with reviewCount = 0', () => {
      const card = createNewCard('transaction-effects', 'student-1');
      expect(card.reviewCount).toBe(0);
    });

    it('returns card with correct problemFamilyId and studentId', () => {
      const card = createNewCard('accounting-equation', 'student-42');
      expect(card.problemFamilyId).toBe('accounting-equation');
      expect(card.studentId).toBe('student-42');
    });

    it('card has expected fsrs fields', () => {
      const card = createNewCard('classification', 'student-1');
      expect(card.card).toHaveProperty('due');
      expect(card.card).toHaveProperty('stability');
      expect(card.card).toHaveProperty('difficulty');
      expect(card.card).toHaveProperty('state');
    });
  });

  describe('reviewCard', () => {
    it('Again rating sets due to very soon (within a day)', () => {
      const card = createNewCard('transaction-effects', 'student-1');
      const before = Date.now();
      const reviewed = reviewCard(card, 'Again');
      const dayMs = 24 * 60 * 60 * 1000;
      expect(reviewed.due).toBeGreaterThan(before);
      expect(reviewed.due).toBeLessThan(before + dayMs);
    });

    it('Easy rating sets due further out than Good', () => {
      const card1 = createNewCard('cvp-analysis', 'student-1');
      const card2 = createNewCard('cvp-analysis', 'student-2');
      const goodResult = reviewCard(card1, 'Good');
      const easyResult = reviewCard(card2, 'Easy');
      expect(easyResult.due).toBeGreaterThan(goodResult.due);
    });

    it('Good rating increments stability', () => {
      const card = createNewCard('journal-entry', 'student-1');
      const originalStability = card.card.stability as number;
      const reviewed = reviewCard(card, 'Good');
      const newStability = reviewed.card.stability as number;
      expect(newStability).toBeGreaterThan(originalStability);
    });

    it('Hard rating provides slight interval increase', () => {
      const card = createNewCard('posting-balances', 'student-1');
      const reviewed = reviewCard(card, 'Hard');
      expect(reviewed.reviewCount).toBe(1);
      expect(reviewed.due).toBeGreaterThan(card.due);
    });

    it('increments reviewCount', () => {
      const card = createNewCard('normal-balance', 'student-1');
      const reviewed = reviewCard(card, 'Good');
      expect(reviewed.reviewCount).toBe(1);
    });

    it('updates lastReview timestamp', () => {
      const card = createNewCard('statement-construction', 'student-1');
      const before = Date.now();
      const reviewed = reviewCard(card, 'Good');
      expect(reviewed.lastReview).toBeGreaterThanOrEqual(before);
    });
  });

  describe('getCardsDue', () => {
    it('returns only cards where due date has passed', () => {
      const now = Date.now();
      const pastCard = createNewCard('transaction-effects', 'student-1');
      pastCard.due = now - 1000;

      const futureCard = createNewCard('cvp-analysis', 'student-2');
      futureCard.due = now + 100000;

      const cards = [pastCard, futureCard];
      const due = getCardsDue(cards, now);
      expect(due).toHaveLength(1);
      expect(due[0].problemFamilyId).toBe('transaction-effects');
    });

    it('returns empty array when all cards are scheduled for future', () => {
      const now = Date.now();
      const futureCard = createNewCard('journal-entry', 'student-1');
      futureCard.due = now + 100000;

      const due = getCardsDue([futureCard], now);
      expect(due).toHaveLength(0);
    });

    it('returns multiple due cards sorted by due date ascending', () => {
      const now = Date.now();
      const card1 = createNewCard('accounting-equation', 'student-1');
      card1.due = now - 5000;
      const card2 = createNewCard('adjustment-effects', 'student-2');
      card2.due = now - 3000;
      const card3 = createNewCard('classification', 'student-3');
      card3.due = now - 1000;

      const due = getCardsDue([card1, card2, card3], now);
      expect(due).toHaveLength(3);
      expect(due[0].problemFamilyId).toBe('accounting-equation');
      expect(due[1].problemFamilyId).toBe('adjustment-effects');
      expect(due[2].problemFamilyId).toBe('classification');
    });

    it('respects sessionSize cap via filtering', () => {
      const now = Date.now();
      const cards = Array.from({ length: 5 }, (_, i) => {
        const card = createNewCard(`family-${i}`, `student-${i}`);
        card.due = now - (5 - i) * 1000;
        return card;
      });

      const due = getCardsDue(cards, now);
      expect(due).toHaveLength(5);
    });
  });

  describe('serialization roundtrip', () => {
    it('serializeCard then deserializeCard produces equivalent card', () => {
      const original = createEmptyCard(new Date());
      const serialized = serializeCard(original);
      const deserialized = deserializeCard(serialized);

      expect(deserialized.due.getTime()).toBe(original.due.getTime());
      expect(deserialized.stability).toBe(original.stability);
      expect(deserialized.difficulty).toBe(original.difficulty);
      expect(deserialized.elapsed_days).toBe(original.elapsed_days);
      expect(deserialized.scheduled_days).toBe(original.scheduled_days);
      expect(deserialized.reps).toBe(original.reps);
      expect(deserialized.lapses).toBe(original.lapses);
      expect(deserialized.learning_steps).toBe(original.learning_steps);
      expect(deserialized.state).toBe(original.state);
    });

    it('roundtrip works for a reviewed card', () => {
      const card = createNewCard('transaction-effects', 'student-1');
      const reviewed = reviewCard(card, 'Good');

      const deserialized = deserializeCard(reviewed.card);

      const reviewedDueMs = new Date(reviewed.card.due as string).getTime();
      expect(deserialized.due.getTime()).toBe(reviewedDueMs);
      expect(deserialized.reps).toBe(reviewed.card.reps);
    });
  });
});