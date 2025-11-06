import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { liveSessions } from './live-sessions';
import { profiles } from './profiles';

export const liveResponseAnswerSchema = z.record(z.string(), z.unknown());

export type LiveResponseAnswer = z.infer<typeof liveResponseAnswerSchema>;

export const liveResponses = pgTable('live_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => liveSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull(),
  answer: jsonb('answer').$type<LiveResponseAnswer>().notNull(),
  isCorrect: boolean('is_correct').notNull(),
  responseTimeMs: integer('response_time_ms').notNull(),
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
