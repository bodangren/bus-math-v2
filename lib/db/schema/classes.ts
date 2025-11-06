import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { profiles } from './profiles';

export const classMetadataSchema = z.object({
  period: z.string().optional(),
  room: z.string().optional(),
  schedule: z.string().optional(),
  notes: z.string().optional(),
});

export type ClassMetadata = z.infer<typeof classMetadataSchema>;

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  teacherId: uuid('teacher_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  academicYear: text('academic_year'),
  archived: boolean('archived').default(false),
  metadata: jsonb('metadata').$type<ClassMetadata | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

