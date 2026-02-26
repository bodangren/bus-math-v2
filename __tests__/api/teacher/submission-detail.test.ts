import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchQuery: mockFetchQuery,
  api: {
    teacher: {
      getProfileWithOrg: 'teacher.getProfileWithOrg',
      getSubmissionDetail: 'teacher.getSubmissionDetail',
    },
    activities: {
      getProfileById: 'activities.getProfileById',
    },
  },
}));

const { GET } = await import('@/app/api/teacher/submission-detail/route');

function buildRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/teacher/submission-detail');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

describe('GET /api/teacher/submission-detail', () => {
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
      buildRequest({
        studentId: 'student_profile_1',
        lessonId: 'lesson_1',
      }),
    );

    expect(response.status).toBe(401);
  });

  it('returns 400 when required query params are missing', async () => {
    const response = await GET(buildRequest({ studentId: 'student_profile_1' }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid parameters');
  });

  it('returns 403 when caller is not teacher/admin', async () => {
    mockFetchQuery.mockResolvedValueOnce({
      id: 'teacher_profile_1',
      role: 'student',
      organizationId: 'org_1',
    });

    const response = await GET(
      buildRequest({
        studentId: 'student_profile_1',
        lessonId: 'lesson_1',
      }),
    );

    expect(response.status).toBe(403);
  });

  it('returns 404 when student is not in teacher organization', async () => {
    mockFetchQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_profile_1',
        role: 'student',
        organizationId: 'org_2',
      });

    const response = await GET(
      buildRequest({
        studentId: 'student_profile_1',
        lessonId: 'lesson_1',
      }),
    );

    expect(response.status).toBe(404);
  });

  it('returns submission detail for same-org student', async () => {
    mockFetchQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_profile_1',
        role: 'student',
        organizationId: 'org_1',
        displayName: 'Alice',
        username: 'alice',
      })
      .mockResolvedValueOnce({
        studentName: 'Alice',
        lessonTitle: 'Lesson 1',
        phases: [],
      });

    const response = await GET(
      buildRequest({
        studentId: 'student_profile_1',
        lessonId: 'lesson_1',
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.lessonTitle).toBe('Lesson 1');
    expect(mockFetchQuery).toHaveBeenLastCalledWith('teacher.getSubmissionDetail', {
      studentId: 'student_profile_1',
      lessonId: 'lesson_1',
      studentName: 'Alice',
    });
  });
});
