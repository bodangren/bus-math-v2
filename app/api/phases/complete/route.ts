import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { CompletePhaseRequest, CompletePhaseResponse } from '@/types/api';

/**
 * Request schema for phase completion
 * Note: completedAt is removed - server uses current time
 * timeSpent is validated and clamped to prevent abuse
 */
const CompletePhaseSchema = z.object({
  lessonId: z.string().trim().min(1, 'Lesson identifier is required'),
  phaseNumber: z.number().int().positive('Phase number must be a positive integer'),
  timeSpent: z.number().int().nonnegative('Time spent must be non-negative').max(86400, 'Time spent cannot exceed 24 hours'),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
  linkedStandardId: z.string().uuid('Invalid standard ID format').optional(),
});
const uuidSchema = z.string().uuid();

type CompletePhasePayload = z.infer<typeof CompletePhaseSchema> & CompletePhaseRequest;

interface ResolvedPhaseContext {
  phaseId: string;
  lessonVersionId: string;
}

async function resolveVersionedPhaseContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lessonId: string,
  phaseNumber: number,
): Promise<ResolvedPhaseContext | null> {
  const { data: lessonVersions, error: lessonVersionError } = await supabase
    .from('lesson_versions')
    .select('id, version, status')
    .eq('lesson_id', lessonId)
    .order('version', { ascending: false })
    .limit(1);

  if (lessonVersionError || !lessonVersions || lessonVersions.length === 0) {
    return null;
  }

  const lessonVersionId = lessonVersions[0].id;

  const { data: currentPhase, error: currentPhaseError } = await supabase
    .from('phase_versions')
    .select('id')
    .eq('lesson_version_id', lessonVersionId)
    .eq('phase_number', phaseNumber)
    .maybeSingle();

  if (currentPhaseError || !currentPhase) {
    return null;
  }

  return {
    phaseId: currentPhase.id,
    lessonVersionId,
  };
}

async function normalizeLessonId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lessonIdentifier: string,
): Promise<string | null> {
  if (uuidSchema.safeParse(lessonIdentifier).success) {
    return lessonIdentifier;
  }

  const { data: lessonBySlug, error: lessonBySlugError } = await supabase
    .from('lessons')
    .select('id')
    .eq('slug', lessonIdentifier)
    .maybeSingle();

  if (lessonBySlugError || !lessonBySlug) {
    return null;
  }

  return lessonBySlug.id;
}

async function checkNextPhaseExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  lessonVersionId: string,
  phaseNumber: number,
): Promise<boolean> {
  const { data: nextPhase, error: nextPhaseError } = await supabase
    .from('phase_versions')
    .select('id')
    .eq('lesson_version_id', lessonVersionId)
    .eq('phase_number', phaseNumber + 1)
    .maybeSingle();

  if (nextPhaseError) {
    console.error('Error checking next phase:', nextPhaseError);
    return false;
  }

  return !!nextPhase;
}

/**
 * POST /api/phases/complete
 *
 * Atomically completes a phase for the authenticated user.
 *
 * This endpoint:
 * - Validates the authenticated user session
 * - Checks if the user can access the phase (sequential locking)
 * - Upserts phase completion with idempotency protection
 * - Returns whether the next phase was unlocked
 *
 * Security:
 * - User ID is derived from auth.getUser() to prevent auth bypass
 * - Sequential phase access is enforced via can_access_phase RPC
 * - Idempotency key prevents duplicate completions
 */
export async function POST(request: Request) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to complete phases.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Malformed JSON',
        },
        { status: 400 }
      );
    }

    const validationResult = CompletePhaseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      lessonId: lessonIdentifier,
      phaseNumber,
      timeSpent,
      idempotencyKey,
      linkedStandardId,
    }: CompletePhasePayload = validationResult.data;

    const lessonId = await normalizeLessonId(supabase, lessonIdentifier);
    if (!lessonId) {
      return NextResponse.json(
        {
          error: 'Lesson not found',
          details: 'No lesson exists for the provided identifier',
        },
        { status: 404 }
      );
    }

    // Use server timestamp for security - never trust client timestamps
    const serverTimestamp = new Date().toISOString();

    // Step 1: Check if user can access this phase
    const { data: canAccess, error: accessError } = await supabase.rpc(
      'can_access_phase',
      {
        p_lesson_id: lessonId,
        p_phase_number: phaseNumber,
      }
    );

    if (accessError) {
      console.error('Error checking phase access:', accessError);
      return NextResponse.json(
        {
          error: 'Failed to verify phase access',
          details: accessError.message,
        },
        { status: 500 }
      );
    }

    if (!canAccess) {
      return NextResponse.json(
        {
          success: false,
          nextPhaseUnlocked: false,
          error: 'Cannot complete this phase. Previous phase must be completed first.',
        },
        { status: 403 }
      );
    }

    // Step 2: Resolve phase from versioned schema.
    const phaseContext = await resolveVersionedPhaseContext(supabase, lessonId, phaseNumber);

    if (!phaseContext) {
      return NextResponse.json(
        {
          error: 'Phase not found',
          details: 'No versioned phase exists for this lesson and phase number',
        },
        { status: 404 }
      );
    }

    const phaseId = phaseContext.phaseId;

    // Step 3: Check for existing completion with this idempotency key
    // This must check across ALL phases, not just the current one
    const { data: existingWithKey, error: existingKeyError } = await supabase
      .from('student_progress')
      .select('id, phase_id, completed_at')
      .eq('user_id', user.id)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingKeyError) {
      console.error('Error checking existing idempotency key:', existingKeyError);
      return NextResponse.json(
        {
          error: 'Failed to check existing completion',
          details: existingKeyError.message,
        },
        { status: 500 }
      );
    }

    // If this idempotency key already exists, verify it matches the current phase
    if (existingWithKey) {
      if (existingWithKey.phase_id !== phaseId) {
        // Idempotency key reused for different phase - reject
        return NextResponse.json(
          {
            error: 'Idempotency key already used for a different phase',
            details: 'This idempotency key has been used for another completion',
          },
          { status: 409 }
        );
      }

      // Same phase, same key - return cached result (idempotent)
      console.log(`Idempotent request detected: ${idempotencyKey}, returning cached result`);

      // Check if next phase exists
      return NextResponse.json({
        success: true,
        nextPhaseUnlocked: await checkNextPhaseExists(
          supabase,
          phaseContext.lessonVersionId,
          phaseNumber,
        ),
        message: 'Phase already completed (idempotent request)',
        phaseId,
        completedAt: existingWithKey.completed_at,
      });
    }

    // Step 4: Check if phase already completed (different idempotency key)
    // If so, reject to prevent overwriting time_spent with a new key
    const { data: existingProgress, error: progressError } = await supabase
      .from('student_progress')
      .select('id, idempotency_key, completed_at')
      .eq('user_id', user.id)
      .eq('phase_id', phaseId)
      .maybeSingle();

    if (progressError) {
      console.error('Error checking existing progress:', progressError);
      return NextResponse.json(
        {
          error: 'Failed to check existing progress',
          details: progressError.message,
        },
        { status: 500 }
      );
    }

    if (existingProgress && existingProgress.idempotency_key && existingProgress.idempotency_key !== idempotencyKey) {
      // Phase already completed with a different idempotency key.
      // Return a success payload so repeated UI clicks/reloads remain safe.
      return NextResponse.json(
        {
          success: true,
          nextPhaseUnlocked: await checkNextPhaseExists(
            supabase,
            phaseContext.lessonVersionId,
            phaseNumber,
          ),
          message: `Phase ${phaseNumber} was already completed.`,
          phaseId,
          completedAt: existingProgress.completed_at,
        },
        { status: 200 }
      );
    }

    // Step 5: Upsert phase completion using server timestamp
    const progressRecord = {
      user_id: user.id,
      phase_id: phaseId,
      status: 'completed' as const,
      started_at: existingProgress?.completed_at || serverTimestamp, // Preserve original start if exists
      completed_at: serverTimestamp, // Always use server time
      time_spent_seconds: timeSpent, // Validated and clamped by schema
      idempotency_key: idempotencyKey,
      updated_at: serverTimestamp,
    };

    const { error: upsertError } = await supabase
      .from('student_progress')
      .upsert(progressRecord, {
        onConflict: 'user_id,phase_id',
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return NextResponse.json(
        {
          error: 'Failed to save phase completion',
          details: upsertError.message,
        },
        { status: 500 }
      );
    }

    // Step 6: Credit competency standard when a linked standard ID is provided
    if (linkedStandardId) {
      const { error: competencyError } = await supabase
        .from('student_competency')
        .upsert(
          {
            student_id: user.id,
            standard_id: linkedStandardId,
            mastery_level: 10,
            evidence_activity_id: null,
            last_updated: serverTimestamp,
            updated_by: user.id,
          },
          { onConflict: 'student_id,standard_id' },
        );

      if (competencyError) {
        // Non-fatal: log but don't block the phase completion response
        console.error('Failed to record competency standard:', competencyError);
      }
    }

    const nextPhaseUnlocked = await checkNextPhaseExists(
      supabase,
      phaseContext.lessonVersionId,
      phaseNumber,
    );

    // Step 7: Return success response
    const response: CompletePhaseResponse = {
      success: true,
      nextPhaseUnlocked,
      message: nextPhaseUnlocked
        ? `Phase ${phaseNumber} completed. Phase ${phaseNumber + 1} unlocked.`
        : `Phase ${phaseNumber} completed. This was the final phase.`,
      phaseId,
      completedAt: serverTimestamp, // Return server timestamp
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in /api/phases/complete:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
