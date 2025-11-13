import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockUpsert = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    }),
  ),
}));

const { createClient } = await import('@/lib/supabase/server');
const { POST } = await import('./route');

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/progress/phase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/progress/phase', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockUpsert.mockResolvedValue({ data: [{ id: 'progress-1' }], error: null });
    mockFrom.mockReturnValue({ upsert: mockUpsert });
  });

  it('returns 401 when no authenticated user is found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(buildRequest({
      phaseId: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4',
    }));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('validates the request payload and rejects invalid data', async () => {
    const response = await POST(buildRequest({ phaseId: 'not-a-uuid' }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid payload');
    expect(payload.details?.phaseId).toBeDefined();
  });

  it('upserts student progress for the authenticated user', async () => {
    const response = await POST(buildRequest({
      phaseId: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4',
      status: 'completed',
      timeSpentSeconds: 135,
    }));

    expect(response.status).toBe(200);
    expect(createClient).toHaveBeenCalled();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.progress).toMatchObject({
      phaseId: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4',
      status: 'completed',
    });

    expect(mockFrom).toHaveBeenCalledWith('student_progress');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        phase_id: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4',
        user_id: 'user-123',
        status: 'completed',
        completed_at: expect.any(String),
        started_at: expect.any(String),
        time_spent_seconds: 135,
      }),
      { onConflict: 'user_id,phase_id' },
    );
  });

  it('propagates Supabase errors', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'Upsert failed' } });

    const response = await POST(buildRequest({
      phaseId: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4',
    }));

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toMatch(/upsert failed/i);
  });
});
