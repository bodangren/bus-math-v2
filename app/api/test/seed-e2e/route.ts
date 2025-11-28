/**
 * E2E Test Seed API
 *
 * Creates test data for automated end-to-end tests.
 * SECURITY: Only available in development/test environments.
 *
 * Creates:
 * - Test student user with known credentials
 * - Test lesson with 3 sequential phases
 * - Test competency standard
 * - Test spreadsheet activity linked to the standard
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { db } from '@/lib/db';
import { lessons } from '@/lib/db/schema/lessons';
import { phases } from '@/lib/db/schema/phases';
import { competencyStandards } from '@/lib/db/schema/competencies';
import { profiles } from '@/lib/db/schema/profiles';

// Security check: Only allow in non-production environments
if (process.env.NODE_ENV === 'production') {
  throw new Error('Test seed API cannot be used in production');
}

// Fixed UUIDs for deterministic testing
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_LESSON_ID = '00000000-0000-0000-0000-000000000002';
const TEST_PHASE_1_ID = '00000000-0000-0000-0000-000000000003';
const TEST_PHASE_2_ID = '00000000-0000-0000-0000-000000000004';
const TEST_PHASE_3_ID = '00000000-0000-0000-0000-000000000005';
const TEST_STANDARD_ID = '00000000-0000-0000-0000-000000000006';

const TEST_EMAIL = 'e2e-test-student@test.local';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_USERNAME = 'e2e-test-student';

export async function POST() {
  try {
    const adminClient = createAdminClient();

    // 1. Create test student user via Supabase Auth Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: TEST_USERNAME,
      },
    });

    if (authError) {
      // User might already exist - try to get existing user
      const { data: existingUser } = await adminClient.auth.admin.getUserById(TEST_USER_ID);
      if (!existingUser?.user) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
    }

    const userId = authData?.user?.id || TEST_USER_ID;

    // 2. Create/Update profile
    await db
      .insert(profiles)
      .values({
        id: userId,
        username: TEST_USERNAME,
        role: 'student',
        firstName: 'Test',
        lastName: 'Student',
        organizationId: null, // No organization for test user
        preferredLanguage: 'en',
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          username: TEST_USERNAME,
          role: 'student',
          updatedAt: new Date(),
        },
      });

    // 3. Create test competency standard
    await db
      .insert(competencyStandards)
      .values({
        id: TEST_STANDARD_ID,
        code: 'TEST-1.1',
        description: 'Test standard for E2E testing',
        studentFriendlyDescription: 'Complete the test spreadsheet activity',
        category: 'Testing',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: competencyStandards.id,
        set: {
          description: 'Test standard for E2E testing',
        },
      });

    // 4. Create test lesson
    await db
      .insert(lessons)
      .values({
        id: TEST_LESSON_ID,
        title: 'E2E Test Lesson',
        slug: 'e2e-test-lesson',
        description: 'Test lesson for end-to-end testing',
        unit: 'Test',
        lessonNumber: 0,
        estimatedMinutes: 15,
        linkedStandardId: TEST_STANDARD_ID,
      })
      .onConflictDoUpdate({
        target: lessons.id,
        set: {
          title: 'E2E Test Lesson',
          updatedAt: new Date(),
        },
      });

    // 5. Create test phases (3 sequential phases)
    const phaseData = [
      {
        id: TEST_PHASE_1_ID,
        lessonId: TEST_LESSON_ID,
        phaseNumber: 1,
        title: 'Phase 1 - Introduction',
        phaseType: 'read' as const,
        estimatedMinutes: 5,
        content: [
          {
            type: 'text',
            content: 'Welcome to the test lesson. This is a read phase for E2E testing.',
          },
        ],
      },
      {
        id: TEST_PHASE_2_ID,
        lessonId: TEST_LESSON_ID,
        phaseNumber: 2,
        title: 'Phase 2 - Practice Activity',
        phaseType: 'do' as const,
        estimatedMinutes: 5,
        content: [
          {
            type: 'text',
            content: 'Complete the spreadsheet activity below.',
          },
          {
            type: 'activity',
            componentKey: 'spreadsheet-evaluator',
            props: {
              templateId: 'test-template',
              instructions: 'Enter the value 100 in cell A1',
              targetCells: [
                {
                  cell: 'A1',
                  expectedValue: '100',
                  feedbackSuccess: 'Perfect! You entered the correct value.',
                  feedbackError: 'Try entering 100 in cell A1.',
                },
              ],
            },
          },
        ],
      },
      {
        id: TEST_PHASE_3_ID,
        lessonId: TEST_LESSON_ID,
        phaseNumber: 3,
        title: 'Phase 3 - Review',
        phaseType: 'read' as const,
        estimatedMinutes: 5,
        content: [
          {
            type: 'text',
            content: 'Great work! You have completed the test lesson.',
          },
        ],
      },
    ];

    for (const phase of phaseData) {
      await db
        .insert(phases)
        .values(phase)
        .onConflictDoUpdate({
          target: phases.id,
          set: {
            title: phase.title,
            content: phase.content,
            updatedAt: new Date(),
          },
        });
    }

    // 6. Return test context
    return NextResponse.json({
      success: true,
      testData: {
        userId,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        username: TEST_USERNAME,
        lessonId: TEST_LESSON_ID,
        lessonSlug: 'e2e-test-lesson',
        phaseIds: [TEST_PHASE_1_ID, TEST_PHASE_2_ID, TEST_PHASE_3_ID],
        standardId: TEST_STANDARD_ID,
      },
    });
  } catch (error) {
    console.error('E2E seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed E2E test data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
