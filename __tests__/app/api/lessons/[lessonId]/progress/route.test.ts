import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    student: {
      getLessonProgress: 'internal.student.getLessonProgress',
    },
  },
}));

const { GET } = await import('../../../../../../app/api/lessons/[lessonId]/progress/route');

function buildContext(lessonId: string) {
  return { params: Promise.resolve({ lessonId }) };
}

describe('GET /api/lessons/[lessonId]/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/lessons/lesson-1/progress'),
      buildContext('lesson-1'),
    );

    expect(response.status).toBe(401);
  });

  it('returns 400 when params are invalid', async () => {
    const response = await GET(
      new Request('http://localhost/api/lessons/%20/progress'),
      buildContext(''),
    );

    expect(response.status).toBe(400);
  });

  it('returns 404 when lesson progress is missing', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/lessons/unit-1-lesson-1/progress'),
      buildContext('unit-1-lesson-1'),
    );

    expect(response.status).toBe(404);
  });

  it('returns lesson phase progress from Convex', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      phases: [
        { phaseNumber: 1, status: 'completed' },
        { phaseNumber: 2, status: 'in_progress' },
      ],
    });

    const response = await GET(
      new Request('http://localhost/api/lessons/unit-1-lesson-1/progress'),
      buildContext('unit-1-lesson-1'),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.phases).toHaveLength(2);
    expect(mockFetchInternalQuery).toHaveBeenCalledWith('internal.student.getLessonProgress', {
      userId: 'profile_123',
      lessonIdentifier: 'unit-1-lesson-1',
    });
  });
});
