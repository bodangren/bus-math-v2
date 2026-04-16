import { v } from 'convex/values';

export const srsCardValidator = v.object({
  due: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  elapsed_days: v.number(),
  scheduled_days: v.number(),
  reps: v.number(),
  lapses: v.number(),
  learning_steps: v.number(),
  state: v.number(),
  last_review: v.union(v.string(), v.null()),
});

export const srsRatingValidator = v.union(
  v.literal('Again'),
  v.literal('Hard'),
  v.literal('Good'),
  v.literal('Easy')
);
