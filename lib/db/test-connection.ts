/**
 * Database Connection Test
 *
 * Simple test to verify Drizzle ORM connection to Supabase.
 * This file can be deleted after successful connection verification.
 */

'use server';

import { db } from './drizzle';
import { sql } from 'drizzle-orm';
import { lessons } from './schema';
import { count } from 'drizzle-orm';

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

    // Check lessons table existence and count
    let lessonsCount = 0;
    try {
      const countResult = await db.select({ count: count() }).from(lessons);
      lessonsCount = countResult[0]?.count ?? 0;
    } catch (tableError) {
      return {
        success: false,
        message: 'Database connected but lessons table check failed',
        error: tableError instanceof Error ? tableError.message : 'Unknown table error',
        data: {
            currentTime: row.current_time,
            postgresVersion: row.postgres_version,
            connectionType: 'Drizzle ORM with Supabase Session Pooler',
        }
      };
    }

    return {
      success: true,
      message: 'Database connection successful!',
      data: {
        currentTime: row.current_time,
        postgresVersion: row.postgres_version,
        connectionType: 'Drizzle ORM with Supabase Session Pooler',
        lessonsCount,
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
