import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockGenerateAISummary = vi.fn();
const mockBuildDeterministicSummary = vi.fn();
const mockResolveAIProviderFromEnv = vi.fn();
const mockIsPracticeSubmissionEnvelope = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    teacher: {
      getProfileWithOrg: 'internal.teacher.getProfileWithOrg',
      getSubmissionDetail: 'internal.teacher.getSubmissionDetail',
    },
    activities: {
      getProfileById: 'internal.activities.getProfileById',
    },
  },
}));

vi.mock('@/lib/practice/error-analysis', () => ({
  generateAISummary: mockGenerateAISummary,
  buildDeterministicSummary: mockBuildDeterministicSummary,
}));

vi.mock('@/lib/practice/contract', () => ({
  isPracticeSubmissionEnvelope: mockIsPracticeSubmissionEnvelope,
}));

vi.mock('@/lib/practice/error-analysis/providers', () => ({
  resolveAIProviderFromEnv: mockResolveAIProviderFromEnv,
}));

const { GET } = await import('@/app/api/teacher/ai-error-summary/route');

function buildRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/teacher/ai-error-summary');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

function makeEnvelope(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: 'practice.v1',
    activityId: 'activity-1',
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers: { q1: 'wrong-answer' },
    parts: [
      {
        partId: 'q1',
        rawAnswer: 'wrong-answer',
        isCorrect: false,
        score: 0,
        maxScore: 1,
        misconceptionTags: ['debit-credit-confusion'],
      },
    ],
    ...overrides,
  };
}

const DET_SUMMARY = {
  type: 'deterministic' as const,
  lessonId: 'lesson_1',
  generatedAt: 1700000000000,
  partSummaries: [],
  topMisconceptions: [],
  studentCount: 1,
  averageAccuracy: 0,
};

describe('GET /api/teacher/ai-error-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
    mockResolveAIProviderFromEnv.mockReturnValue(null);
    mockBuildDeterministicSummary.mockReturnValue(DET_SUMMARY);
    mockIsPracticeSubmissionEnvelope.mockReturnValue(true);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(401);
  });

  it('returns 400 when lessonId is missing', async () => {
    const response = await GET(buildRequest({ studentId: 'student_1' }));

    expect(response.status).toBe(400);
  });

  it('returns 400 when studentId is missing', async () => {
    const response = await GET(buildRequest({ lessonId: 'lesson_1' }));

    expect(response.status).toBe(400);
  });

  it('returns 403 when caller is not teacher/admin', async () => {
    mockFetchInternalQuery.mockResolvedValueOnce({
      id: 'teacher_profile_1',
      role: 'student',
      organizationId: 'org_1',
    });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(403);
  });

  it('returns 404 when student not found', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 when student belongs to different org', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_1',
        role: 'student',
        organizationId: 'org_2',
        displayName: 'Alice',
        username: 'alice',
      });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(404);
  });

  it('returns deterministic summary when no AI provider is available', async () => {
    const envelope = makeEnvelope();

    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_1',
        role: 'student',
        organizationId: 'org_1',
        displayName: 'Alice',
        username: 'alice',
      })
      .mockResolvedValueOnce({
        studentName: 'Alice',
        lessonTitle: 'Lesson 1',
        phases: [
          {
            phaseNumber: 3,
            evidence: [
              {
                kind: 'practice',
                submissionData: envelope,
              },
            ],
          },
        ],
      });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.studentName).toBe('Alice');
    expect(payload.lessonTitle).toBe('Lesson 1');
    expect(payload.deterministicSummary).toEqual(DET_SUMMARY);
    expect(payload.aiSummary).toBeNull();
    expect(payload.aiEnabled).toBe(false);
  });

  it('generates AI summary when provider is available', async () => {
    const envelope = makeEnvelope();
    const aiResult = {
      type: 'ai-assisted' as const,
      likelyMisunderstanding: 'Student confuses debits and credits',
      evidenceObserved: 'q1 answered with wrong side',
      suggestedIntervention: 'Review T-account basics',
      sourceSubmissionId: 'activity-1-1',
      sourceEvidence: { partIds: ['q1'], misconceptionTags: ['debit-credit-confusion'] },
      generatedAt: Date.now(),
    };

    const mockProvider = vi.fn();
    mockResolveAIProviderFromEnv.mockReturnValue(mockProvider);
    mockGenerateAISummary.mockResolvedValue(aiResult);

    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_1',
        role: 'student',
        organizationId: 'org_1',
        displayName: 'Alice',
        username: 'alice',
      })
      .mockResolvedValueOnce({
        studentName: 'Alice',
        lessonTitle: 'Lesson 1',
        phases: [
          {
            phaseNumber: 3,
            evidence: [
              {
                kind: 'practice',
                submissionData: envelope,
              },
            ],
          },
        ],
      });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.aiEnabled).toBe(true);
    expect(payload.aiSummary).toEqual(aiResult);
    expect(mockGenerateAISummary).toHaveBeenCalledTimes(1);
  });

  it('returns null aiSummary when AI provider throws', async () => {
    const envelope = makeEnvelope();

    const mockProvider = vi.fn();
    mockResolveAIProviderFromEnv.mockReturnValue(mockProvider);
    mockGenerateAISummary.mockResolvedValue(null);

    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_1',
        role: 'student',
        organizationId: 'org_1',
        displayName: 'Alice',
        username: 'alice',
      })
      .mockResolvedValueOnce({
        studentName: 'Alice',
        lessonTitle: 'Lesson 1',
        phases: [
          {
            phaseNumber: 3,
            evidence: [
              {
                kind: 'practice',
                submissionData: envelope,
              },
            ],
          },
        ],
      });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.aiEnabled).toBe(true);
    expect(payload.aiSummary).toBeNull();
  });

  it('returns 404 when submission detail is null', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_1',
        role: 'student',
        organizationId: 'org_1',
        displayName: 'Alice',
        username: 'alice',
      })
      .mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(404);
  });

  it('skips non-practice evidence when building envelopes', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        id: 'teacher_profile_1',
        role: 'teacher',
        organizationId: 'org_1',
      })
      .mockResolvedValueOnce({
        id: 'student_1',
        role: 'student',
        organizationId: 'org_1',
        displayName: 'Alice',
        username: 'alice',
      })
      .mockResolvedValueOnce({
        studentName: 'Alice',
        lessonTitle: 'Lesson 1',
        phases: [
          {
            phaseNumber: 1,
            evidence: [
              {
                kind: 'spreadsheet',
                submissionData: { data: 'sheet' },
              },
            ],
          },
        ],
      });

    const response = await GET(
      buildRequest({ lessonId: 'lesson_1', studentId: 'student_1' }),
    );

    expect(response.status).toBe(200);
    expect(mockBuildDeterministicSummary).toHaveBeenCalledWith(
      'lesson_1',
      [],
      expect.any(Map),
    );
  });
});
