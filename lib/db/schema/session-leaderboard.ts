import { integer, pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

import { liveSessions } from './live-sessions';
import { profiles } from './profiles';

export const sessionLeaderboard = pgTable(
  'session_leaderboard',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => liveSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    score: integer('score').notNull().default(0),
    totalQuestions: integer('total_questions').notNull().default(0),
    avgResponseTimeMs: integer('avg_response_time_ms'),
    rank: integer('rank'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueSessionUser: uniqueIndex('session_leaderboard_unique').on(table.sessionId, table.userId),
  }),
);

