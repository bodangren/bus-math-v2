import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, unique, index } from 'drizzle-orm/pg-core';
import { lessons } from './lessons';
import { competencyStandards } from './competencies';

/**
 * Lesson Versions
 *
 * Implements versioned content model for safe authoring.
 * Each lesson can have multiple versions (draft, review, published, archived).
 */
export const lessonVersions = pgTable('lesson_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  title: text('title'),
  description: text('description'),
  status: text('status').$type<'draft' | 'review' | 'published' | 'archived'>().notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  lessonVersionUnique: unique('uq_lesson_version').on(table.lessonId, table.version),
  lessonIdIdx: index('idx_lesson_versions_lesson_id').on(table.lessonId),
  statusIdx: index('idx_lesson_versions_status').on(table.status),
}));

/**
 * Phase Versions
 *
 * Links phases to specific lesson versions.
 * Each lesson version has up to 6 phases.
 */
export const phaseVersions = pgTable('phase_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonVersionId: uuid('lesson_version_id')
    .notNull()
    .references(() => lessonVersions.id, { onDelete: 'cascade' }),
  phaseNumber: integer('phase_number').notNull(),
  title: text('title'),
  estimatedMinutes: integer('estimated_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  lessonPhaseUnique: unique('uq_lesson_version_phase').on(table.lessonVersionId, table.phaseNumber),
}));

/**
 * Phase Sections
 *
 * Structured content storage replacing monolithic JSONB blobs.
 * Each section represents a content block within a phase.
 */
export const phaseSections = pgTable('phase_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  phaseVersionId: uuid('phase_version_id')
    .notNull()
    .references(() => phaseVersions.id, { onDelete: 'cascade' }),
  sequenceOrder: integer('sequence_order').notNull(),
  sectionType: text('section_type').$type<'text' | 'callout' | 'activity' | 'video' | 'image'>().notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  phaseSequenceUnique: unique('uq_phase_section_sequence').on(table.phaseVersionId, table.sequenceOrder),
}));

/**
 * Lesson Standards
 *
 * Junction table linking lesson versions to competency standards.
 * Replaces JSONB array for referential integrity.
 */
export const lessonStandards = pgTable('lesson_standards', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonVersionId: uuid('lesson_version_id')
    .notNull()
    .references(() => lessonVersions.id, { onDelete: 'cascade' }),
  standardId: uuid('standard_id')
    .notNull()
    .references(() => competencyStandards.id, { onDelete: 'restrict' }),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  lessonStandardUnique: unique('uq_lesson_standard').on(table.lessonVersionId, table.standardId),
  standardIdIdx: index('idx_lesson_standards_standard_id').on(table.standardId),
}));
