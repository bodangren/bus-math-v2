import { jsonb, pgTable, timestamp, uuid, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { activities } from './activities';
import { lessons } from './lessons';

/**
 * Activity Completions
 *
 * Tracks individual activity completions with atomic transaction support.
 * Ensures idempotency through unique idempotency_key constraint.
 * Each student can complete an activity exactly once (enforced by unique constraint).
 */
export const activityCompletions = pgTable(
  'activity_completions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    activityId: uuid('activity_id')
      .notNull()
      .references(() => activities.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    phaseNumber: integer('phase_number').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
    idempotencyKey: uuid('idempotency_key').notNull(),
    completionData: jsonb('completion_data').$type<Record<string, unknown> | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: one completion per student per activity
    uniqueStudentActivity: uniqueIndex('activity_completions_student_activity_idx').on(
      table.studentId,
      table.activityId,
    ),
    // Unique idempotency key for request deduplication
    uniqueIdempotencyKey: uniqueIndex('activity_completions_idempotency_key_idx').on(
      table.idempotencyKey,
    ),
    // Index for querying by student
    studentIdIdx: index('idx_activity_completions_student_id').on(table.studentId),
    // Index for querying by lesson
    lessonIdIdx: index('idx_activity_completions_lesson_id').on(table.lessonId),
  }),
);
