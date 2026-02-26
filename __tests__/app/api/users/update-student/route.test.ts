import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFrom = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    auth: { admin: { updateUserById: mockUpdateUserById } },
  })),
}));

const { POST } = await import('../../../../../app/api/users/update-student/route');

function makeQueryBuilder(value: unknown) {
  const self: Record<string, unknown> = {
    select: vi.fn(() => self),
    eq: vi.fn(() => self),
    maybeSingle: vi.fn().mockResolvedValue(value),
    update: vi.fn(() => self),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(value).then(resolve, reject),
  };
  return self;
}

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

    const response = await POST(
      makeRequest({
        studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b',
        displayName: 'New Name',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 403 when caller is not teacher/admin', async () => {
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: { id: 'teacher-1', role: 'student', organization_id: 'org-1' },
        error: null,
      }),
    );

    const response = await POST(
      makeRequest({
        studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b',
        displayName: 'New Name',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it('updates display name for org-scoped student', async () => {
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: { id: 'teacher-1', role: 'teacher', organization_id: 'org-1' },
        error: null,
      }),
    );
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          id: 'student-1',
          role: 'student',
          organization_id: 'org-1',
          username: 'demo_student',
          display_name: 'Old Name',
          metadata: {},
        },
        error: null,
      }),
    );
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ error: null }));

    const response = await POST(
      makeRequest({
        studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b',
        displayName: 'New Name',
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studentId).toBe('student-1');
    expect(json.displayName).toBe('New Name');
    expect(json.deactivated).toBe(false);
  });

  it('deactivates student account and applies auth ban', async () => {
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: { id: 'teacher-1', role: 'teacher', organization_id: 'org-1' },
        error: null,
      }),
    );
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          id: 'student-1',
          role: 'student',
          organization_id: 'org-1',
          username: 'demo_student',
          display_name: 'Old Name',
          metadata: {},
        },
        error: null,
      }),
    );
    mockUpdateUserById.mockResolvedValue({ data: { user: { id: 'student-1' } }, error: null });
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ error: null }));

    const response = await POST(
      makeRequest({
        studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b',
        deactivate: true,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.deactivated).toBe(true);
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        ban_duration: expect.any(String),
      }),
    );
  });
});
