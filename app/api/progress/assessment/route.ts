import { NextResponse } from 'next/server';
import { z } from 'zod';

import { calculateScore } from '@/lib/assessments/scoring';
import { submissionDataSchema } from '@/lib/db/schema/activity-submissions';
import { selectActivitySchema } from '@/lib/db/schema/validators';
import { createClient } from '@/lib/supabase/server';
import { fetchQuery, fetchMutation, api } from '@/lib/convex/server';

const requestSchema = z.object({
  activityId: z.string().uuid(),
  answers: z.record(z.string(), z.unknown()),
  interactionHistory: z.array(z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

type RequestPayload = z.infer<typeof requestSchema>;

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
    const supabase = await createClient();
    const {
      data,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !data?.user) {
      return NextResponse.json(
        { error: authError?.message ?? 'Unauthorized' },
        { status: 401 },
      );
    }

    let payload: RequestPayload;
    try {
      const body = await request.json();
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return buildBadRequest(parsed.error.flatten().fieldErrors);
      }
      payload = parsed.data;
    } catch (parseError) {
      return buildBadRequest(
        parseError instanceof Error ? parseError.message : 'Unable to parse request body',
      );
    }

    if (Object.keys(payload.answers).length === 0) {
      return buildBadRequest('answers must include at least one entry.');
    }

    const activityRecord = await fetchQuery(api.activities.getActivityById, {
      activityId: payload.activityId as any,
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
      score = calculateScore(activity, payload.answers);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to score submission';
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const submissionData = submissionDataSchema.parse({
      answers: payload.answers,
      interactionHistory: payload.interactionHistory,
      metadata: payload.metadata,
    });

    await fetchMutation(api.activities.submitAssessment, {
      userId: data.user.id as any,
      activityId: payload.activityId as any,
      submissionData,
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
