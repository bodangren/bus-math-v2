import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

/**
 * Request schema for activity completion
 */
const CompleteActivitySchema = z.object({
  activityId: z.string().uuid('Invalid activity ID format'),
  lessonId: z.string().uuid('Invalid lesson ID format'),
  phaseNumber: z.number().int().positive('Phase number must be a positive integer'),
  linkedStandardId: z.string().uuid().optional().nullable(),
  completionData: z.record(z.string(), z.unknown()).optional().nullable(),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
});

type CompleteActivityRequest = z.infer<typeof CompleteActivitySchema>;

/**
 * RPC function response from complete_activity_atomic
 */
interface CompleteActivityResponse {
  success: boolean;
  nextPhaseUnlocked: boolean;
  message: string;
  completionId?: string;
  completedAt?: string;
  completedPhases?: number;
  totalPhases?: number;
  errorCode?: string;
}

/**
 * POST /api/activities/complete
 *
 * Atomically completes an activity for the authenticated user.
 * This endpoint:
 * - Validates the authenticated user session
 * - Calls the complete_activity_atomic RPC function
 * - Handles idempotency via idempotencyKey
 * - Returns completion status and next phase unlock info
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
        { error: 'Unauthorized. Please sign in to complete activities.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CompleteActivitySchema.safeParse(body);

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
      activityId,
      lessonId,
      phaseNumber,
      linkedStandardId,
      completionData,
      idempotencyKey,
    }: CompleteActivityRequest = validationResult.data;

    // Call the RPC function for atomic completion
    // SECURITY: student_id is derived from auth.uid() in the RPC function
    // to prevent auth bypass attacks
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'complete_activity_atomic',
      {
        p_activity_id: activityId,
        p_lesson_id: lessonId,
        p_phase_number: phaseNumber,
        p_linked_standard_id: linkedStandardId || null,
        p_completion_data: completionData || null,
        p_idempotency_key: idempotencyKey,
      }
    );

    // Handle RPC errors
    if (rpcError) {
      console.error('RPC Error calling complete_activity_atomic:', rpcError);
      return NextResponse.json(
        {
          error: 'Failed to complete activity',
          details: rpcError.message,
        },
        { status: 500 }
      );
    }

    // Type assertion for RPC result
    const result = rpcResult as CompleteActivityResponse;

    // Check if the RPC function returned an error
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Activity completion failed',
          message: result.message,
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        nextPhaseUnlocked: result.nextPhaseUnlocked,
        message: result.message,
        completionId: result.completionId,
        completedAt: result.completedAt,
        completedPhases: result.completedPhases,
        totalPhases: result.totalPhases,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in /api/activities/complete:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
