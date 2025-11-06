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

// Export all schema tables here as they are created
// Example:
// export * from './lessons';
// export * from './phases';
// export * from './activities';
