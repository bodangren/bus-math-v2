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
      bulkCreateStudentAccounts: 'internal.auth.bulkCreateStudentAccounts',
    },
  },
}));

const { POST } = await import('../../../../../app/api/users/bulk-create-students/route');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/users/bulk-create-students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/bulk-create-students', () => {
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

    const response = await POST(makeRequest({ students: [{ firstName: 'Ada' }] }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 400 when students array is missing or empty', async () => {
    const response = await POST(makeRequest({ students: [] }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/non-empty/i);
  });

  it('returns 400 when students batch exceeds 100', async () => {
    const response = await POST(makeRequest({ students: new Array(101).fill({ firstName: 'X' }) }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/maximum batch size/i);
  });

  it('returns 403 when caller is not allowed to create students', async () => {
    mockFetchInternalMutation.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await POST(makeRequest({ students: [{ firstName: 'Ada' }] }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it('returns 201 and response payload for created students', async () => {
    mockFetchInternalMutation.mockResolvedValue({
      ok: true,
      totalCreated: 2,
      organizationId: 'org-1',
      students: [
        { studentId: 'student-1', username: 'ada_lovelace', displayName: 'Ada Lovelace', email: 'ada_lovelace@internal.domain' },
        { studentId: 'student-2', username: 'grace_hopper', displayName: 'Grace Hopper', email: 'grace_hopper@internal.domain' },
      ],
    });

    const response = await POST(
      makeRequest({
        students: [
          { firstName: 'Ada', lastName: 'Lovelace' },
          { firstName: 'Grace', lastName: 'Hopper' },
        ],
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.totalCreated).toBe(2);
    expect(json.students[0].username).toBe('ada_lovelace');
    expect(json.students[0]).toHaveProperty('password');
    expect(json.students[1]).toHaveProperty('password');
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.auth.bulkCreateStudentAccounts',
      expect.objectContaining({
        teacherProfileId: 'teacher-1',
        students: expect.arrayContaining([
          expect.objectContaining({
            firstName: 'Ada',
            lastName: 'Lovelace',
            passwordHash: expect.any(String),
            passwordSalt: expect.any(String),
            passwordHashIterations: expect.any(Number),
          }),
        ]),
      }),
    );
  });

  it('returns 500 for unexpected mutation failures', async () => {
    mockFetchInternalMutation.mockRejectedValue(new Error('mutation failed'));

    const response = await POST(makeRequest({ students: [{ firstName: 'Ada' }] }));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toMatch(/unexpected error/i);
  });
});
