import { createEmptyCard, FSRS, Rating, Card } from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';
import type { SrsCardState, SrsRating } from './contract';

const fsrs = new FSRS({});

export function createNewCard(problemFamilyId: string, studentId: string): SrsCardState {
  const card = createEmptyCard(new Date());
  const now = Date.now();
  return {
    problemFamilyId,
    studentId,
    card: serializeCard(card),
    due: now,
    lastReview: now,
    reviewCount: 0,
    createdAt: now,
  };
}

export function reviewCard(cardState: SrsCardState, rating: SrsRating): SrsCardState {
  const card = deserializeCard(cardState.card);
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);

  const ratingMap: Record<SrsRating, number> = {
    Again: Rating.Again,
    Hard: Rating.Hard,
    Good: Rating.Good,
    Easy: Rating.Easy,
  };

  const selectedRating = ratingMap[rating];
  const result = schedulingCards[selectedRating as Grade];

  const nowMs = Date.now();
  return {
    ...cardState,
    card: serializeCard(result.card),
    due: result.card.due.getTime(),
    lastReview: nowMs,
    reviewCount: cardState.reviewCount + 1,
  };
}

export function getCardsDue(cards: SrsCardState[], now?: number): SrsCardState[] {
  const cutoff = now ?? Date.now();
  return cards
    .filter((c) => c.due <= cutoff)
    .sort((a, b) => a.due - b.due);
}

export function serializeCard(card: Card): Record<string, unknown> {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    learning_steps: card.learning_steps,
    state: card.state,
    last_review: card.last_review?.toISOString() ?? null,
  };
}

export function deserializeCard(data: Record<string, unknown>): Card {
  return {
    due: new Date(data.due as string),
    stability: data.stability as number,
    difficulty: data.difficulty as number,
    elapsed_days: data.elapsed_days as number,
    scheduled_days: data.scheduled_days as number,
    reps: data.reps as number,
    lapses: data.lapses as number,
    learning_steps: data.learning_steps as number,
    state: data.state as number,
    last_review: data.last_review ? new Date(data.last_review as string) : undefined,
  };
}