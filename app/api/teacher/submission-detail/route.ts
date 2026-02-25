import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { fetchQuery, api } from '@/lib/convex/server';

const querySchema = z.object({
  studentId: z.string().uuid('studentId must be a valid UUID'),
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const teacher = await fetchQuery(api.teacher.getProfileWithOrg, {
      userId: user.id as any,
    });

    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const student = await fetchQuery(api.activities.getProfileById, {
      profileId: studentId as any,
    });

    if (!student || student.role !== 'student' || student.organizationId !== teacher.organizationId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentName = student.displayName ?? student.username ?? 'Unknown';

    const detail = await fetchQuery(api.teacher.getSubmissionDetail, {
      studentId: studentId as any,
      lessonId: lessonId as any,
      studentName,
    });

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
