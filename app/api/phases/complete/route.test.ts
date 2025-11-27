import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      rpc: mockRpc,
      from: mockFrom,
    })
  ),
}));

const { POST } = await import('./route');

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/phases/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/phases/complete', () => {
  const validPayload = {
    lessonId: '123e4567-e89b-12d3-a456-426614174000',
    phaseNumber: 2,
    timeSpent: 120,
    idempotencyKey: '987e6543-e21b-12d3-a456-426614174000',
    // Note: completedAt removed - server uses its own timestamp
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Default: user can access phase
    mockRpc.mockResolvedValue({ data: true, error: null });

    // Default: phase exists
    mockSingle.mockResolvedValue({
      data: { id: 'phase-456' },
      error: null,
    });

    // Default: no existing completion with this idempotency key
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    // Default: successful upsert
    mockUpsert.mockResolvedValue({ error: null });

    // Setup chain for phase lookup
    mockEq.mockReturnThis();
    mockSelect.mockReturnThis();
    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
    });
  });

  describe('authentication', () => {
    it('returns 401 when no authenticated user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toMatch(/unauthorized/i);
    });

    it('returns 401 when auth error occurs', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toMatch(/unauthorized/i);
    });
  });

  describe('validation', () => {
    it('validates lessonId is a UUID', async () => {
      const response = await POST(
        buildRequest({ ...validPayload, lessonId: 'not-a-uuid' })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
      expect(body.details?.lessonId).toBeDefined();
    });

    it('validates phaseNumber is a positive integer', async () => {
      const response = await POST(
        buildRequest({ ...validPayload, phaseNumber: -1 })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
      expect(body.details?.phaseNumber).toBeDefined();
    });

    it('validates timeSpent is non-negative', async () => {
      const response = await POST(
        buildRequest({ ...validPayload, timeSpent: -10 })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
      expect(body.details?.timeSpent).toBeDefined();
    });

    it('validates idempotencyKey is a UUID', async () => {
      const response = await POST(
        buildRequest({ ...validPayload, idempotencyKey: 'not-a-uuid' })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
      expect(body.details?.idempotencyKey).toBeDefined();
    });

    it('validates timeSpent does not exceed 24 hours (86400 seconds)', async () => {
      const response = await POST(
        buildRequest({ ...validPayload, timeSpent: 90000 })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
      expect(body.details?.timeSpent).toBeDefined();
    });

    it('rejects missing required fields', async () => {
      const response = await POST(buildRequest({}));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
    });
  });

  describe('phase access control', () => {
    it('returns 403 when user cannot access phase', async () => {
      mockRpc.mockResolvedValue({ data: false, error: null });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/previous phase must be completed/i);
    });

    it('calls can_access_phase RPC with correct parameters', async () => {
      await POST(buildRequest(validPayload));

      expect(mockRpc).toHaveBeenCalledWith('can_access_phase', {
        p_lesson_id: validPayload.lessonId,
        p_phase_number: validPayload.phaseNumber,
      });
    });

    it('returns 500 when can_access_phase RPC fails', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC error' },
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toMatch(/failed to verify phase access/i);
    });
  });

  describe('phase lookup', () => {
    it('returns 404 when phase does not exist', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Phase not found' },
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toMatch(/phase not found/i);
    });

    it('queries phase with correct lesson_id and phase_number', async () => {
      await POST(buildRequest(validPayload));

      expect(mockFrom).toHaveBeenCalledWith('phases');
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('lesson_id', validPayload.lessonId);
      expect(mockEq).toHaveBeenCalledWith('phase_number', validPayload.phaseNumber);
    });
  });

  describe('idempotency', () => {
    it('returns existing result when idempotency key already used for same phase', async () => {
      const existingCompletion = {
        id: 'existing-123',
        phase_id: 'phase-456',
        completed_at: '2024-11-27T09:00:00.000Z',
      };

      // First check: idempotency key exists for this phase
      mockMaybeSingle.mockResolvedValueOnce({
        data: existingCompletion,
        error: null,
      });

      // Mock next phase check
      mockMaybeSingle.mockResolvedValueOnce({
        data: { id: 'next-phase-789' },
        error: null,
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.message).toMatch(/already completed/i);
      expect(body.completedAt).toBe(existingCompletion.completed_at);
      expect(body.nextPhaseUnlocked).toBe(true);

      // Should not upsert when idempotency key matches
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('returns 409 when idempotency key used for different phase', async () => {
      const existingCompletion = {
        id: 'existing-123',
        phase_id: 'different-phase-789', // Different phase!
        completed_at: '2024-11-27T09:00:00.000Z',
      };

      // First check: idempotency key exists but for different phase
      mockMaybeSingle.mockResolvedValueOnce({
        data: existingCompletion,
        error: null,
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.error).toMatch(/already used for a different phase/i);

      // Should not proceed to upsert
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('returns 409 when phase already completed with different idempotency key', async () => {
      // First check: idempotency key not found
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second check: phase already has progress with different key
      mockMaybeSingle.mockResolvedValueOnce({
        data: {
          id: 'existing-123',
          idempotency_key: 'different-key-999',
          completed_at: '2024-11-27T09:00:00.000Z',
        },
        error: null,
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.error).toMatch(/already completed/i);

      // Should not upsert when phase already completed with different key
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('checks for existing completion with correct parameters', async () => {
      // First check: idempotency key lookup
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second check: existing progress lookup
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Third check: next phase
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await POST(buildRequest(validPayload));

      expect(mockFrom).toHaveBeenCalledWith('student_progress');
      expect(mockSelect).toHaveBeenCalledWith('id, phase_id, completed_at');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq).toHaveBeenCalledWith('idempotency_key', validPayload.idempotencyKey);
    });
  });

  describe('progress upsert', () => {
    it('upserts student progress with server timestamp', async () => {
      // First check: no existing idempotency key
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second check: no existing progress
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const beforeRequest = new Date().toISOString();
      await POST(buildRequest(validPayload));
      const afterRequest = new Date().toISOString();

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          phase_id: 'phase-456',
          status: 'completed',
          time_spent_seconds: validPayload.timeSpent,
          idempotency_key: validPayload.idempotencyKey,
        }),
        { onConflict: 'user_id,phase_id' }
      );

      // Verify server timestamp is used (compare as Date objects)
      const upsertCall = mockUpsert.mock.calls[0][0];
      const completedAtDate = new Date(upsertCall.completed_at).getTime();
      const updatedAtDate = new Date(upsertCall.updated_at).getTime();
      const beforeDate = new Date(beforeRequest).getTime();
      const afterDate = new Date(afterRequest).getTime();

      expect(completedAtDate).toBeGreaterThanOrEqual(beforeDate);
      expect(completedAtDate).toBeLessThanOrEqual(afterDate);
      expect(updatedAtDate).toBeGreaterThanOrEqual(beforeDate);
      expect(updatedAtDate).toBeLessThanOrEqual(afterDate);
    });

    it('returns 500 when upsert fails', async () => {
      mockUpsert.mockResolvedValue({
        error: { message: 'Upsert failed' },
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toMatch(/failed to save phase completion/i);
    });
  });

  describe('next phase unlock detection', () => {
    it('returns nextPhaseUnlocked=true when next phase exists', async () => {
      // First: no existing idempotency key
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second: no existing progress
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Third: next phase exists
      mockMaybeSingle.mockResolvedValueOnce({
        data: { id: 'next-phase-789', phase_number: 3 },
        error: null,
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.nextPhaseUnlocked).toBe(true);
      expect(body.message).toMatch(/phase 3 unlocked/i);
    });

    it('returns nextPhaseUnlocked=false when no next phase', async () => {
      // First: no existing idempotency key
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second: no existing progress
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Third: no next phase
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.nextPhaseUnlocked).toBe(false);
      expect(body.message).toMatch(/final phase/i);
    });

    it('queries next phase with correct parameters', async () => {
      // First maybeSingle: no existing completion
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second maybeSingle: next phase check
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await POST(buildRequest(validPayload));

      // Verify next phase query
      expect(mockEq).toHaveBeenCalledWith('lesson_id', validPayload.lessonId);
      expect(mockEq).toHaveBeenCalledWith('phase_number', validPayload.phaseNumber + 1);
    });

    it('handles errors when checking next phase gracefully', async () => {
      // First: no existing idempotency key
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second: no existing progress
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Third: error checking next phase (should be gracefully handled)
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Query error' },
      });

      const response = await POST(buildRequest(validPayload));

      // Should still succeed even if next phase check fails
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });
  });

  describe('response format', () => {
    it('returns success response with server timestamp', async () => {
      // First: no existing idempotency key
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // Second: no existing progress
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // Third: next phase exists
      mockMaybeSingle.mockResolvedValueOnce({
        data: { id: 'next-phase-789' },
        error: null,
      });

      const beforeRequest = new Date().toISOString();
      const response = await POST(buildRequest(validPayload));
      const afterRequest = new Date().toISOString();

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body).toMatchObject({
        success: true,
        nextPhaseUnlocked: true,
        message: expect.any(String),
        phaseId: 'phase-456',
      });

      // Verify server timestamp is returned (compare as Date objects)
      const completedAtDate = new Date(body.completedAt).getTime();
      const beforeDate = new Date(beforeRequest).getTime();
      const afterDate = new Date(afterRequest).getTime();

      expect(completedAtDate).toBeGreaterThanOrEqual(beforeDate);
      expect(completedAtDate).toBeLessThanOrEqual(afterDate);
    });
  });

  describe('error handling', () => {
    it('handles unexpected errors', async () => {
      mockGetUser.mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toMatch(/internal server error/i);
    });

    it('returns 400 for malformed JSON', async () => {
      const malformedRequest = new Request('http://localhost/api/phases/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not valid json{',
      });

      const response = await POST(malformedRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toMatch(/invalid json/i);
    });
  });

  describe('sequential phase completion', () => {
    it('allows completing phase 1 without checking previous phase', async () => {
      const phase1Payload = { ...validPayload, phaseNumber: 1 };

      await POST(buildRequest(phase1Payload));

      expect(mockRpc).toHaveBeenCalledWith('can_access_phase', {
        p_lesson_id: phase1Payload.lessonId,
        p_phase_number: 1,
      });
    });

    it('enforces sequential completion for phase 2+', async () => {
      mockRpc.mockResolvedValue({ data: false, error: null });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toMatch(/previous phase must be completed/i);
    });
  });
});
