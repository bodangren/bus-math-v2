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
});
