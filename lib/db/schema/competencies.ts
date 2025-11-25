import { boolean, integer, pgTable, text, timestamp, uuid, index, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './profiles';
import { activities } from './activities';

/**
 * Competency Standards
 *
 * Defines educational competency standards that students can achieve.
 * Standards are identified by unique codes (e.g., "ACC-1.2") and include
 * both technical descriptions and student-friendly versions for UX.
 */
export const competencyStandards = pgTable('competency_standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  description: text('description').notNull(),
  studentFriendlyDescription: text('student_friendly_description'),
  category: text('category'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
// Note: unique() on 'code' already creates an implicit index

/**
 * Student Competency
 *
 * Tracks individual student mastery of competency standards.
 * Mastery levels range from 0-100, representing percentage of mastery.
 * Links to optional evidence activities and tracks who last updated the record.
 */
export const studentCompetency = pgTable('student_competency', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  standardId: uuid('standard_id')
    .notNull()
    .references(() => competencyStandards.id, { onDelete: 'restrict' }),
  masteryLevel: integer('mastery_level').notNull().default(0),
  evidenceActivityId: uuid('evidence_activity_id')
    .references(() => activities.id, { onDelete: 'set null' }),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by')
    .references(() => profiles.id, { onDelete: 'set null' }),
}, (table) => ({
  // Note: unique constraint on (student_id, standard_id) already creates composite index
  // Only need explicit index on standard_id for reverse lookups
  standardIdx: index('idx_student_competency_standard_id').on(table.standardId),
  studentStandardUnique: unique('uq_student_competency_student_standard').on(table.studentId, table.standardId),
  masteryLevelCheck: check('chk_mastery_level_range', sql`mastery_level >= 0 AND mastery_level <= 100`),
}));
