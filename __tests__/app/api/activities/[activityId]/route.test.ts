import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    api: {
      getProfile: 'internal.api.getProfile',
    },
    activities: {
      getActivityById: 'internal.activities.getActivityById',
    },
  },
}));

const { GET } = await import('../../../../../app/api/activities/[activityId]/route');

function buildContext(activityId: string) {
  return {
    params: Promise.resolve({ activityId }),
  };
}

function buildRequest(url: string) {
  return new Request(url) as NextRequest;
}

const fullActivity = {
  id: '7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b',
  componentKey: 'comprehension-quiz',
  props: {
    questions: [
      {
        id: 'q1',
        text: 'Choose one',
        correctAnswer: 'A',
      },
    ],
  },
  gradingConfig: {
    autoGrade: true,
    passingScore: 70,
  },
};

describe('GET /api/activities/[activityId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    mockFetchInternalQuery
      .mockResolvedValueOnce({ role: 'student' })
      .mockResolvedValueOnce(fullActivity);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      buildRequest('http://localhost/api/activities/7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
      buildContext('7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
    );

    expect(response.status).toBe(401);
  });

  it('redacts answer keys and grading internals for students', async () => {
    const response = await GET(
      buildRequest('http://localhost/api/activities/7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
      buildContext('7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(payload.gradingConfig).toBeNull();
    expect(payload.props.questions[0]).not.toHaveProperty('correctAnswer');
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(1, 'internal.api.getProfile', { userId: 'profile_123' });
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(2, 'internal.activities.getActivityById', {
      activityId: '7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b',
    });
  });
});
