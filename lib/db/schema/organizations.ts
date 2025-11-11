import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

/**
 * Organizations represent schools, districts, or other educational institutions.
 * Each organization can have multiple teachers and students.
 */

export const organizationSettingsSchema = z.object({
  timezone: z.string().optional(),
  locale: z.string().optional(),
  branding: z.object({
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().optional(),
  }).optional(),
  features: z.object({
    enableLivePolling: z.boolean().default(true),
    enableLeaderboards: z.boolean().default(true),
    enableAnalytics: z.boolean().default(true),
  }).optional(),
});

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  settings: jsonb('settings').$type<OrganizationSettings | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
