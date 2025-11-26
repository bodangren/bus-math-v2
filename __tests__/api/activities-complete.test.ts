import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/activities/complete/route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockRpc = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    rpc: mockRpc,
  })),
}));

describe('POST /api/activities/complete', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockGetUser.mockReset();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: '123e4567-e89b-12d3-a456-426614174000',
        lessonId: '123e4567-e89b-12d3-a456-426614174001',
        phaseNumber: 1,
        idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized. Please sign in to complete activities.');
  });

  it('should return 400 if request data is invalid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: 'invalid-uuid',
        lessonId: '123e4567-e89b-12d3-a456-426614174001',
        phaseNumber: 1,
        idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should successfully complete an activity', async () => {
    const mockUser = { id: 'user-123' };
    const mockRpcResult = {
      success: true,
      nextPhaseUnlocked: true,
      message: 'Activity completed successfully',
      completionId: 'completion-123',
      completedAt: '2025-11-26T10:00:00Z',
      completedPhases: 1,
      totalPhases: 6,
    };

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: mockRpcResult,
      error: null,
    });

    const requestBody = {
      activityId: '123e4567-e89b-12d3-a456-426614174000',
      lessonId: '123e4567-e89b-12d3-a456-426614174001',
      phaseNumber: 1,
      linkedStandardId: '123e4567-e89b-12d3-a456-426614174003',
      completionData: { score: 100 },
      idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
    };

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.nextPhaseUnlocked).toBe(true);
    expect(data.message).toBe('Activity completed successfully');
    expect(data.completionId).toBe('completion-123');

    expect(mockRpc).toHaveBeenCalledWith('complete_activity_atomic', {
      p_activity_id: requestBody.activityId,
      p_lesson_id: requestBody.lessonId,
      p_phase_number: requestBody.phaseNumber,
      p_linked_standard_id: requestBody.linkedStandardId,
      p_completion_data: requestBody.completionData,
      p_idempotency_key: requestBody.idempotencyKey,
    });
  });

  it('should handle idempotent requests correctly', async () => {
    const mockUser = { id: 'user-123' };
    const mockRpcResult = {
      success: true,
      nextPhaseUnlocked: false,
      message: 'Activity already completed (idempotent)',
      completionId: 'completion-123',
      completedAt: '2025-11-26T09:00:00Z',
    };

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: mockRpcResult,
      error: null,
    });

    const requestBody = {
      activityId: '123e4567-e89b-12d3-a456-426614174000',
      lessonId: '123e4567-e89b-12d3-a456-426614174001',
      phaseNumber: 1,
      idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
    };

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('idempotent');
  });

  it('should return 500 if RPC call fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: '123e4567-e89b-12d3-a456-426614174000',
        lessonId: '123e4567-e89b-12d3-a456-426614174001',
        phaseNumber: 1,
        idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to complete activity');
  });

  it('should handle RPC function errors gracefully', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: {
        success: false,
        message: 'Invalid activity ID',
        errorCode: '23503',
      },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: '123e4567-e89b-12d3-a456-426614174000',
        lessonId: '123e4567-e89b-12d3-a456-426614174001',
        phaseNumber: 1,
        idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Activity completion failed');
    expect(data.message).toBe('Invalid activity ID');
  });

  it('should handle null linkedStandardId correctly', async () => {
    const mockUser = { id: 'user-123' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockRpc.mockResolvedValue({
      data: {
        success: true,
        nextPhaseUnlocked: false,
        message: 'Activity completed successfully',
      },
      error: null,
    });

    const requestBody = {
      activityId: '123e4567-e89b-12d3-a456-426614174000',
      lessonId: '123e4567-e89b-12d3-a456-426614174001',
      phaseNumber: 1,
      linkedStandardId: null,
      idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
    };

    const request = new NextRequest('http://localhost:3000/api/activities/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('complete_activity_atomic', {
      p_activity_id: requestBody.activityId,
      p_lesson_id: requestBody.lessonId,
      p_phase_number: requestBody.phaseNumber,
      p_linked_standard_id: null,
      p_completion_data: null,
      p_idempotency_key: requestBody.idempotencyKey,
    });
  });
});
