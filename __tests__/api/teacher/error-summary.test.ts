import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    teacher: {
      getProfileWithOrg: 'internal.teacher.getProfileWithOrg',
      getLessonErrorSummary: 'internal.teacher.getLessonErrorSummary',
    },
    activities: {
      getProfileById: 'internal.activities.getProfileById',
    },
  },
}));

const { GET } = await import('@/app/api/teacher/error-summary/route');

function buildRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/teacher/error-summary');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

describe('GET /api/teacher/error-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
  });

  it('returns 401 when the requester is unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1' }),
    );

    expect(response.status).toBe(401);
  });

  it('returns 400 when lessonId is missing', async () => {
    const response = await GET(buildRequest({}));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid parameters');
  });

  it('returns 403 when caller is not teacher/admin', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce({
      id: 'teacher_profile_1',
      role: 'student',
      organizationId: 'org_1',
    });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1' }),
    );

    expect(response.status).toBe(403);
  });

  it('returns deterministic error summary for a lesson', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        type: 'deterministic',
        lessonId: 'lesson_1',
        generatedAt: 1700000000000,
        partSummaries: [
          {
            partId: 'q1',
            totalAttempts: 3,
            correctCount: 2,
            incorrectCount: 1,
            accuracyRate: 2 / 3,
            commonMisconceptions: [],
          },
        ],
        topMisconceptions: [
          {
            tag: 'debit-credit-confusion',
            count: 2,
            affectedParts: ['q1', 'q2'],
            affectedStudents: ['student_1', 'student_2'],
          },
        ],
        studentCount: 3,
        averageAccuracy: 0.67,
      });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1' }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.type).toBe('deterministic');
    expect(payload.lessonId).toBe('lesson_1');
    expect(payload.studentCount).toBe(3);
    expect(payload.topMisconceptions).toHaveLength(1);
    expect(payload.topMisconceptions[0].tag).toBe('debit-credit-confusion');
  });

  it('returns null when lesson has no practice submissions', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1' }),
    );

    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toBe('No practice submissions found for this lesson');
  });
});
