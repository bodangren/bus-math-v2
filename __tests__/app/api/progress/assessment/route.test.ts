import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    activities: {
      getActivityById: 'internal.activities.getActivityById',
      submitAssessment: 'internal.activities.submitAssessment',
    },
  },
}));

const { POST } = await import('../../../../../app/api/progress/assessment/route');

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/progress/assessment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

const baseActivity = {
  id: '7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b',
  componentKey: 'comprehension-quiz',
  displayName: 'Quick Check',
  description: 'Assess understanding',
  props: {
    title: 'Knowledge Check',
    description: 'Two question quiz',
    showExplanations: false,
    allowRetry: true,
    questions: [
      {
        id: 'q1',
        text: 'Choose the correct option',
        type: 'multiple-choice',
        options: ['Yes', 'No'],
        correctAnswer: 'Yes',
      },
      {
        id: 'q2',
        text: 'Type the matching word',
        type: 'short-answer',
        correctAnswer: 'Ledger',
      },
    ],
  },
  gradingConfig: {
    autoGrade: true,
    passingScore: 70,
    partialCredit: false,
  },
  standardId: '12345678-1234-1234-8234-123456789012',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('POST /api/progress/assessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    mockFetchInternalQuery.mockResolvedValue(baseActivity);
    mockFetchInternalMutation.mockResolvedValue(undefined);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toMatch(/unauthorized/i);
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('validates the incoming payload schema', async () => {
    const response = await POST(buildRequest({ answers: { q1: 'Yes' } }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid payload');
  });

  it('rejects empty answer sets', async () => {
    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: {},
      }),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toMatch(/at least one entry/i);
  });

  it('returns 404 when the activity cannot be found', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toMatch(/not found/i);
  });

  it('scores and persists submission with claims-based user id', async () => {
    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: {
          q1: 'Yes',
          q2: 'ledger',
        },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.score).toBe(2);
    expect(payload.maxScore).toBe(2);
    expect(payload.percentage).toBe(100);

    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        userId: 'profile_123',
        activityId: baseActivity.id,
        score: 2,
        maxScore: 2,
      }),
    );
  });

  it('ignores client score metadata and returns canonical score fields', async () => {
    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: {
          q1: 'No',
          q2: 'wrong',
        },
        metadata: {
          score: 999,
          maxScore: 999,
          percentage: 100,
        },
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(Object.keys(payload).sort()).toEqual(
      ['score', 'maxScore', 'percentage', 'feedback'].sort(),
    );
    expect(payload.score).toBe(0);
    expect(payload.maxScore).toBe(2);
    expect(payload.percentage).toBe(0);
  });

  it('returns 422 when activity grading config is not auto-gradable', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      ...baseActivity,
      gradingConfig: {
        ...baseActivity.gradingConfig,
        autoGrade: false,
      },
    });

    const response = await POST(
      buildRequest({
        activityId: baseActivity.id,
        answers: { q1: 'Yes' },
      }),
    );

    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload.error).toMatch(/not configured/i);
  });
});
