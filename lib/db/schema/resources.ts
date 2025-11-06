import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { lessons } from './lessons';
import { phases } from './phases';

export const resourceMetadataSchema = z.object({
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  downloadCount: z.number().optional(),
});

export type ResourceMetadata = z.infer<typeof resourceMetadataSchema>;

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .references(() => lessons.id, { onDelete: 'cascade' }),
  phaseId: uuid('phase_id').references(() => phases.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  resourceType: text('resource_type', {
    enum: ['dataset', 'pdf', 'excel', 'link', 'video'],
  }).notNull(),
  filePath: text('file_path'),
  externalUrl: text('external_url'),
  metadata: jsonb('metadata').$type<ResourceMetadata | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

