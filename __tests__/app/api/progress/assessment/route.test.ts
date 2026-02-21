import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

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

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSingle.mockResolvedValue({ data: baseActivity, error: null });
    mockInsert.mockResolvedValue({ error: null });

    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'activities') {
        return { select: mockSelect };
      }

      if (table === 'activity_submissions') {
        return { insert: mockInsert };
      }

      throw new Error(`Unexpected table ${table}`);
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(buildRequest({
      activityId: baseActivity.id,
      answers: { q1: 'Yes' },
    }));

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toMatch(/unauthorized/i);
  });

  it('returns 401 and does not query tables when auth provider returns an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    });

    const response = await POST(buildRequest({
      activityId: baseActivity.id,
      answers: { q1: 'Yes' },
    }));

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toBe('JWT expired');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('validates the incoming payload', async () => {
    const response = await POST(buildRequest({ activityId: 'not-a-uuid', answers: {} }));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid payload');
  });

  it('returns 404 when the activity cannot be found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows' },
    });

    const response = await POST(buildRequest({
      activityId: baseActivity.id,
      answers: { q1: 'Yes' },
    }));

    expect(response.status).toBe(404);
    const payload = await response.json();
    expect(payload.error).toMatch(/not found/i);
  });

  it('scores the submission on the server and persists it', async () => {
    const response = await POST(buildRequest({
      activityId: baseActivity.id,
      answers: {
        q1: 'Yes',
        q2: 'ledger',
      },
    }));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.score).toBe(2);
    expect(payload.maxScore).toBe(2);
    expect(payload.percentage).toBe(100);
    expect(payload.feedback).toMatch(/great work/i);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        activity_id: baseActivity.id,
        score: 2,
        max_score: 2,
      }),
    );
  });

  it('ignores client-provided score metadata and returns canonical score contract fields', async () => {
    const response = await POST(buildRequest({
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
    }));

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(Object.keys(payload).sort()).toEqual(
      ['score', 'maxScore', 'percentage', 'feedback'].sort(),
    );
    expect(payload.score).toBe(0);
    expect(payload.maxScore).toBe(2);
    expect(payload.percentage).toBe(0);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 0,
        max_score: 2,
      }),
    );
  });

  it('scores a tiered-assessment with numeric correctAnswer (not 422)', async () => {
    const tieredActivity = {
      ...baseActivity,
      componentKey: 'tiered-assessment',
      props: {
        title: 'Tiered Assessment',
        description: 'Test numeric scoring',
        showExplanations: false,
        allowRetry: true,
        tier: 'application',
        questions: [
          {
            id: 'q1',
            text: 'How many units are needed to break even at $500 fixed cost and $5 margin?',
            type: 'numeric-entry',
            correctAnswer: 100,
          },
        ],
      },
    };

    mockSingle.mockResolvedValue({ data: tieredActivity, error: null });

    const response = await POST(buildRequest({
      activityId: baseActivity.id,
      answers: { q1: '100' },
    }));

    // Should score successfully — not 422 (cannot score submission)
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.score).toBe(1);
    expect(payload.maxScore).toBe(1);
  });

  it('returns 422 when the activity is not auto-gradable', async () => {
    mockSingle.mockResolvedValue({
      data: {
        ...baseActivity,
        gradingConfig: { autoGrade: false },
      },
      error: null,
    });

    const response = await POST(buildRequest({
      activityId: baseActivity.id,
      answers: { q1: 'Yes' },
    }));

    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload.error).toMatch(/not configured/i);
  });
});
