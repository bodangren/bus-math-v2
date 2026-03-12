import { z } from 'zod';
import { COMPETENCY_STANDARD_CODE_PATTERN } from '@/lib/curriculum/standards';

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
    activityId: z.string().min(1),
    required: z.boolean().default(false),
    /** Standard code to credit in student_competency when this activity is completed */
    linkedStandardId: z.string().regex(COMPETENCY_STANDARD_CODE_PATTERN).optional(),
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
