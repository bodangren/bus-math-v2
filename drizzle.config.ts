/**
 * Drizzle Kit Configuration
 *
 * Configuration for drizzle-kit CLI tool to manage database migrations.
 *
 * Available commands:
 * - `npx drizzle-kit generate` - Generate migration files from schema changes
 * - `npx drizzle-kit push` - Push schema changes directly to database (dev only)
 * - `npx drizzle-kit studio` - Launch Drizzle Studio for database browsing
 * - `npx drizzle-kit migrate` - Apply pending migrations to database
 * - `npx drizzle-kit drop` - Drop migration files
 *
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */

import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DIRECT_URL) {
  throw new Error(
    'DIRECT_URL is not defined in .env.local.\n' +
    'Please add it to use drizzle-kit commands.\n' +
    'Format: postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres'
  );
}

export default defineConfig({
  // Database dialect
  dialect: 'postgresql',

  // Schema files location
  schema: './lib/db/schema/index.ts',

  // Output directory for migrations
  out: './drizzle/migrations',

  // Database connection - uses DIRECT_URL for migrations (not pooler)
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },

  // Additional options
  verbose: true, // Show detailed logs during migration operations
  strict: true, // Enable strict mode for safer migrations
});
