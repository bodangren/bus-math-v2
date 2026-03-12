import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockCompletePhasePost = vi.fn();

vi.mock('@/app/api/phases/complete/route', () => ({
  POST: (request: Request) => mockCompletePhasePost(request),
}));

const { POST } = await import('@/app/api/activities/complete/route');

const VALID_ACTIVITY_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_LESSON_ID = '123e4567-e89b-12d3-a456-426614174001';
const VALID_IDEMPOTENCY_KEY = '123e4567-e89b-12d3-a456-426614174002';

describe('POST /api/activities/complete', () => {
  beforeEach(() => {
    mockCompletePhasePost.mockReset();
  });

  it('returns 400 for invalid request payloads and does not forward', async () => {
    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: 'invalid-uuid',
        lessonId: VALID_LESSON_ID,
        phaseNumber: 1,
        idempotencyKey: VALID_IDEMPOTENCY_KEY,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.deprecated).toBe(true);
    expect(data.replacement).toBe('/api/phases/complete');
    expect(mockCompletePhasePost).not.toHaveBeenCalled();
  });

  it('forwards valid requests to /api/phases/complete and maps success response', async () => {
    mockCompletePhasePost.mockResolvedValueOnce(
      Response.json(
        {
          success: true,
          nextPhaseUnlocked: true,
          message: 'Phase completion recorded',
          phaseId: 'phase-version-id',
          completedAt: '2026-02-09T08:00:00.000Z',
        },
        { status: 200 },
      ),
    );

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: VALID_ACTIVITY_ID,
        lessonId: VALID_LESSON_ID,
        phaseNumber: 2,
        completionData: { timeSpent: 48, score: 100 },
        idempotencyKey: VALID_IDEMPOTENCY_KEY,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.nextPhaseUnlocked).toBe(true);
    expect(data.message).toBe('Phase completion recorded');
    expect(data.completionId).toBe('phase-version-id');
    expect(data.deprecated).toBe(true);
    expect(data.replacement).toBe('/api/phases/complete');
    expect(response.headers.get('deprecation')).toBe('true');
    expect(response.headers.get('x-replacement-endpoint')).toBe('/api/phases/complete');

    expect(mockCompletePhasePost).toHaveBeenCalledTimes(1);
    const forwardedRequest = mockCompletePhasePost.mock.calls[0][0] as Request;
    const forwardedPayload = await forwardedRequest.json();
    expect(forwardedPayload).toEqual({
      lessonId: VALID_LESSON_ID,
      phaseNumber: 2,
      timeSpent: 48,
      idempotencyKey: VALID_IDEMPOTENCY_KEY,
    });
  });

  it('accepts linked standard competency codes and forwards them unchanged', async () => {
    mockCompletePhasePost.mockResolvedValueOnce(
      Response.json(
        {
          success: true,
          nextPhaseUnlocked: false,
          message: 'Phase completion recorded',
        },
        { status: 200 },
      ),
    );

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: VALID_ACTIVITY_ID,
        lessonId: VALID_LESSON_ID,
        phaseNumber: 2,
        linkedStandardId: 'ACC-1.1',
        completionData: { timeSpentSeconds: 90 },
        idempotencyKey: VALID_IDEMPOTENCY_KEY,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const forwardedRequest = mockCompletePhasePost.mock.calls[0][0] as Request;
    const forwardedPayload = await forwardedRequest.json();
    expect(forwardedPayload).toEqual({
      lessonId: VALID_LESSON_ID,
      phaseNumber: 2,
      timeSpent: 90,
      linkedStandardId: 'ACC-1.1',
      idempotencyKey: VALID_IDEMPOTENCY_KEY,
    });
  });

  it('defaults forwarded timeSpent to 0 when completionData is missing or invalid', async () => {
    mockCompletePhasePost.mockResolvedValueOnce(
      Response.json({
        success: true,
        nextPhaseUnlocked: false,
        message: 'Phase already completed (idempotent request)',
      }),
    );

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: VALID_ACTIVITY_ID,
        lessonId: VALID_LESSON_ID,
        phaseNumber: 1,
        completionData: { timeSpent: -20 },
        idempotencyKey: VALID_IDEMPOTENCY_KEY,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const forwardedRequest = mockCompletePhasePost.mock.calls[0][0] as Request;
    const forwardedPayload = await forwardedRequest.json();
    expect(forwardedPayload).toMatchObject({
      lessonId: VALID_LESSON_ID,
      phaseNumber: 1,
      timeSpent: 0,
      idempotencyKey: VALID_IDEMPOTENCY_KEY,
    });
  });

  it('passes through canonical endpoint errors with compatibility metadata', async () => {
    mockCompletePhasePost.mockResolvedValueOnce(
      Response.json(
        {
          error: 'Phase already completed',
          details: 'This phase has already been completed.',
        },
        { status: 409 },
      ),
    );

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: VALID_ACTIVITY_ID,
        lessonId: VALID_LESSON_ID,
        phaseNumber: 1,
        idempotencyKey: VALID_IDEMPOTENCY_KEY,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Phase already completed');
    expect(data.message).toBe('Use POST /api/phases/complete.');
    expect(data.replacement).toBe('/api/phases/complete');
    expect(data.deprecated).toBe(true);
    expect(data.details).toBe('This phase has already been completed.');
    expect(response.headers.get('deprecation')).toBe('true');
  });

  it('maps canonical unauthorized responses for legacy clients', async () => {
    mockCompletePhasePost.mockResolvedValueOnce(
      Response.json(
        {
          error: 'Unauthorized. Please sign in to complete phases.',
        },
        { status: 401 },
      ),
    );

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: VALID_ACTIVITY_ID,
        lessonId: VALID_LESSON_ID,
        phaseNumber: 1,
        idempotencyKey: VALID_IDEMPOTENCY_KEY,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized. Please sign in to complete phases.');
    expect(data.replacement).toBe('/api/phases/complete');
    expect(data.deprecated).toBe(true);
  });
});
