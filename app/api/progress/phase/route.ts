import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const requestSchema = z.object({
  // Use regex to validate UUID format without enforcing version/variant bits (for seeded data compatibility)
  phaseId: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, 'Invalid UUID format'),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  completed: z.boolean().optional(),
  timeSpentSeconds: z.number().int().nonnegative().optional(),
});

type RequestPayload = z.infer<typeof requestSchema>;
type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

const DEFAULT_STATUS: ProgressStatus = 'completed';

function resolveStatus(payload: RequestPayload): ProgressStatus {
  if (payload.status) {
    return payload.status;
  }

  if (typeof payload.completed === 'boolean') {
    return payload.completed ? 'completed' : 'in_progress';
  }

  return DEFAULT_STATUS;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: authError.message ?? 'Unauthorized' },
        { status: 401 },
      );
    }

    const user = data?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload: RequestPayload;
    try {
      const body = await request.json();
      const parsed = requestSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Invalid payload',
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }

      payload = parsed.data;
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details:
            error instanceof Error ? error.message : 'Unable to parse request body',
        },
        { status: 400 },
      );
    }

    const status = resolveStatus(payload);
    const timestamp = new Date().toISOString();

    const record: {
      user_id: string;
      phase_id: string;
      status: ProgressStatus;
      started_at: string | null;
      completed_at: string | null;
      time_spent_seconds?: number;
    } = {
      user_id: user.id,
      phase_id: payload.phaseId,
      status,
      started_at: status === 'not_started' ? null : timestamp,
      completed_at: status === 'completed' ? timestamp : null,
    };

    if (typeof payload.timeSpentSeconds === 'number') {
      record.time_spent_seconds = payload.timeSpentSeconds;
    }

    const { error: upsertError } = await supabase
      .from('student_progress')
      .upsert(record, { onConflict: 'user_id,phase_id' });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return NextResponse.json(
        { error: upsertError.message ?? 'Unable to save progress' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      progress: {
        phaseId: payload.phaseId,
        status,
        startedAt: record.started_at,
        completedAt: record.completed_at,
        timeSpentSeconds: record.time_spent_seconds ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected error while saving progress',
      },
      { status: 500 },
    );
  }
}
