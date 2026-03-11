import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    activities: {
      getSpreadsheetDraft: 'internal.activities.getSpreadsheetDraft',
      saveSpreadsheetDraft: 'internal.activities.saveSpreadsheetDraft',
    },
  },
}));

const { GET, POST } = await import(
  '../../../../../../../app/api/activities/spreadsheet/[activityId]/draft/route'
);

function buildContext(activityId = 'activity_123') {
  return {
    params: Promise.resolve({ activityId }),
  };
}

function buildPostRequest(body: unknown) {
  return new Request('http://localhost/api/activities/spreadsheet/activity_123/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/activities/spreadsheet/[activityId]/draft', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_student',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
    mockRequireStudentRequestClaims.mockImplementation(async () => {
      const claims = await mockGetRequestSessionClaims();
      if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (claims.role !== 'student') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      return claims;
    });

    mockFetchInternalQuery.mockResolvedValue({
      draftData: [[{ value: 100 }]],
      updatedAt: '2026-02-26T10:00:00.000Z',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/activities/spreadsheet/activity_123/draft', {
        method: 'GET',
      }),
      buildContext(),
    );

    expect(response.status).toBe(401);
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns draft for claims subject', async () => {
    const response = await GET(
      new Request('http://localhost/api/activities/spreadsheet/activity_123/draft', {
        method: 'GET',
      }),
      buildContext(),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.draftData).toEqual([[{ value: 100 }]]);

    expect(mockFetchInternalQuery).toHaveBeenCalledWith('internal.activities.getSpreadsheetDraft', {
      userId: 'profile_student',
      activityId: 'activity_123',
    });
  });

  it('returns 403 for teacher sessions on draft reads', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_teacher',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    const response = await GET(
      new Request('http://localhost/api/activities/spreadsheet/activity_123/draft', {
        method: 'GET',
      }),
      buildContext(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'Forbidden' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });
});

describe('POST /api/activities/spreadsheet/[activityId]/draft', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_student',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
    mockRequireStudentRequestClaims.mockImplementation(async () => {
      const claims = await mockGetRequestSessionClaims();
      if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (claims.role !== 'student') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      return claims;
    });

    mockFetchInternalMutation.mockResolvedValue({
      updatedAt: '2026-02-26T10:00:00.000Z',
    });
  });

  it('validates payload schema', async () => {
    const response = await POST(
      buildPostRequest({ draftData: { invalid: true } }),
      buildContext(),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid payload');
  });

  it('saves draft for claims subject', async () => {
    const response = await POST(
      buildPostRequest({ draftData: [[{ value: 200 }]] }),
      buildContext(),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    expect(mockFetchInternalMutation).toHaveBeenCalledWith('internal.activities.saveSpreadsheetDraft', {
      userId: 'profile_student',
      activityId: 'activity_123',
      draftData: [[{ value: 200 }]],
    });
  });

  it('returns 403 for admin sessions on draft writes', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_admin',
      username: 'admin',
      role: 'admin',
      iat: 1,
      exp: 2,
    });

    const response = await POST(
      buildPostRequest({ draftData: [[{ value: 200 }]] }),
      buildContext(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'Forbidden' });
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });
});
