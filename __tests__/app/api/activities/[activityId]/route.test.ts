import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchQuery = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchQuery: mockFetchQuery,
  api: {
    api: {
      getProfile: 'api.getProfile',
      getActivity: 'api.getActivity',
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

    mockFetchQuery
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
    expect(mockFetchQuery).toHaveBeenNthCalledWith(1, 'api.getProfile', { userId: 'profile_123' });
  });
});
