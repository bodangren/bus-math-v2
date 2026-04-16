import { createEmptyCard, Card, Rating, FSRS } from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';

export interface ScheduledTerm {
  termSlug: string;
  fsrsState: Card;
  scheduledFor: number;
}

export interface ReviewResult {
  masteryDelta: number;
  fsrsState: Card;
  scheduledFor: number;
}

const fsrs = new FSRS({});

export function scheduleNewTerm(termSlug: string): ScheduledTerm {
  const card = createEmptyCard();
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);
  const firstReview = schedulingCards[Rating.Again];
  return {
    termSlug,
    fsrsState: firstReview.card,
    scheduledFor: firstReview.card.due.getTime(),
  };
}

export function processReview(
  scheduledTerm: ScheduledTerm,
  rating: 'again' | 'hard' | 'good' | 'easy'
): ReviewResult {
  const card = scheduledTerm.fsrsState as Card;
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);
  const ratingMap: Record<string, Rating> = {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  };
  const review = schedulingCards[ratingMap[rating] as Grade];
  
  const ratingDeltas = {
    again: -0.2,
    hard: -0.05,
    good: 0.1,
    easy: 0.2,
  };
  const masteryDelta = ratingDeltas[rating];

  return {
    masteryDelta,
    fsrsState: review.card,
    scheduledFor: review.card.due.getTime(),
  };
}

export function getDueTerms(
  scheduledTerms: ScheduledTerm[],
  now: number = Date.now()
): ScheduledTerm[] {
  return scheduledTerms.filter(term => term.scheduledFor <= now);
}

export function proficiencyBand(masteryScore: number): 'new' | 'learning' | 'familiar' | 'mastered' {
  if (masteryScore === 0) return 'new';
  if (masteryScore < 0.3) return 'learning';
  if (masteryScore < 0.7) return 'familiar';
  return 'mastered';
}

export function updateMastery(currentScore: number, delta: number): number {
  const newScore = currentScore + delta;
  return Math.max(0, Math.min(1, newScore));
}
