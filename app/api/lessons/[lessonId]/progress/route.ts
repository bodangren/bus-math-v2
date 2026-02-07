import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import type {
  LessonProgressResponse,
  PhaseProgressResponse,
  PhaseStatus,
} from '@/types/api';

const paramsSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
});

interface ProgressRow {
  phase_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | null;
  started_at: string | null;
  completed_at: string | null;
  time_spent_seconds: number | null;
  user_id: string;
}

interface VersionedPhaseRow {
  id: string;
  phase_number: number;
  title: string | null;
}

function getPhaseStatus(
  phaseIndex: number,
  allPhases: PhaseProgressResponse[],
  progress: ProgressRow | null,
): PhaseStatus {
  if (progress?.status === 'completed') return 'completed';
  if (progress?.status === 'in_progress') return 'current';
  if (phaseIndex === 0) return 'available';
  return allPhases[phaseIndex - 1]?.status === 'completed' ? 'available' : 'locked';
}

async function fetchVersionedPhaseProgress(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lessonId: string,
  userId: string,
): Promise<PhaseProgressResponse[] | null> {
  const { data: lessonVersions, error: lessonVersionError } = await supabase
    .from('lesson_versions')
    .select('id, version, status')
    .eq('lesson_id', lessonId)
    .order('version', { ascending: false })
    .limit(1);

  if (lessonVersionError || !lessonVersions || lessonVersions.length === 0) {
    return null;
  }

  const activeLessonVersionId = lessonVersions[0].id;

  const { data: versionedPhases, error: versionedPhasesError } = await supabase
    .from('phase_versions')
    .select('id, phase_number, title')
    .eq('lesson_version_id', activeLessonVersionId)
    .order('phase_number', { ascending: true });

  if (versionedPhasesError || !versionedPhases || versionedPhases.length === 0) {
    return null;
  }

  const typedPhases = versionedPhases as VersionedPhaseRow[];
  const versionedPhaseIds = typedPhases.map((phase) => phase.id);

  const { data: versionedProgressRows, error: versionedProgressError } = await supabase
    .from('student_progress')
    .select('phase_id, status, started_at, completed_at, time_spent_seconds, user_id')
    .eq('user_id', userId)
    .in('phase_id', versionedPhaseIds);

  if (versionedProgressError) {
    return null;
  }

  const progressByPhaseId = new Map<string, ProgressRow>();
  for (const progressRow of (versionedProgressRows ?? []) as ProgressRow[]) {
    progressByPhaseId.set(progressRow.phase_id, progressRow);
  }

  const phaseProgressList: PhaseProgressResponse[] = typedPhases.map((phase) => {
    const progress = progressByPhaseId.get(phase.id) ?? null;
    return {
      phaseNumber: phase.phase_number,
      phaseId: phase.id,
      status: 'locked',
      startedAt: progress?.started_at ?? null,
      completedAt: progress?.completed_at ?? null,
      timeSpentSeconds: progress?.time_spent_seconds ?? null,
    };
  });

  for (let i = 0; i < phaseProgressList.length; i += 1) {
    const row = phaseProgressList[i];
    const progress = progressByPhaseId.get(row.phaseId) ?? null;
    row.status = getPhaseStatus(i, phaseProgressList, progress);
  }

  return phaseProgressList;
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

    // Versioned phase model is the canonical runtime source.
    const versionedPhases = await fetchVersionedPhaseProgress(supabase, lessonId, user.id);
    if (versionedPhases && versionedPhases.length > 0) {
      const versionedResponse: LessonProgressResponse = { phases: versionedPhases };
      return NextResponse.json(versionedResponse);
    }

    return NextResponse.json(
      { error: 'Lesson not found or has no versioned phases' },
      { status: 404 },
    );
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
