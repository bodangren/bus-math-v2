import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { fetchQuery, fetchMutation, api } from '@/lib/convex/server';
import type { CompletePhaseRequest, CompletePhaseResponse } from '@/types/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny = api as any;

const CompletePhaseSchema = z.object({
  lessonId: z.string().trim().min(1, 'Lesson identifier is required'),
  phaseNumber: z.number().int().positive('Phase number must be a positive integer'),
  timeSpent: z.number().int().nonnegative('Time spent must be non-negative').max(86400, 'Time spent cannot exceed 24 hours'),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
  linkedStandardId: z.string().uuid('Invalid standard ID format').optional(),
});

type CompletePhasePayload = z.infer<typeof CompletePhaseSchema> & CompletePhaseRequest;

export async function POST(request: Request) {
  try {
    const claims = await getRequestSessionClaims(request);
    if (!claims) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to complete phases.' },
        { status: 401 }
      );
    }

    const userId = claims.sub;

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
      lessonId: lessonIdentifier,
      phaseNumber,
      timeSpent,
      idempotencyKey,
      linkedStandardId,
    }: CompletePhasePayload = validationResult.data;

    const serverTimestamp = new Date().toISOString();

    const lesson = await fetchQuery(apiAny.api.getLessonBySlugOrId, { identifier: lessonIdentifier });
    if (!lesson) {
      return NextResponse.json(
        {
          error: 'Lesson not found',
          details: 'No lesson exists for the provided identifier',
        },
        { status: 404 }
      );
    }

    const canAccess = await fetchQuery(apiAny.api.canAccessPhase, {
      userId: userId,
      lessonId: lesson._id,
      phaseNumber,
    });

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

    const phaseContext = await fetchQuery(apiAny.api.getPhaseContext, {
      lessonId: lesson._id,
      phaseNumber,
    });

    if (!phaseContext) {
      return NextResponse.json(
        {
          error: 'Phase not found',
          details: 'No versioned phase exists for this lesson and phase number',
        },
        { status: 404 }
      );
    }

    const { phaseId, lessonVersionId } = phaseContext;

    const existingWithKey = await fetchQuery(apiAny.api.getStudentProgressByIdempotencyKey, {
      userId: userId,
      idempotencyKey,
    });

    if (existingWithKey) {
      if (existingWithKey.phaseId !== phaseId) {
        return NextResponse.json(
          {
            error: 'Idempotency key already used for a different phase',
            details: 'This idempotency key has been used for another completion',
          },
          { status: 409 }
        );
      }

      const nextPhaseExists = await fetchQuery(apiAny.api.checkNextPhaseExists, {
        lessonVersionId,
        phaseNumber,
      });

      return NextResponse.json({
        success: true,
        nextPhaseUnlocked: nextPhaseExists,
        message: 'Phase already completed (idempotent request)',
        phaseId,
        completedAt: existingWithKey.completedAt ? new Date(existingWithKey.completedAt).toISOString() : serverTimestamp,
      });
    }

    const existingProgress = await fetchQuery(apiAny.api.getStudentProgressByPhase, {
      userId: userId,
      phaseId,
    });

    if (existingProgress && existingProgress.idempotencyKey && existingProgress.idempotencyKey !== idempotencyKey) {
      const nextPhaseExists = await fetchQuery(apiAny.api.checkNextPhaseExists, {
        lessonVersionId,
        phaseNumber,
      });

      return NextResponse.json(
        {
          success: true,
          nextPhaseUnlocked: nextPhaseExists,
          message: `Phase ${phaseNumber} was already completed.`,
          phaseId,
          completedAt: existingProgress.completedAt ? new Date(existingProgress.completedAt).toISOString() : serverTimestamp,
        },
        { status: 200 }
      );
    }

    const result = await fetchMutation(apiAny.api.completePhaseMutation, {
      userId: userId,
      phaseId,
      timeSpent,
      idempotencyKey,
      linkedStandardId,
    });

    const nextPhaseUnlocked = await fetchQuery(apiAny.api.checkNextPhaseExists, {
      lessonVersionId,
      phaseNumber,
    });

    const response: CompletePhaseResponse = {
      success: true,
      nextPhaseUnlocked,
      message: nextPhaseUnlocked
        ? `Phase ${phaseNumber} completed. Phase ${phaseNumber + 1} unlocked.`
        : `Phase ${phaseNumber} completed. This was the final phase.`,
      phaseId,
      completedAt: result.completedAt ? new Date(result.completedAt).toISOString() : serverTimestamp,
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
