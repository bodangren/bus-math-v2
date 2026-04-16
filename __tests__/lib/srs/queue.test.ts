import { describe, it, expect } from 'vitest';
import { buildDailyQueue, getQueueSummary } from '../../../lib/srs/queue';
import { createNewCard } from '../../../lib/srs/scheduler';

function makeCard(problemFamilyId: string, studentId: string, dueOffsetMs: number) {
  const card = createNewCard(problemFamilyId, studentId);
  card.due = Date.now() + dueOffsetMs;
  return card;
}

describe('lib/srs/queue', () => {
  describe('buildDailyQueue', () => {
    it('returns empty queue when no cards are due', () => {
      const futureCard = makeCard('transaction-effects', 'student-1', 100000);
      const queue = buildDailyQueue([futureCard]);
      expect(queue.cards).toHaveLength(0);
    });

    it('returns all due cards up to sessionSize', () => {
      const cards = [
        makeCard('accounting-equation', 'student-1', -5000),
        makeCard('adjustment-effects', 'student-2', -3000),
        makeCard('classification', 'student-3', -1000),
      ];
      const queue = buildDailyQueue(cards, { sessionSize: 10 });
      expect(queue.cards).toHaveLength(3);
    });

    it('caps at sessionSize', () => {
      const cards = Array.from({ length: 15 }, (_, i) =>
        makeCard(`family-${i}`, `student-${i}`, -(15 - i) * 1000)
      );
      const queue = buildDailyQueue(cards, { sessionSize: 5 });
      expect(queue.cards).toHaveLength(5);
    });

    it('sorts by due date ascending (most overdue first)', () => {
      const cards = [
        makeCard('accounting-equation', 'student-1', -5000),
        makeCard('adjustment-effects', 'student-2', -10000),
        makeCard('classification', 'student-3', -2000),
      ];
      const queue = buildDailyQueue(cards);
      expect(queue.cards[0].problemFamilyId).toBe('adjustment-effects');
      expect(queue.cards[1].problemFamilyId).toBe('accounting-equation');
      expect(queue.cards[2].problemFamilyId).toBe('classification');
    });

    it('includes sessionSize in result', () => {
      const queue = buildDailyQueue([], { sessionSize: 5 });
      expect(queue.sessionSize).toBe(5);
    });

    it('includes generatedAt timestamp', () => {
      const before = Date.now();
      const queue = buildDailyQueue([]);
      const after = Date.now();
      expect(queue.generatedAt).toBeGreaterThanOrEqual(before);
      expect(queue.generatedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('getQueueSummary', () => {
    it('returns zero due when all cards are in future', () => {
      const futureCard = makeCard('transaction-effects', 'student-1', 100000);
      const summary = getQueueSummary([futureCard]);
      expect(summary.totalDue).toBe(0);
      expect(summary.totalCards).toBe(1);
    });

    it('returns correct due count', () => {
      const cards = [
        makeCard('accounting-equation', 'student-1', -5000),
        makeCard('adjustment-effects', 'student-2', 100000),
      ];
      const summary = getQueueSummary(cards);
      expect(summary.totalDue).toBe(1);
      expect(summary.totalCards).toBe(2);
    });

    it('calculates average overdue time', () => {
      const now = Date.now();
      const card1 = createNewCard('accounting-equation', 'student-1');
      card1.due = now - 10000;
      const card2 = createNewCard('adjustment-effects', 'student-2');
      card2.due = now - 20000;
      const summary = getQueueSummary([card1, card2]);
      expect(summary.averageOverdue).toBe(15000);
    });

    it('returns zero averageOverdue when no cards are due', () => {
      const futureCard = makeCard('transaction-effects', 'student-1', 100000);
      const summary = getQueueSummary([futureCard]);
      expect(summary.averageOverdue).toBe(0);
    });
  });
});