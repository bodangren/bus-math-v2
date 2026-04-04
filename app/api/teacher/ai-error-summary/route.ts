import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { generateAISummary, buildDeterministicSummary } from '@/lib/practice/error-analysis';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { isPracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { resolveAIProviderFromEnv } from '@/lib/practice/error-analysis/providers';

const querySchema = z.object({
  lessonId: z.string().trim().min(1, 'lessonId is required'),
  studentId: z.string().trim().min(1, 'studentId is required'),
});

export async function GET(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lessonId: searchParams.get('lessonId'),
      studentId: searchParams.get('studentId'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { lessonId, studentId } = parsed.data;

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

    const detail = await fetchInternalQuery(internal.teacher.getSubmissionDetail, {
      studentId,
      lessonId,
      studentName: student.displayName ?? student.username ?? 'Unknown',
    });

    if (!detail) {
      return NextResponse.json(
        { error: 'No submissions found for this student in this lesson' },
        { status: 404 },
      );
    }

    const envelopes: PracticeSubmissionEnvelope[] = [];
    for (const phase of detail.phases) {
      if (!phase.evidence) continue;
      for (const ev of phase.evidence) {
        if (ev.kind !== 'practice' || !ev.submissionData) continue;
        const data = ev.submissionData as Record<string, unknown>;
        if (isPracticeSubmissionEnvelope(data)) {
          envelopes.push(data);
        }
      }
    }

    const deterministicSummary = buildDeterministicSummary(
      lessonId,
      envelopes,
      new Map(envelopes.map((e) => [e.activityId, studentId])),
    );

    let aiSummary = null;
    const provider = resolveAIProviderFromEnv();

    if (provider && envelopes.length > 0) {
      const latestSubmission = envelopes.reduce((a, b) =>
        a.attemptNumber >= b.attemptNumber ? a : b,
      );

      aiSummary = await generateAISummary(
        {
          submission: latestSubmission,
          deterministicSummary,
          rawEvidence: {
            answers: latestSubmission.answers,
            artifact: latestSubmission.artifact,
          },
        },
        provider,
      );
    }

    return NextResponse.json({
      studentName: detail.studentName,
      lessonTitle: detail.lessonTitle,
      deterministicSummary,
      aiSummary,
      aiEnabled: provider !== null,
    });
  } catch (error) {
    console.error('[ai-error-summary] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    );
  }
}
