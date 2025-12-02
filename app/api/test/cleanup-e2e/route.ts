/**
 * E2E Test Cleanup API
 *
 * Removes test data created by the seed API.
 * SECURITY: Only available in development/test environments.
 *
 * Deletes:
 * - Test user (cascades to all user data via RLS)
 * - Test lesson and phases (if needed)
 * - Test competency standard (if needed)
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { db } from '@/lib/db';
import { lessons } from '@/lib/db/schema/lessons';
import { competencyStandards } from '@/lib/db/schema/competencies';
import { organizations } from '@/lib/db/schema/organizations';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Fixed UUIDs matching the seed API
const TEST_LESSON_ID = '00000000-0000-0000-0000-000000000002';
const TEST_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000000';
const TEST_STANDARD_ID = '00000000-0000-0000-0000-000000000006';

interface CleanupRequest {
  userId?: string;
  lessonId?: string;
}

export async function POST(request: Request) {
  // Security check: Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Test cleanup API cannot be used in production' },
      { status: 403 }
    );
  }

  try {
    const body: CleanupRequest = await request.json();
    const { userId, lessonId } = body;

    const adminClient = createAdminClient();
    const errors: string[] = [];

    // 1. Delete test user if provided (cascades to progress, competency, etc.)
    if (userId) {
      try {
        const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteUserError) {
          errors.push(`Failed to delete user ${userId}: ${deleteUserError.message}`);
        }
      } catch (error) {
        errors.push(
          `Exception deleting user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 2. Delete test lesson if provided (cascades to phases)
    const lessonToDelete = lessonId || TEST_LESSON_ID;
    try {
      await db.delete(lessons).where(eq(lessons.id, lessonToDelete));
    } catch (error) {
      errors.push(
        `Failed to delete lesson ${lessonToDelete}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // 3. Delete test standard (only if it's not referenced by other data)
    try {
      await db.delete(competencyStandards).where(eq(competencyStandards.id, TEST_STANDARD_ID));
    } catch (error) {
      // It's okay if this fails due to foreign key constraints
      console.warn('Could not delete test standard (may be in use):', error);
    }

    // 4. Delete test organization (cascades to profile)
    try {
      await db.delete(organizations).where(eq(organizations.id, TEST_ORGANIZATION_ID));
    } catch (error) {
      errors.push(
        `Failed to delete organization ${TEST_ORGANIZATION_ID}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }

    return NextResponse.json({
      success: errors.length === 0,
      message:
        errors.length === 0
          ? 'Test data cleaned up successfully'
          : 'Cleanup completed with some errors',
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('E2E cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup E2E test data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
