/**
 * Drizzle ORM Client
 *
 * Server-side database client using Drizzle ORM with Supabase PostgreSQL.
 * Uses transaction pooler (port 6543) for optimal performance with serverless functions.
 *
 * IMPORTANT: This module should ONLY be imported in Server Components, Server Actions,
 * or API Routes. Never import this in client-side code.
 *
 * Connection Strategy:
 * - DATABASE_URL: Transaction pooler for all queries (recommended for Next.js)
 * - DIRECT_URL: Direct connection for migrations only (used by drizzle-kit)
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined. Please add it to your .env.local file.\n' +
    'Format: postgresql://postgres.PROJECT_REF:[password]@aws-0-[region].pooler.supabase.com:6543/postgres'
  );
}

/**
 * PostgreSQL client connection
 * Uses Supabase transaction pooler for serverless-friendly connections
 */
const client = postgres(process.env.DATABASE_URL, {
  prepare: false, // Required for Supabase transaction pooler
  max: 10, // Maximum connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
});

/**
 * Drizzle ORM instance
 * Provides type-safe database queries with full TypeScript inference
 */
export const db = drizzle(client, { schema });

/**
 * Close database connections
 * Call this when shutting down the application or in cleanup hooks
 */
export async function closeDatabase() {
  await client.end();
}
