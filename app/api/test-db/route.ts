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
import { enforceTestRouteGuard } from '@/lib/api/test-route-guard';

export async function GET(request: Request) {
  const guardResponse = enforceTestRouteGuard(request);
  if (guardResponse) {
    return guardResponse;
  }

  const result = await testDatabaseConnection();

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
