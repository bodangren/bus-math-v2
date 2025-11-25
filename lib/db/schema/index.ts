/**
 * Drizzle Schema Index
 *
 * Central export for all database schema definitions.
 * Add new schema files here as they are created.
 *
 * drizzle-zod Integration:
 * - Use createInsertSchema() to generate Zod schemas for inserts
 * - Use createSelectSchema() to generate Zod schemas for selects
 * - Extend schemas for custom validation (JSONB fields, etc.)
 *
 * Example:
 * import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
 * import { lessons } from './lessons';
 *
 * export const insertLessonSchema = createInsertSchema(lessons);
 * export const selectLessonSchema = createSelectSchema(lessons);
 */

export * from './organizations';
export * from './lessons';
export * from './lesson-versions';
export * from './phases';
export * from './activities';
export * from './resources';
export * from './profiles';
export { accessibilityPreferencesSchema } from './profiles';
export * from './student-progress';
export * from './activity-submissions';
export * from './classes';
export * from './class-enrollments';
export * from './live-sessions';
export * from './live-responses';
export * from './session-leaderboard';
export * from './content-revisions';
export * from './competencies';
export * from './validators';
export * from './relations';
