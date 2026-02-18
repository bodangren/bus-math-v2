/**
 * GET /api/teacher/submission-detail?studentId=<uuid>&lessonId=<uuid>
 *
 * Returns phase-level submission detail for one student × lesson.
 * Restricted to authenticated teachers/admins within the same organization.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { profiles } from '@/lib/db/schema';
import { fetchSubmissionDetail } from '@/lib/teacher/submission-detail';

const querySchema = z.object({
  studentId: z.string().uuid('studentId must be a valid UUID'),
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
});

export async function GET(request: Request) {
  try {
    // 1 — authenticate
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2 — validate query params
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      studentId: searchParams.get('studentId'),
      lessonId: searchParams.get('lessonId'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { studentId, lessonId } = parsed.data;

    // 3 — verify caller is teacher or admin
    const [teacher] = await db
      .select({ role: profiles.role, organizationId: profiles.organizationId })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4 — verify student belongs to the same org
    const [student] = await db
      .select({
        displayName: profiles.displayName,
        username: profiles.username,
        organizationId: profiles.organizationId,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.id, studentId),
          eq(profiles.role, 'student'),
        ),
      )
      .limit(1);

    if (!student || student.organizationId !== teacher.organizationId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentName = student.displayName ?? student.username ?? 'Unknown';

    // 5 — fetch and return
    const detail = await fetchSubmissionDetail(studentId, lessonId, studentName);

    if (!detail) {
      return NextResponse.json(
        { error: 'Lesson not found or has no published phases' },
        { status: 404 },
      );
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error('[submission-detail] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    );
  }
}
