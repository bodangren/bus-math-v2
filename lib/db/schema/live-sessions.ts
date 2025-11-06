import { jsonb, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { activities } from './activities';
import { classes } from './classes';
import { profiles } from './profiles';

export const liveSessionStatusEnum = pgEnum('live_session_status', ['waiting', 'active', 'completed']);

export const sessionSettingsSchema = z.object({
  timeLimitSeconds: z.number().positive().optional(),
  showLeaderboard: z.boolean().default(true),
  allowLateJoin: z.boolean().default(true),
  questionOrder: z.enum(['sequential', 'random']).default('sequential'),
});

export type SessionSettings = z.infer<typeof sessionSettingsSchema>;

export const liveSessions = pgTable('live_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id, { onDelete: 'cascade' }),
  classId: uuid('class_id')
    .notNull()
    .references(() => classes.id, { onDelete: 'cascade' }),
  hostId: uuid('host_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  status: liveSessionStatusEnum('status').notNull().default('waiting'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  settings: jsonb('settings').$type<SessionSettings | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

