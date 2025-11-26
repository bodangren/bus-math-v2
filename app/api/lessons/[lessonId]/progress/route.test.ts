import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
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

const { GET } = await import('./route');

function buildContext(lessonId: string) {
  return {
    params: Promise.resolve({ lessonId }),
  };
}

describe('GET /api/lessons/[lessonId]/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Setup default chain for lesson existence check
    const lessonData = {
      data: { id: 'b4b82cad-64f6-46cc-933a-5bb8299a23d4' },
      error: null,
    };
    mockSingle.mockReturnValue(lessonData);

    // Setup default chain for phases query
    const defaultData = {
      data: [
        {
          id: 'phase-1',
          phase_number: 1,
          title: 'Introduction',
          student_progress: [{ status: 'completed', started_at: '2024-01-01', completed_at: '2024-01-01', time_spent_seconds: 300 }],
        },
        {
          id: 'phase-2',
          phase_number: 2,
          title: 'Theory',
          student_progress: [{ status: 'in_progress', started_at: '2024-01-02', completed_at: null, time_spent_seconds: 150 }],
        },
        {
          id: 'phase-3',
          phase_number: 3,
          title: 'Practice',
          student_progress: [],
        },
        {
          id: 'phase-4',
          phase_number: 4,
          title: 'Application',
          student_progress: [],
        },
        {
          id: 'phase-5',
          phase_number: 5,
          title: 'Assessment',
          student_progress: [],
        },
        {
          id: 'phase-6',
          phase_number: 6,
          title: 'Reflection',
          student_progress: [],
        },
      ],
      error: null,
    };

    mockOrder.mockReturnValue(defaultData);

    // Second .eq() returns an object with .order()
    const secondEq = vi.fn().mockReturnValue({ order: mockOrder });

    // First .eq() returns an object with .eq()
    const lessonEq = vi.fn().mockReturnValue({ single: mockSingle });

    // Setup mock chain to handle both lesson and phases queries
    mockEq.mockImplementation((field: string) => {
      if (field === 'id') {
        return lessonEq(field);
      }
      return { eq: secondEq };
    });

    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it('returns 401 when no authenticated user is found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('validates the lessonId parameter and rejects invalid UUIDs', async () => {
    const response = await GET(
      new Request('http://localhost/api/lessons/not-a-uuid/progress'),
      buildContext('not-a-uuid'),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid parameters');
  });

  it('returns 404 when lesson does not exist', async () => {
    // Mock lesson not found
    mockSingle.mockReturnValue({ data: null, error: { message: 'Not found' } });

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Lesson not found');
  });

  it('returns 404 when lesson has no phases', async () => {
    const emptyData = { data: [], error: null };
    mockOrder.mockReturnValue(emptyData);

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toMatch(/lesson not found/i);
  });

  it('fetches phase progress for the authenticated user', async () => {
    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('phases');
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('student_progress'));
    // First .eq() is called with lesson_id
    expect(mockEq).toHaveBeenCalledWith('lesson_id', 'b4b82cad-64f6-46cc-933a-5bb8299a23d4');
    // The chain ensures the second .eq() is called via the secondEq mock
  });

  it('calculates correct phase statuses based on progress', async () => {
    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.phases).toHaveLength(6);

    // Phase 1: completed
    expect(json.phases[0]).toMatchObject({
      phaseNumber: 1,
      phaseId: 'phase-1',
      status: 'completed',
      startedAt: '2024-01-01',
      completedAt: '2024-01-01',
      timeSpentSeconds: 300,
    });

    // Phase 2: current (in_progress)
    expect(json.phases[1]).toMatchObject({
      phaseNumber: 2,
      phaseId: 'phase-2',
      status: 'current',
      startedAt: '2024-01-02',
      completedAt: null,
      timeSpentSeconds: 150,
    });

    // Phase 3: locked (previous phase not completed)
    expect(json.phases[2]).toMatchObject({
      phaseNumber: 3,
      phaseId: 'phase-3',
      status: 'locked',
      startedAt: null,
      completedAt: null,
      timeSpentSeconds: null,
    });

    // Phases 4-6: locked
    expect(json.phases[3].status).toBe('locked');
    expect(json.phases[4].status).toBe('locked');
    expect(json.phases[5].status).toBe('locked');
  });

  it('marks first phase as available when no progress exists', async () => {
    const noProgressData = {
      data: [
        { id: 'phase-1', phase_number: 1, title: 'Intro', student_progress: [] },
        { id: 'phase-2', phase_number: 2, title: 'Theory', student_progress: [] },
      ],
      error: null,
    };
    mockOrder.mockReturnValue(noProgressData);

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.phases[0].status).toBe('available');
    expect(json.phases[1].status).toBe('locked');
  });

  it('marks next phase as available when previous phase is completed', async () => {
    const progressData = {
      data: [
        { id: 'phase-1', phase_number: 1, title: 'Intro', student_progress: [{ status: 'completed' }] },
        { id: 'phase-2', phase_number: 2, title: 'Theory', student_progress: [] },
        { id: 'phase-3', phase_number: 3, title: 'Practice', student_progress: [] },
      ],
      error: null,
    };
    mockOrder.mockReturnValue(progressData);

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.phases[0].status).toBe('completed');
    expect(json.phases[1].status).toBe('available');
    expect(json.phases[2].status).toBe('locked');
  });

  it('propagates Supabase errors', async () => {
    const errorData = { data: null, error: { message: 'Database error' } };
    mockOrder.mockReturnValue(errorData);

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-123/progress'),
      buildContext('b4b82cad-64f6-46cc-933a-5bb8299a23d4'),
    );

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload.error).toMatch(/database error/i);
  });
});
