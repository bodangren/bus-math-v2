import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      rpc: mockRpc,
      from: mockFrom,
    }),
  ),
}));

const { POST } = await import('../../../../../app/api/phases/complete/route');

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/phases/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  lessonId: '123e4567-e89b-12d3-a456-426614174000',
  phaseNumber: 2,
  timeSpent: 120,
  idempotencyKey: '987e6543-e21b-12d3-a456-426614174000',
};

describe('POST /api/phases/complete', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockRpc.mockResolvedValue({ data: true, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'lesson_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () =>
                  Promise.resolve({ data: [{ id: 'lv-1', version: 1, status: 'published' }], error: null }),
              }),
            }),
          }),
        };
      }

      if (table === 'phase_versions') {
        return {
          select: () => ({
            eq: (_field: string, value: unknown) => {
              if (value === 'lv-1') {
                return {
                  eq: (_field2: string, phaseNumber: unknown) => ({
                    maybeSingle: () =>
                      Promise.resolve({
                        data: Number(phaseNumber) === 2 ? { id: 'pv-2' } : { id: 'pv-3' },
                        error: null,
                      }),
                  }),
                };
              }
              return {
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
              };
            },
          }),
        };
      }

      if (table === 'student_progress') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
              }),
            }),
          }),
          upsert: () => Promise.resolve({ error: null }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await POST(buildRequest(validPayload));
    expect(response.status).toBe(401);
  });

  it('returns 403 when access RPC denies phase', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    const response = await POST(buildRequest(validPayload));
    expect(response.status).toBe(403);
  });

  it('returns 404 when versioned phase does not exist', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lesson_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [{ id: 'lv-1', version: 1, status: 'published' }], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'phase_versions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
        upsert: () => Promise.resolve({ error: null }),
      };
    });

    const response = await POST(buildRequest(validPayload));
    expect(response.status).toBe(404);
  });

  it('completes versioned phase successfully', async () => {
    const response = await POST(buildRequest(validPayload));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.phaseId).toBe('pv-2');
    expect(mockFrom).toHaveBeenCalledWith('phase_versions');
  });

  it('enforces idempotency conflict across phases', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lesson_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [{ id: 'lv-1', version: 1, status: 'published' }], error: null }),
              }),
            }),
          }),
        };
      }

      if (table === 'phase_versions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: { id: 'pv-2' }, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === 'student_progress') {
        let call = 0;
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => {
                  call += 1;
                  if (call === 1) {
                    return Promise.resolve({
                      data: { id: 'sp-1', phase_id: 'pv-99', completed_at: '2024-01-01T00:00:00.000Z' },
                      error: null,
                    });
                  }
                  return Promise.resolve({ data: null, error: null });
                },
              }),
            }),
          }),
          upsert: () => Promise.resolve({ error: null }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    });

    const response = await POST(buildRequest(validPayload));
    expect(response.status).toBe(409);
  });
});
