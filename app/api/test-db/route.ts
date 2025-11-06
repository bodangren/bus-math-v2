/**
 * Database Connection Test API Route
 *
 * Simple API endpoint to verify Drizzle ORM connection.
 * Access at: http://localhost:3000/api/test-db
 *
 * Can be deleted after Issue #3 verification.
 */

import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db/test-connection';

export async function GET() {
  const result = await testDatabaseConnection();

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
