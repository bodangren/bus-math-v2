import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const lessonMetadataSchema = z.object({
  duration: z.number().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
});

export type LessonMetadata = z.infer<typeof lessonMetadataSchema>;

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitNumber: integer('unit_number').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  learningObjectives: jsonb('learning_objectives').$type<string[] | null>(),
  orderIndex: integer('order_index').notNull(),
  metadata: jsonb('metadata').$type<LessonMetadata | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

