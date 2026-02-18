import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockUpdateUserById = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
    auth: { admin: { updateUserById: mockUpdateUserById } },
  })),
}));

const { POST } = await import('../../../../../app/api/users/reset-student-password/route');

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
  return new Request('http://localhost/api/users/reset-student-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/users/reset-student-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the caller is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(makeRequest({ studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b' }));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 403 when the caller is not a teacher/admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'student-1' } }, error: null });
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { id: 'student-1', role: 'student', organization_id: 'org-1' }, error: null }),
    );

    const response = await POST(makeRequest({ studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b' }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toMatch(/only teachers/i);
  });

  it('returns 404 when target student is outside the teacher organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'teacher-1' } }, error: null });
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { id: 'teacher-1', role: 'teacher', organization_id: 'org-1' }, error: null }),
    );
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          id: 'student-9',
          role: 'student',
          organization_id: 'org-2',
          username: 'demo_student',
          display_name: 'Demo Student',
          metadata: null,
        },
        error: null,
      }),
    );

    const response = await POST(makeRequest({ studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b' }));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toMatch(/not found/i);
  });

  it('resets password and returns one-time credential payload', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'teacher-1' } }, error: null });
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { id: 'teacher-1', role: 'teacher', organization_id: 'org-1' }, error: null }),
    );
    mockFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          id: 'student-1',
          role: 'student',
          organization_id: 'org-1',
          username: 'demo_student',
          display_name: 'Demo Student',
          metadata: {},
        },
        error: null,
      }),
    );
    mockUpdateUserById.mockResolvedValue({ data: { user: { id: 'student-1' } }, error: null });
    mockFrom.mockReturnValueOnce(makeQueryBuilder({ error: null }));

    const response = await POST(makeRequest({ studentId: '5d86f8f9-03b5-4a1e-96ec-b543e26f412b' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studentId).toBe('student-1');
    expect(json.username).toBe('demo_student');
    expect(json).toHaveProperty('password');
    expect(json.password.length).toBeGreaterThanOrEqual(10);
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        password: expect.any(String),
      }),
    );
  });
});
