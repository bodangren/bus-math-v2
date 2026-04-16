import type { SrsCardState, DailyQueue } from './contract';

export interface QueueOptions {
  sessionSize?: number;
  now?: number;
}

export function buildDailyQueue(cards: SrsCardState[], options: QueueOptions = {}): DailyQueue {
  const { sessionSize = 10, now = Date.now() } = options;

  const dueCards = cards
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, sessionSize);

  return {
    cards: dueCards,
    sessionSize,
    generatedAt: Date.now(),
  };
}

export function getQueueSummary(cards: SrsCardState[], now?: number): {
  totalDue: number;
  totalCards: number;
  averageOverdue: number;
} {
  const cutoff = now ?? Date.now();
  const dueCards = cards.filter((c) => c.due <= cutoff);

  if (dueCards.length === 0) {
    return { totalDue: 0, totalCards: cards.length, averageOverdue: 0 };
  }

  const overdueMs = dueCards.map((c) => cutoff - c.due);
  const averageOverdue = overdueMs.reduce((a, b) => a + b, 0) / overdueMs.length;

  return {
    totalDue: dueCards.length,
    totalCards: cards.length,
    averageOverdue,
  };
}