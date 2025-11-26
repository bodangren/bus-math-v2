import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const paramsSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
});

type PhaseStatus = 'completed' | 'current' | 'available' | 'locked';

interface PhaseProgressResponse {
  phaseNumber: number;
  phaseId: string;
  status: PhaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number | null;
}

interface ProgressResponse {
  phases: PhaseProgressResponse[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
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

    // Validate lessonId parameter
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

    const { lessonId } = parsed.data;

    // Verify the lesson exists before fetching progress
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lessonData) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 },
      );
    }

    // Fetch all phases for this lesson with their progress
    const { data: phasesData, error: phasesError } = await supabase
      .from('phases')
      .select(`
        id,
        phase_number,
        title,
        student_progress (
          status,
          started_at,
          completed_at,
          time_spent_seconds
        )
      `)
      .eq('lesson_id', lessonId)
      .eq('student_progress.user_id', user.id)
      .order('phase_number', { ascending: true });

    if (phasesError) {
      console.error('Phases query error:', phasesError);
      return NextResponse.json(
        { error: phasesError.message ?? 'Unable to fetch phases' },
        { status: 500 },
      );
    }

    if (!phasesData || phasesData.length === 0) {
      return NextResponse.json(
        { error: 'Lesson not found or has no phases' },
        { status: 404 },
      );
    }

    // Calculate status for each phase
    const phases: PhaseProgressResponse[] = phasesData.map((phase, index) => {
      const progress = Array.isArray(phase.student_progress) && phase.student_progress.length > 0
        ? phase.student_progress[0]
        : null;

      let status: PhaseStatus;

      if (progress?.status === 'completed') {
        status = 'completed';
      } else if (progress?.status === 'in_progress') {
        status = 'current';
      } else {
        // Phase is available if it's the first phase OR if the previous phase is completed
        if (index === 0) {
          status = 'available';
        } else {
          const previousPhase = phasesData[index - 1];
          const previousProgress = Array.isArray(previousPhase.student_progress) && previousPhase.student_progress.length > 0
            ? previousPhase.student_progress[0]
            : null;

          status = previousProgress?.status === 'completed' ? 'available' : 'locked';
        }
      }

      return {
        phaseNumber: phase.phase_number,
        phaseId: phase.id,
        status,
        startedAt: progress?.started_at ?? null,
        completedAt: progress?.completed_at ?? null,
        timeSpentSeconds: progress?.time_spent_seconds ?? null,
      };
    });

    const response: ProgressResponse = { phases };

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
