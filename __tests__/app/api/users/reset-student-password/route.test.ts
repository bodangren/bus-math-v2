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
      resetStudentPassword: 'internal.auth.resetStudentPassword',
    },
  },
}));

const { POST } = await import('../../../../../app/api/users/reset-student-password/route');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/users/reset-student-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/reset-student-password', () => {
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

    const response = await POST(makeRequest({ studentId: 'student-1' }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when studentId is missing', async () => {
    const response = await POST(makeRequest({}));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/invalid request payload/i);
  });

  it('returns 403 when caller is not allowed to reset passwords', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'student-1',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await POST(makeRequest({ studentId: 'student-1' }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('surfaces forbidden responses returned by the mutation', async () => {
    mockFetchInternalMutation.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await POST(makeRequest({ studentId: 'student-1' }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it('returns 404 when target student cannot be resolved in teacher org', async () => {
    mockFetchInternalMutation.mockResolvedValue({ ok: false, reason: 'student_not_found' });

    const response = await POST(makeRequest({ studentId: 'student-unknown' }));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toMatch(/student not found/i);
  });

  it('resets student password and returns one-time credentials', async () => {
    mockFetchInternalMutation.mockResolvedValue({
      ok: true,
      studentId: 'student-1',
      username: 'demo_student',
      displayName: 'Demo Student',
    });

    const response = await POST(makeRequest({ studentId: 'student-1' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studentId).toBe('student-1');
    expect(json.username).toBe('demo_student');
    expect(json.password.length).toBeGreaterThanOrEqual(10);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.auth.resetStudentPassword',
      expect.objectContaining({
        teacherProfileId: 'teacher-1',
        studentProfileId: 'student-1',
        passwordHash: expect.any(String),
        passwordSalt: expect.any(String),
        passwordHashIterations: expect.any(Number),
      }),
    );
  });
});
