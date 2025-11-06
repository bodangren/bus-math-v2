import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { activities } from './activities';
import { profiles } from './profiles';

export const submissionDataSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  interactionHistory: z.array(z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type SubmissionData = z.infer<typeof submissionDataSchema>;

export const activitySubmissions = pgTable('activity_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id, { onDelete: 'cascade' }),
  submissionData: jsonb('submission_data').$type<SubmissionData>().notNull(),
  score: integer('score'),
  maxScore: integer('max_score'),
  feedback: text('feedback'),
  submittedAt: timestamp('submitted_at').notNull(),
  gradedAt: timestamp('graded_at'),
  gradedBy: uuid('graded_by').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
