import { NextResponse } from 'next/server';

import { calculateScore } from '@/lib/assessments/scoring';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { submissionDataSchema } from '@/lib/db/schema/activity-submissions';
import { selectActivitySchema } from '@/lib/db/schema/validators';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';
import { normalizePracticeSubmissionInput } from '@/lib/practice/contract';

function buildBadRequest(details: Record<string, unknown> | string) {
  return NextResponse.json(
    typeof details === 'string'
      ? { error: details }
      : {
          error: 'Invalid payload',
          details,
        },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  try {
    const claimsOrResponse = await requireStudentRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    let submission;
    try {
      const body = await request.json();
      submission = submissionDataSchema.parse(normalizePracticeSubmissionInput(body));
    } catch (parseError) {
      console.error('Invalid practice submission payload', parseError);
      return buildBadRequest('Invalid payload');
    }

    if (Object.keys(submission.answers).length === 0) {
      return buildBadRequest('answers must include at least one entry.');
    }

    const activityRecord = await fetchInternalQuery(internal.activities.getActivityById, {
      activityId: submission.activityId as never,
    });

    if (!activityRecord) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    let activity;
    try {
      activity = selectActivitySchema.parse({
        ...activityRecord,
        createdAt: new Date(activityRecord.createdAt),
        updatedAt: new Date(activityRecord.updatedAt),
      });
    } catch (error) {
      console.error('Invalid activity configuration', error);
      return NextResponse.json({ error: 'Activity configuration is invalid.' }, { status: 500 });
    }

    let score;
    try {
      score = calculateScore(activity, submission.answers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to score submission';
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const userId = claimsOrResponse.sub;

    await fetchInternalMutation(internal.activities.submitAssessment, {
      userId: userId as never,
      activityId: submission.activityId as never,
      submissionData: submission,
      score: score.score,
      maxScore: score.maxScore,
      feedback: score.feedback,
    });

    return NextResponse.json({
      score: score.score,
      maxScore: score.maxScore,
      percentage: score.percentage,
      feedback: score.feedback,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected error while scoring assessment',
      },
      { status: 500 },
    );
  }
}
