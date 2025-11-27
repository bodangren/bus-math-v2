import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Request schema for phase completion
 * Note: completedAt is removed - server uses current time
 * timeSpent is validated and clamped to prevent abuse
 */
const CompletePhaseSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
  phaseNumber: z.number().int().positive('Phase number must be a positive integer'),
  timeSpent: z.number().int().nonnegative('Time spent must be non-negative').max(86400, 'Time spent cannot exceed 24 hours'),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
});

type CompletePhaseRequest = z.infer<typeof CompletePhaseSchema>;

/**
 * Response from the API
 */
interface CompletePhaseResponse {
  success: boolean;
  nextPhaseUnlocked: boolean;
  message?: string;
  error?: string;
  phaseId?: string;
  completedAt?: string;
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
export async function POST(request: NextRequest) {
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
      lessonId,
      phaseNumber,
      timeSpent,
      idempotencyKey,
    }: CompletePhaseRequest = validationResult.data;

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

    // Step 2: Get the phase ID
    const { data: phase, error: phaseError } = await supabase
      .from('phases')
      .select('id')
      .eq('lesson_id', lessonId)
      .eq('phase_number', phaseNumber)
      .single();

    if (phaseError || !phase) {
      console.error('Error fetching phase:', phaseError);
      return NextResponse.json(
        {
          error: 'Phase not found',
          details: phaseError?.message || 'No phase exists for this lesson and phase number',
        },
        { status: 404 }
      );
    }

    const phaseId = phase.id;

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
      const { data: nextPhase } = await supabase
        .from('phases')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('phase_number', phaseNumber + 1)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        nextPhaseUnlocked: !!nextPhase,
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
      // Phase already completed with different idempotency key - reject
      return NextResponse.json(
        {
          error: 'Phase already completed',
          details: 'This phase has already been completed. Use the original idempotency key to replay.',
        },
        { status: 409 }
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

    // Step 5: Check if next phase exists (to determine if it was unlocked)
    const { data: nextPhase, error: nextPhaseError } = await supabase
      .from('phases')
      .select('id, phase_number')
      .eq('lesson_id', lessonId)
      .eq('phase_number', phaseNumber + 1)
      .maybeSingle();

    if (nextPhaseError) {
      console.error('Error checking next phase:', nextPhaseError);
      // Don't fail the request, just log the error
    }

    const nextPhaseUnlocked = !!nextPhase;

    // Step 6: Return success response
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
