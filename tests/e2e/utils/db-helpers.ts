/**
 * Database Helper Functions for E2E Tests
 *
 * These utilities allow E2E tests to directly query the database to verify
 * state without relying solely on UI assertions. This provides stronger
 * guarantees about backend behavior.
 *
 * SECURITY: These helpers should ONLY be used in test environments.
 */

import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { studentProgress } from '@/lib/db/schema/student-progress';
import { studentCompetency, competencyStandards } from '@/lib/db/schema/competencies';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Create a Supabase Admin client for direct database access
 * Uses service role key for bypassing RLS in tests
 */
function getAdminClient() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database helpers cannot be used in production');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get student progress for a specific phase
 *
 * @param userId - Student user ID
 * @param phaseId - Phase ID
 * @returns Progress record or null if not found
 */
export async function getStudentProgress(userId: string, phaseId: string) {
  const progress = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.userId, userId), eq(studentProgress.phaseId, phaseId)))
    .limit(1);

  return progress[0] || null;
}

/**
 * Get student competency for a specific standard
 *
 * @param userId - Student user ID
 * @param standardId - Competency standard ID
 * @returns Competency record or null if not found
 */
export async function getStudentCompetency(userId: string, standardId: string) {
  const competency = await db
    .select()
    .from(studentCompetency)
    .where(
      and(eq(studentCompetency.studentId, userId), eq(studentCompetency.standardId, standardId))
    )
    .limit(1);

  return competency[0] || null;
}

/**
 * Get student competency by standard code (e.g., "ACC-1.1")
 *
 * @param userId - Student user ID
 * @param standardCode - Standard code (e.g., "ACC-1.1")
 * @returns Competency record or null if not found
 */
export async function getStudentCompetencyByCode(userId: string, standardCode: string) {
  // First, find the standard by code
  const standard = await db
    .select()
    .from(competencyStandards)
    .where(eq(competencyStandards.code, standardCode))
    .limit(1);

  if (!standard[0]) {
    return null;
  }

  return getStudentCompetency(userId, standard[0].id);
}

/**
 * Get overall lesson completion percentage for a student
 *
 * @param userId - Student user ID
 * @param lessonId - Lesson ID
 * @returns Completion percentage (0-100) or 0 if no progress
 */
export async function getLessonCompletion(userId: string, lessonId: string): Promise<number> {
  // Query to get all phases for the lesson and their completion status
  const [counts] = await db.execute<{
    total_phases: number;
    completed_phases: number;
  }>(sql`
    SELECT
      COUNT(p.id) as total_phases,
      COUNT(CASE WHEN sp.status = 'completed' THEN 1 END) as completed_phases
    FROM phases p
    LEFT JOIN student_progress sp ON sp.phase_id = p.id AND sp.user_id = ${userId}
    WHERE p.lesson_id = ${lessonId}
  `);

  if (!counts) {
    return 0;
  }

  const { total_phases, completed_phases } = counts;

  if (total_phases === 0) {
    return 0;
  }

  return Math.round((completed_phases / total_phases) * 100);
}

/**
 * Verify that a phase is marked as completed
 *
 * @param userId - Student user ID
 * @param phaseId - Phase ID
 * @returns True if phase is completed, false otherwise
 */
export async function isPhaseCompleted(userId: string, phaseId: string): Promise<boolean> {
  const progress = await getStudentProgress(userId, phaseId);
  return progress?.status === 'completed';
}

/**
 * Get all progress records for a student in a lesson
 *
 * @param userId - Student user ID
 * @param lessonId - Lesson ID
 * @returns Array of progress records
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  const rows = await db.execute<{
    phase_id: string;
    phase_number: number;
    status: string;
    completed_at: string | null;
    time_spent_seconds: number;
  }>(sql`
    SELECT
      p.id as phase_id,
      p.phase_number,
      COALESCE(sp.status, 'not_started') as status,
      sp.completed_at,
      COALESCE(sp.time_spent_seconds, 0) as time_spent_seconds
    FROM phases p
    LEFT JOIN student_progress sp ON sp.phase_id = p.id AND sp.user_id = ${userId}
    WHERE p.lesson_id = ${lessonId}
    ORDER BY p.phase_number ASC
  `);

  return rows;
}

/**
 * Clean up all test data for a specific user
 * WARNING: This is destructive and should only be used in tests
 *
 * @param userId - User ID to clean up
 */
export async function cleanupUserTestData(userId: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot cleanup user data in production');
  }

  const adminClient = getAdminClient();

  // Delete user (cascading deletes will handle progress, competency, etc.)
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.warn(`Warning: Failed to delete user ${userId}:`, error);
  }
}
