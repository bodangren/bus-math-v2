import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    }),
  ),
}));

const { GET } = await import('../../../../../../app/api/lessons/[lessonId]/progress/route');

function buildContext(lessonId: string) {
  return { params: Promise.resolve({ lessonId }) };
}

describe('GET /api/lessons/[lessonId]/progress', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: 'lesson-1' }, error: null }),
            }),
          }),
        };
      }

      if (table === 'lesson_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () =>
                  Promise.resolve({
                    data: [{ id: 'lv-1', version: 2, status: 'published' }],
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }

      if (table === 'phase_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [
                    { id: 'pv-1', phase_number: 1, title: 'Hook' },
                    { id: 'pv-2', phase_number: 2, title: 'Concept' },
                  ],
                  error: null,
                }),
            }),
          }),
        };
      }

      if (table === 'student_progress') {
        return {
          select: () => ({
            eq: () => ({
              in: () =>
                Promise.resolve({
                  data: [
                    {
                      phase_id: 'pv-1',
                      status: 'completed',
                      started_at: '2024-01-01',
                      completed_at: '2024-01-01',
                      time_spent_seconds: 120,
                      user_id: 'user-123',
                    },
                  ],
                  error: null,
                }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await GET(new Request('http://localhost'), buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'));
    expect(response.status).toBe(401);
  });

  it('returns 404 for unknown lesson identifier', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
              single: () => Promise.resolve({ data: null, error: { message: 'missing' } }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
            single: () => Promise.resolve({ data: null, error: { message: 'missing' } }),
          }),
        }),
      };
    });

    const response = await GET(new Request('http://localhost'), buildContext('not-a-uuid'));
    expect(response.status).toBe(404);
  });

  it('accepts lesson slug identifiers for progress lookup', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: () => ({
            eq: (field: string, value: unknown) => {
              if (field === 'slug' && value === 'unit-1-lesson-1-accounting-equation') {
                return {
                  maybeSingle: () =>
                    Promise.resolve({
                      data: { id: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4' },
                      error: null,
                    }),
                };
              }

              return {
                single: () =>
                  Promise.resolve({
                    data: { id: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4' },
                    error: null,
                  }),
              };
            },
          }),
        };
      }

      if (table === 'lesson_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () =>
                  Promise.resolve({
                    data: [{ id: 'lv-1', version: 2, status: 'published' }],
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }

      if (table === 'phase_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () =>
                Promise.resolve({
                  data: [{ id: 'pv-1', phase_number: 1, title: 'Hook' }],
                  error: null,
                }),
            }),
          }),
        };
      }

      if (table === 'student_progress') {
        return {
          select: () => ({
            eq: () => ({
              in: () =>
                Promise.resolve({
                  data: [],
                  error: null,
                }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    });

    const response = await GET(
      new Request('http://localhost'),
      buildContext('unit-1-lesson-1-accounting-equation'),
    );
    expect(response.status).toBe(200);
  });

  it('returns 404 when lesson is missing', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'missing' } }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      };
    });

    const response = await GET(new Request('http://localhost'), buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'));
    expect(response.status).toBe(404);
  });

  it('returns 404 when no versioned phases exist', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'lessons') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: 'lesson-1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'lesson_versions') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      };
    });

    const response = await GET(new Request('http://localhost'), buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'));
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toMatch(/versioned phases/i);
  });

  it('returns versioned phase progress', async () => {
    const response = await GET(new Request('http://localhost'), buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.phases).toHaveLength(2);
    expect(payload.phases[0]).toMatchObject({
      phaseId: 'pv-1',
      phaseNumber: 1,
      status: 'completed',
    });
    expect(payload.phases[1]).toMatchObject({
      phaseId: 'pv-2',
      phaseNumber: 2,
      status: 'available',
    });
  });
});
