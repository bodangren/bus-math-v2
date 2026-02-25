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
 * - DATABASE_URL: Transaction pooler for application queries (recommended for Next.js)
 * - DIRECT_URL: Direct connection for local Drizzle tooling where needed
 *
 * Schema ownership:
 * - Supabase SQL migrations are the only migration source of truth.
 * - Drizzle schema modules are query/type mappings and must not be treated as migration authority.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  // Temporary workaround during Convex migration to stop Vinext dev server from crashing
  console.warn("DATABASE_URL is not defined. Using dummy URL during migration.");
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
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
