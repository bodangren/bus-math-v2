import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockGeneratePasswordSalt = vi.fn();
const mockHashPassword = vi.fn();

vi.mock('@/lib/convex/server', () => ({
  fetchQuery: mockFetchQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  api: {
    activities: {
      getProfileByUsername: 'api.activities.getProfileByUsername',
    },
  },
  internal: {
    auth: {
      upsertCredentialByUsername: 'internal.auth.upsertCredentialByUsername',
    },
  },
}));

vi.mock('@/lib/auth/session', () => ({
  generatePasswordSalt: mockGeneratePasswordSalt,
  hashPassword: mockHashPassword,
}));

const { POST } = await import('../../../../../app/api/users/ensure-demo/route');

describe('POST /api/users/ensure-demo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provisions credentials for demo users with existing profiles', async () => {
    mockFetchQuery.mockResolvedValueOnce({
      id: 'teacher-id',
      username: 'demo_teacher',
      role: 'teacher',
    });
    mockFetchQuery.mockResolvedValueOnce({
      id: 'student-id',
      username: 'demo_student',
      role: 'student',
    });

    mockGeneratePasswordSalt.mockReturnValueOnce('salt-teacher');
    mockGeneratePasswordSalt.mockReturnValueOnce('salt-student');
    mockHashPassword.mockResolvedValueOnce('hash-teacher');
    mockHashPassword.mockResolvedValueOnce('hash-student');

    mockFetchInternalMutation.mockResolvedValueOnce({ ok: true, updated: false });
    mockFetchInternalMutation.mockResolvedValueOnce({ ok: true, updated: true });

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      results: [
        { username: 'demo_teacher', status: 'created' },
        { username: 'demo_student', status: 'updated' },
      ],
    });

    expect(mockFetchQuery).toHaveBeenNthCalledWith(1, 'api.activities.getProfileByUsername', {
      username: 'demo_teacher',
    });
    expect(mockFetchQuery).toHaveBeenNthCalledWith(2, 'api.activities.getProfileByUsername', {
      username: 'demo_student',
    });

    expect(mockHashPassword).toHaveBeenNthCalledWith(1, 'demo123', 'salt-teacher', 120000);
    expect(mockHashPassword).toHaveBeenNthCalledWith(2, 'demo123', 'salt-student', 120000);

    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(
      1,
      'internal.auth.upsertCredentialByUsername',
      expect.objectContaining({
        username: 'demo_teacher',
        role: 'teacher',
        passwordHash: 'hash-teacher',
        passwordSalt: 'salt-teacher',
        passwordHashIterations: 120000,
        isActive: true,
      }),
    );
    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(
      2,
      'internal.auth.upsertCredentialByUsername',
      expect.objectContaining({
        username: 'demo_student',
        role: 'student',
        passwordHash: 'hash-student',
        passwordSalt: 'salt-student',
        passwordHashIterations: 120000,
        isActive: true,
      }),
    );
  });

  it('marks missing demo profile records without attempting credential writes', async () => {
    mockFetchQuery.mockResolvedValueOnce(null);
    mockFetchQuery.mockResolvedValueOnce({
      id: 'student-id',
      username: 'demo_student',
      role: 'student',
    });
    mockGeneratePasswordSalt.mockReturnValueOnce('salt-student');
    mockHashPassword.mockResolvedValueOnce('hash-student');
    mockFetchInternalMutation.mockResolvedValueOnce({ ok: true, updated: false });

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      results: [
        { username: 'demo_teacher', status: 'profile_not_found' },
        { username: 'demo_student', status: 'created' },
      ],
    });

    expect(mockFetchInternalMutation).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when credential provisioning fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockFetchQuery.mockResolvedValue({
      id: 'teacher-id',
      username: 'demo_teacher',
      role: 'teacher',
    });
    mockGeneratePasswordSalt.mockReturnValue('salt');
    mockHashPassword.mockResolvedValue('hash');
    mockFetchInternalMutation.mockRejectedValue(new Error('boom'));

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Failed to ensure demo credentials' });

    consoleError.mockRestore();
  });
});
