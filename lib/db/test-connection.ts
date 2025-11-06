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

    // postgres-js returns an array directly, not { rows: [] }
    const row = (Array.isArray(result) ? result[0] : result.rows?.[0]) as { current_time: Date; postgres_version: string };

    if (!row) {
      return {
        success: false,
        message: 'Query returned no results',
        error: 'No data returned from database',
      };
    }

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
