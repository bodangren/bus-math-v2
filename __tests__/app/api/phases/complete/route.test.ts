import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchQuery = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchQuery: mockFetchQuery,
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  api: {
    api: {
      getLessonBySlugOrId: 'api.getLessonBySlugOrId',
    },
  },
  internal: {
    api: {
      canAccessPhase: 'internal.api.canAccessPhase',
      getPhaseContext: 'internal.api.getPhaseContext',
      getStudentProgressByIdempotencyKey: 'internal.api.getStudentProgressByIdempotencyKey',
      getStudentProgressByPhase: 'internal.api.getStudentProgressByPhase',
      checkNextPhaseExists: 'internal.api.checkNextPhaseExists',
      completePhaseMutation: 'internal.api.completePhaseMutation',
    },
  },
}));

const { POST } = await import('../../../../../app/api/phases/complete/route');

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/phases/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  lessonId: 'unit-1-lesson-1-accounting-equation',
  phaseNumber: 2,
  timeSpent: 120,
  idempotencyKey: '987e6543-e21b-12d3-a456-426614174000',
};

function setupDefaultQueryMocks() {
  mockFetchQuery.mockImplementation(async (name: string) => {
    if (name === 'api.getLessonBySlugOrId') {
      return { _id: 'lesson_1' };
    }
    return null;
  });

  mockFetchInternalQuery.mockImplementation(async (name: string) => {
    if (name === 'internal.api.canAccessPhase') {
      return true;
    }

    if (name === 'internal.api.getPhaseContext') {
      return {
        phaseId: 'phase_2',
        lessonVersionId: 'lesson_version_1',
      };
    }

    if (name === 'internal.api.getStudentProgressByIdempotencyKey') {
      return null;
    }

    if (name === 'internal.api.getStudentProgressByPhase') {
      return null;
    }

    if (name === 'internal.api.checkNextPhaseExists') {
      return true;
    }

    return null;
  });
}

describe('POST /api/phases/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    setupDefaultQueryMocks();

    mockFetchInternalMutation.mockResolvedValue({
      completedAt: '2026-02-26T10:00:00.000Z',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(401);
    expect(mockFetchQuery).not.toHaveBeenCalled();
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 403 when phase access is denied', async () => {
    mockFetchQuery.mockImplementation(async (name: string) => {
      if (name === 'api.getLessonBySlugOrId') {
        return { _id: 'lesson_1' };
      }
      return null;
    });

    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === 'internal.api.canAccessPhase') {
        return false;
      }

      return null;
    });

    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/cannot complete this phase/i);
  });

  it('returns 404 when lesson cannot be resolved', async () => {
    mockFetchQuery.mockImplementation(async (name: string) => {
      if (name === 'api.getLessonBySlugOrId') {
        return null;
      }

      return null;
    });

    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toMatch(/lesson not found/i);
  });

  it('returns 409 when idempotency key was used for a different phase', async () => {
    mockFetchQuery.mockImplementation(async (name: string) => {
      if (name === 'api.getLessonBySlugOrId') {
        return { _id: 'lesson_1' };
      }
      return null;
    });

    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === 'internal.api.canAccessPhase') {
        return true;
      }

      if (name === 'internal.api.getPhaseContext') {
        return {
          phaseId: 'phase_2',
          lessonVersionId: 'lesson_version_1',
        };
      }

      if (name === 'internal.api.getStudentProgressByIdempotencyKey') {
        return { phaseId: 'phase_99' };
      }

      return null;
    });

    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(409);
  });

  it('returns cached success for idempotent replay on the same phase', async () => {
    mockFetchQuery.mockImplementation(async (name: string) => {
      if (name === 'api.getLessonBySlugOrId') {
        return { _id: 'lesson_1' };
      }
      return null;
    });

    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === 'internal.api.canAccessPhase') {
        return true;
      }

      if (name === 'internal.api.getPhaseContext') {
        return {
          phaseId: 'phase_2',
          lessonVersionId: 'lesson_version_1',
        };
      }

      if (name === 'internal.api.getStudentProgressByIdempotencyKey') {
        return {
          phaseId: 'phase_2',
          completedAt: '2026-02-26T10:00:00.000Z',
        };
      }

      if (name === 'internal.api.checkNextPhaseExists') {
        return true;
      }

      return null;
    });

    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toMatch(/idempotent request/i);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('completes a phase using the claims subject as user id', async () => {
    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.phaseId).toBe('phase_2');

    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.api.completePhaseMutation',
      expect.objectContaining({
        userId: 'profile_123',
        phaseId: 'phase_2',
        timeSpent: 120,
      }),
    );
  });
});
