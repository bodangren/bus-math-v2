import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

/**
 * Profiles represent the application-facing identity for Supabase Auth users.
 * We cannot declare a foreign key to auth.users from here, but the UUIDs align.
 */
export const profileRoleEnum = pgEnum('profile_role', ['student', 'teacher', 'admin']);

export const profileMetadataSchema = z.object({
  grade: z.number().optional(),
  schoolName: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export type ProfileMetadata = z.infer<typeof profileMetadataSchema>;

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: profileRoleEnum('role').notNull().default('student'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  metadata: jsonb('metadata').$type<ProfileMetadata | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
