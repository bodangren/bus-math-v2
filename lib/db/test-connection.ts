/**
 * Database Connection Test
 *
 * Simple test to verify Drizzle ORM connection to Supabase.
 * This file can be deleted after successful connection verification.
 */

'use server';

import { db } from './drizzle';
import { sql } from 'drizzle-orm';

export async function testDatabaseConnection() {
  try {
    // Execute a simple query to verify connection
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as postgres_version`);

    // postgres-js returns an array directly, but other drivers might wrap in { rows: [] }
    const rows = Array.isArray(result)
      ? (result as Array<Record<string, unknown>>)
      : ((result as { rows?: Array<Record<string, unknown>> }).rows ?? []);

    const rowCandidate = rows[0];

    if (
      !rowCandidate ||
      typeof rowCandidate !== 'object' ||
      rowCandidate === null ||
      !('current_time' in rowCandidate) ||
      !('postgres_version' in rowCandidate)
    ) {
      return {
        success: false,
        message: 'Query returned no results',
        error: 'No data returned from database',
      };
    }

    const row = rowCandidate as { current_time: Date; postgres_version: string };

    return {
      success: true,
      message: 'Database connection successful!',
      data: {
        currentTime: row.current_time,
        postgresVersion: row.postgres_version,
        connectionType: 'Drizzle ORM with Supabase Session Pooler',
      },
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
