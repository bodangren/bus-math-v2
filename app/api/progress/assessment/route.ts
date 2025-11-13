import { NextResponse } from 'next/server';
import { z } from 'zod';

import { calculateScore } from '@/lib/assessments/scoring';
import { submissionDataSchema } from '@/lib/db/schema/activity-submissions';
import { selectActivitySchema } from '@/lib/db/schema/validators';
import { createClient } from '@/lib/supabase/server';

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

    const {
      data: activityRecord,
      error: activityError,
    } = await supabase
      .from('activities')
      .select(
        `
          id,
          componentKey:component_key,
          displayName:display_name,
          description,
          props,
          gradingConfig:grading_config,
          createdAt:created_at,
          updatedAt:updated_at
        `,
      )
      .eq('id', payload.activityId)
      .single();

    if (activityError || !activityRecord) {
      const status = activityError?.code === 'PGRST116' ? 404 : 500;
      const message = status === 404 ? 'Activity not found' : activityError?.message ?? 'Unable to load activity';
      return NextResponse.json({ error: message }, { status });
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

    const now = new Date().toISOString();

    const { error: insertError } = await supabase
      .from('activity_submissions')
      .insert({
        user_id: data.user.id,
        activity_id: payload.activityId,
        submission_data: submissionData,
        score: score.score,
        max_score: score.maxScore,
        feedback: score.feedback,
        submitted_at: now,
        graded_at: now,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message ?? 'Unable to save submission' },
        { status: 500 },
      );
    }

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
