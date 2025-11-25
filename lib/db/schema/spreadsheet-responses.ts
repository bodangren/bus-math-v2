import { boolean, integer, jsonb, pgTable, timestamp, uuid, unique, index } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { profiles } from './profiles';
import { activities } from './activities';

/**
 * Student Spreadsheet Responses
 *
 * Stores student responses for spreadsheet-based activities.
 * Includes auto-save draft functionality and validation results.
 */

// Zod schema for spreadsheet cell data
export const spreadsheetCellSchema = z.object({
  value: z.union([z.string(), z.number()]).optional(),
  readOnly: z.boolean().optional(),
  className: z.string().optional(),
});

export const spreadsheetDataSchema = z.array(z.array(spreadsheetCellSchema.nullable()));

export type SpreadsheetData = z.infer<typeof spreadsheetDataSchema>;

// Validation result schema
export const validationResultSchema = z.object({
  isComplete: z.boolean(),
  totalCells: z.number().int().nonnegative(),
  correctCells: z.number().int().nonnegative(),
  feedback: z.array(
    z.object({
      cell: z.string(),
      isCorrect: z.boolean(),
      message: z.string().optional(),
      expectedValue: z.union([z.string(), z.number()]).optional(),
      actualValue: z.union([z.string(), z.number()]).optional(),
    })
  ),
  timestamp: z.string().datetime(),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;

export const studentSpreadsheetResponses = pgTable('student_spreadsheet_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  activityId: uuid('activity_id')
    .notNull()
    .references(() => activities.id, { onDelete: 'cascade' }),
  spreadsheetData: jsonb('spreadsheet_data').$type<SpreadsheetData>().notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  lastValidationResult: jsonb('last_validation_result').$type<ValidationResult | null>(),
  submittedAt: timestamp('submitted_at'),
  draftData: jsonb('draft_data').$type<SpreadsheetData | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one response per student per activity
  studentActivityUnique: unique('uq_student_spreadsheet_responses_student_activity').on(
    table.studentId,
    table.activityId
  ),
  // Index for querying by student
  studentIdx: index('idx_student_spreadsheet_responses_student_id').on(table.studentId),
  // Index for querying by activity
  activityIdx: index('idx_student_spreadsheet_responses_activity_id').on(table.activityId),
}));
