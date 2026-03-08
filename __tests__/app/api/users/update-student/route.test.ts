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
      updateStudentAccount: 'internal.auth.updateStudentAccount',
    },
  },
}));

const { POST } = await import('../../../../../app/api/users/update-student/route');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/users/update-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/update-student', () => {
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

    const response = await POST(makeRequest({ studentId: 'student-1', displayName: 'New Name' }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when payload does not include an update', async () => {
    const response = await POST(makeRequest({ studentId: 'student-1' }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/invalid request payload/i);
  });

  it('returns 403 when caller is not allowed to manage students', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'student-1',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await POST(makeRequest({ studentId: 'student-1', deactivate: true }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('surfaces forbidden responses returned by the mutation', async () => {
    mockFetchInternalMutation.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await POST(makeRequest({ studentId: 'student-1', deactivate: true }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it('returns 404 when target student does not exist in the teacher org', async () => {
    mockFetchInternalMutation.mockResolvedValue({ ok: false, reason: 'student_not_found' });

    const response = await POST(makeRequest({ studentId: 'missing-student', displayName: 'Name' }));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toMatch(/student not found/i);
  });

  it('returns updated student account details', async () => {
    mockFetchInternalMutation.mockResolvedValue({
      ok: true,
      studentId: 'student-1',
      username: 'demo_student',
      displayName: 'New Name',
      deactivated: false,
    });

    const response = await POST(makeRequest({ studentId: 'student-1', displayName: 'New Name' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studentId).toBe('student-1');
    expect(json.displayName).toBe('New Name');
    expect(json.deactivated).toBe(false);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.auth.updateStudentAccount',
      expect.objectContaining({
        teacherProfileId: 'teacher-1',
        studentProfileId: 'student-1',
        displayName: 'New Name',
      }),
    );
  });
});
