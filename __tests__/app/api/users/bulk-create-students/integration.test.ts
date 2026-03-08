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

describe('POST /api/users/bulk-create-students (Integration)', () => {
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

  it('creates a class roster payload of 30 students and returns one-time credentials', async () => {
    mockFetchInternalMutation.mockImplementation(async (_name: string, args: Record<string, unknown>) => {
      const students = (args.students as Array<Record<string, string>>) ?? [];
      return {
        ok: true,
        totalCreated: students.length,
        organizationId: 'org-1',
        students: students.map((student, index) => {
          const username = student.preferredUsername || `student_${(index + 1).toString().padStart(2, '0')}`;
          return {
            studentId: `student-${index + 1}`,
            username,
            displayName: `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || username,
            email: `${username}@internal.domain`,
          };
        }),
      };
    });

    const students = Array.from({ length: 30 }, (_, i) => ({
      firstName: `Student${i}`,
      lastName: `Test${i}`,
      username: `student_${i}`,
    }));

    const response = await POST(makeRequest({ students }));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.totalCreated).toBe(30);
    expect(json.students).toHaveLength(30);
    expect(new Set(json.students.map((s: { username: string }) => s.username)).size).toBe(30);
    expect(json.students.every((s: { password: string }) => s.password.length >= 8)).toBe(true);
  });

  it('returns 500 when bulk mutation throws unexpectedly', async () => {
    mockFetchInternalMutation.mockRejectedValue(new Error('bulk mutation failed'));

    const response = await POST(
      makeRequest({
        students: [
          { firstName: 'Ada', lastName: 'Lovelace' },
          { firstName: 'Grace', lastName: 'Hopper' },
        ],
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toMatch(/unexpected error/i);
  });
});
