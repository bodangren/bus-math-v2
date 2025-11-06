import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { profiles } from './profiles';

export const contentEntityEnum = pgEnum('content_entity', ['lesson', 'phase', 'activity']);
export const validationStatusEnum = pgEnum('validation_status', ['pending', 'approved', 'rejected']);

export const validationErrorSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;

export const contentRevisions = pgTable('content_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: contentEntityEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  proposedChanges: jsonb('proposed_changes').$type<Record<string, unknown>>().notNull(),
  validationStatus: validationStatusEnum('validation_status').notNull().default('pending'),
  validationErrors: jsonb('validation_errors').$type<ValidationError[] | null>(),
  proposedBy: uuid('proposed_by')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  reviewedBy: uuid('reviewed_by').references(() => profiles.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

