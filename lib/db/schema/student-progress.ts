import { integer, pgEnum, pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

import { phases } from './phases';
import { profiles } from './profiles';

export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed']);

export const studentProgress = pgTable(
  'student_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    phaseId: uuid('phase_id')
      .notNull()
      .references(() => phases.id, { onDelete: 'cascade' }),
    status: progressStatusEnum('status').notNull().default('not_started'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    timeSpentSeconds: integer('time_spent_seconds').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserPhase: uniqueIndex('student_progress_user_phase_idx').on(table.userId, table.phaseId),
  }),
);

