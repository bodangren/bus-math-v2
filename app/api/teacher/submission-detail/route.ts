import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

const querySchema = z.object({
  studentId: z.string().trim().min(1, 'studentId is required'),
  lessonId: z.string().trim().min(1, 'lessonId is required'),
});

export async function GET(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
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

    const teacher = await fetchInternalQuery(internal.teacher.getProfileWithOrg, {
      userId: claims.sub,
    });

    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const student = await fetchInternalQuery(internal.activities.getProfileById, {
      profileId: studentId,
    });

    if (!student || student.role !== 'student' || student.organizationId !== teacher.organizationId) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentName = student.displayName ?? student.username ?? 'Unknown';

    const detail = await fetchInternalQuery(internal.teacher.getSubmissionDetail, {
      studentId,
      lessonId,
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
