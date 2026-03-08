import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    auth: {
      createStudentAccount: 'internal.auth.createStudentAccount',
    },
  },
}));

const { POST } = await import('../../../../../app/api/users/create-student/route');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/users/create-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/create-student', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'teacher-1',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(makeRequest({ firstName: 'Ada' }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 400 when request body is invalid JSON', async () => {
    const request = new Request('http://localhost/api/users/create-student', {
      method: 'POST',
      body: '{not-valid-json',
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/invalid json/i);
  });

  it('returns 403 when caller is not allowed to create students', async () => {
    mockFetchInternalMutation.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await POST(makeRequest({ firstName: 'Ada', lastName: 'Lovelace' }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it('creates a student account and returns one-time credentials', async () => {
    mockFetchInternalMutation.mockResolvedValue({
      ok: true,
      studentId: 'student-1',
      username: 'ada_lovelace',
      displayName: 'Ada Lovelace',
      organizationId: 'org-1',
    });

    const response = await POST(
      makeRequest({
        firstName: 'Ada',
        lastName: 'Lovelace',
        displayName: 'Ada Lovelace',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.username).toBe('ada_lovelace');
    expect(json.displayName).toBe('Ada Lovelace');
    expect(json.email).toBe('ada_lovelace@internal.domain');
    expect(json.password.length).toBeGreaterThanOrEqual(8);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.auth.createStudentAccount',
      expect.objectContaining({
        teacherProfileId: 'teacher-1',
        student: expect.objectContaining({
          firstName: 'Ada',
          lastName: 'Lovelace',
          displayName: 'Ada Lovelace',
          passwordHash: expect.any(String),
          passwordSalt: expect.any(String),
          passwordHashIterations: expect.any(Number),
        }),
      }),
    );
  });
});
