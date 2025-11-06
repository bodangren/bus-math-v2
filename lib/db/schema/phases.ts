import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { lessons } from './lessons';

export const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('markdown'),
    content: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('video'),
    props: z.object({
      videoUrl: z.string().url(),
      duration: z.number().positive(),
      transcript: z.string().optional(),
      thumbnailUrl: z.string().url().optional(),
    }),
  }),
  z.object({
    id: z.string(),
    type: z.literal('activity'),
    activityId: z.string().uuid(),
    required: z.boolean().default(false),
  }),
  z.object({
    id: z.string(),
    type: z.literal('callout'),
    variant: z.enum(['why-this-matters', 'tip', 'warning', 'example']),
    content: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('image'),
    props: z.object({
      imageUrl: z.string().url(),
      alt: z.string(),
      caption: z.string().optional(),
    }),
  }),
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export const phaseMetadataSchema = z.object({
  color: z.string().optional(),
  icon: z.string().optional(),
  phaseType: z.enum(['intro', 'example', 'practice', 'challenge', 'reflection', 'assessment']).optional(),
});

export type PhaseMetadata = z.infer<typeof phaseMetadataSchema>;

export const phases = pgTable('phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  phaseNumber: integer('phase_number').notNull(),
  title: text('title').notNull(),
  contentBlocks: jsonb('content_blocks').$type<ContentBlock[]>().notNull(),
  estimatedMinutes: integer('estimated_minutes'),
  metadata: jsonb('metadata').$type<PhaseMetadata>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

