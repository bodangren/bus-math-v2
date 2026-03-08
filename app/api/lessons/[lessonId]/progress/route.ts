import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type {
  LessonProgressResponse,
  PhaseProgressResponse,
} from '@/types/api';

const paramsSchema = z.object({
  lessonId: z.string().trim().min(1, 'Lesson identifier is required'),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = claims.sub;

    const resolvedParams = await params;
    const parsed = paramsSchema.safeParse(resolvedParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const progress = await fetchInternalQuery(internal.student.getLessonProgress, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: userId as any,
      lessonIdentifier: parsed.data.lessonId,
    });

    if (!progress) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 },
      );
    }

    const response: LessonProgressResponse = {
      phases: progress.phases as PhaseProgressResponse[],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected error while fetching progress',
      },
      { status: 500 },
    );
  }
}
