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
    completedAt: '2024-11-27T10:00:00.000Z',
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

    it('validates completedAt is an ISO datetime', async () => {
      const response = await POST(
        buildRequest({ ...validPayload, completedAt: 'invalid-date' })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid request data');
      expect(body.details?.completedAt).toBeDefined();
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
    it('returns existing result when idempotency key already used', async () => {
      const existingCompletion = {
        id: 'existing-123',
        completed_at: '2024-11-27T09:00:00.000Z',
        idempotency_key: validPayload.idempotencyKey,
      };

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

    it('checks for existing completion with correct parameters', async () => {
      await POST(buildRequest(validPayload));

      expect(mockFrom).toHaveBeenCalledWith('student_progress');
      expect(mockSelect).toHaveBeenCalledWith('id, completed_at, idempotency_key');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq).toHaveBeenCalledWith('phase_id', 'phase-456');
      expect(mockEq).toHaveBeenCalledWith('idempotency_key', validPayload.idempotencyKey);
    });
  });

  describe('progress upsert', () => {
    it('upserts student progress with correct data', async () => {
      await POST(buildRequest(validPayload));

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          phase_id: 'phase-456',
          status: 'completed',
          started_at: validPayload.completedAt,
          completed_at: validPayload.completedAt,
          time_spent_seconds: validPayload.timeSpent,
          idempotency_key: validPayload.idempotencyKey,
          updated_at: expect.any(String),
        }),
        { onConflict: 'user_id,phase_id' }
      );
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
      // First maybeSingle: no existing completion
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second maybeSingle: next phase exists
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
      // First maybeSingle: no existing completion
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second maybeSingle: no next phase
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
      // First maybeSingle: no existing completion
      mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Second maybeSingle: error checking next phase
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
    it('returns success response with all required fields', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
      mockMaybeSingle.mockResolvedValueOnce({
        data: { id: 'next-phase-789' },
        error: null,
      });

      const response = await POST(buildRequest(validPayload));

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body).toMatchObject({
        success: true,
        nextPhaseUnlocked: true,
        message: expect.any(String),
        phaseId: 'phase-456',
        completedAt: validPayload.completedAt,
      });
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

    it('handles malformed JSON', async () => {
      const malformedRequest = new Request('http://localhost/api/phases/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not valid json',
      });

      const response = await POST(malformedRequest);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBeDefined();
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
