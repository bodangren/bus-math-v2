import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { POST as completePhasePOST } from '@/app/api/phases/complete/route';
import type {
  CompleteActivityRequest,
  CompleteActivityResponse,
  CompletePhaseRequest,
  CompletePhaseResponse,
} from '@/types/api';

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

type CompleteActivityPayload = z.infer<typeof CompleteActivitySchema> &
  CompleteActivityRequest;

const REPLACEMENT_ENDPOINT = '/api/phases/complete';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function deprecationHeaders(): HeadersInit {
  return {
    Deprecation: 'true',
    Link: `<${REPLACEMENT_ENDPOINT}>; rel="successor-version"`,
    'X-Replacement-Endpoint': REPLACEMENT_ENDPOINT,
  };
}

function deriveTimeSpent(
  completionData: CompleteActivityPayload['completionData'],
): number {
  if (!isRecord(completionData)) {
    return 0;
  }

  const rawTimeSpent = completionData.timeSpent ?? completionData.timeSpentSeconds;
  if (typeof rawTimeSpent !== 'number' || !Number.isFinite(rawTimeSpent) || rawTimeSpent < 0) {
    return 0;
  }

  return Math.min(86400, Math.floor(rawTimeSpent));
}

/**
 * POST /api/activities/complete
 *
 * Compatibility shim for legacy activity completion clients.
 * Canonical phase completion now lives at /api/phases/complete.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: 'Malformed JSON body',
          replacement: REPLACEMENT_ENDPOINT,
          deprecated: true,
        },
        { status: 400, headers: deprecationHeaders() },
      );
    }

    const validationResult = CompleteActivitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten().fieldErrors,
          replacement: REPLACEMENT_ENDPOINT,
          deprecated: true,
        },
        { status: 400, headers: deprecationHeaders() }
      );
    }

    const {
      lessonId,
      phaseNumber,
      completionData,
      idempotencyKey,
    }: CompleteActivityPayload = validationResult.data;

    const phasePayload: CompletePhaseRequest = {
      lessonId,
      phaseNumber,
      timeSpent: deriveTimeSpent(completionData),
      idempotencyKey,
    };

    const phaseRequest = new Request(new URL(REPLACEMENT_ENDPOINT, request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phasePayload),
    });

    const phaseResponse = await completePhasePOST(phaseRequest);

    let phaseResult: unknown = null;
    try {
      phaseResult = await phaseResponse.json();
    } catch {
      phaseResult = null;
    }

    if (!phaseResponse.ok) {
      const errorPayload = isRecord(phaseResult) ? phaseResult : {};
      const errorMessage =
        typeof errorPayload.message === 'string'
          ? errorPayload.message
          : `Use POST ${REPLACEMENT_ENDPOINT}.`;

      return NextResponse.json(
        {
          error:
            typeof errorPayload.error === 'string'
              ? errorPayload.error
              : 'Activity completion failed',
          message: errorMessage,
          details: errorPayload.details,
          replacement: REPLACEMENT_ENDPOINT,
          deprecated: true,
        },
        { status: phaseResponse.status, headers: deprecationHeaders() },
      );
    }

    const successPayload = isRecord(phaseResult)
      ? (phaseResult as unknown as CompletePhaseResponse)
      : null;

    const compatibilityResponse: CompleteActivityResponse & {
      replacement: string;
      deprecated: true;
    } = {
      success: Boolean(successPayload?.success),
      nextPhaseUnlocked: Boolean(successPayload?.nextPhaseUnlocked),
      message:
        typeof successPayload?.message === 'string'
          ? successPayload.message
          : 'Phase completion recorded.',
      completionId:
        typeof successPayload?.phaseId === 'string'
          ? successPayload.phaseId
          : undefined,
      completedAt:
        typeof successPayload?.completedAt === 'string'
          ? successPayload.completedAt
          : undefined,
      replacement: REPLACEMENT_ENDPOINT,
      deprecated: true,
    };

    return NextResponse.json(compatibilityResponse, {
      status: phaseResponse.status,
      headers: deprecationHeaders(),
    });
  } catch (error) {
    console.error('Unexpected error in /api/activities/complete:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        replacement: REPLACEMENT_ENDPOINT,
        deprecated: true,
      },
      { status: 500, headers: deprecationHeaders() }
    );
  }
}
