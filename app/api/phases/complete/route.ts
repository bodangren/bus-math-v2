import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Request schema for phase completion
 */
const CompletePhaseSchema = z.object({
  lessonId: z.string().uuid('Invalid lesson ID format'),
  phaseNumber: z.number().int().positive('Phase number must be a positive integer'),
  timeSpent: z.number().int().nonnegative('Time spent must be non-negative'),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
  completedAt: z.string().datetime('Invalid ISO datetime format'),
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
    const body = await request.json();
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
      completedAt,
    }: CompletePhaseRequest = validationResult.data;

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
    const { data: existingCompletion, error: existingError } = await supabase
      .from('student_progress')
      .select('id, completed_at, idempotency_key')
      .eq('user_id', user.id)
      .eq('phase_id', phaseId)
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing completion:', existingError);
      return NextResponse.json(
        {
          error: 'Failed to check existing completion',
          details: existingError.message,
        },
        { status: 500 }
      );
    }

    // If this idempotency key already exists, return success (idempotent)
    if (existingCompletion) {
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
        completedAt: existingCompletion.completed_at,
      });
    }

    // Step 4: Upsert phase completion
    const progressRecord = {
      user_id: user.id,
      phase_id: phaseId,
      status: 'completed' as const,
      started_at: completedAt, // Use completedAt as fallback for started_at
      completed_at: completedAt,
      time_spent_seconds: timeSpent,
      idempotency_key: idempotencyKey,
      updated_at: new Date().toISOString(),
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
      completedAt,
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
