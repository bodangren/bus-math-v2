import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchInternalMutation = vi.fn();
const mockGeneratePasswordSalt = vi.fn();
const mockHashPassword = vi.fn();

vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    auth: {
      ensureProfileByUsername: 'internal.auth.ensureProfileByUsername',
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
    vi.unstubAllEnvs();
  });

  it('returns 403 when demo provisioning is disabled in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.VERCEL_ENV;

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toEqual({ error: 'Demo provisioning is unavailable in this environment' });
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('returns 403 when demo provisioning is requested from a preview deployment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toEqual({ error: 'Demo provisioning is unavailable in this environment' });
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('ensures demo profiles and provisions credentials', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    mockFetchInternalMutation
      // teacher
      .mockResolvedValueOnce({ ok: true, created: false, profileId: 'teacher-id' })
      .mockResolvedValueOnce({ ok: true, updated: false })
      // student
      .mockResolvedValueOnce({ ok: true, created: false, profileId: 'student-id' })
      .mockResolvedValueOnce({ ok: true, updated: true })
      // admin
      .mockResolvedValueOnce({ ok: true, created: true, profileId: 'admin-id' })
      .mockResolvedValueOnce({ ok: true, updated: false });

    mockGeneratePasswordSalt.mockReturnValueOnce('salt-teacher');
    mockGeneratePasswordSalt.mockReturnValueOnce('salt-student');
    mockGeneratePasswordSalt.mockReturnValueOnce('salt-admin');
    mockHashPassword.mockResolvedValueOnce('hash-teacher');
    mockHashPassword.mockResolvedValueOnce('hash-student');
    mockHashPassword.mockResolvedValueOnce('hash-admin');

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      results: [
        { username: 'demo_teacher', status: 'created' },
        { username: 'demo_student', status: 'updated' },
        { username: 'demo_admin', status: 'created' },
      ],
    });

    expect(mockFetchInternalMutation).toHaveBeenCalledWith('internal.auth.ensureProfileByUsername', {
      username: 'demo_teacher',
      role: 'teacher',
    });
    expect(mockFetchInternalMutation).toHaveBeenCalledWith('internal.auth.ensureProfileByUsername', {
      username: 'demo_student',
      role: 'student',
    });
    expect(mockFetchInternalMutation).toHaveBeenCalledWith('internal.auth.ensureProfileByUsername', {
      username: 'demo_admin',
      role: 'admin',
    });

    expect(mockHashPassword).toHaveBeenNthCalledWith(1, 'demo123', 'salt-teacher', 120000);
    expect(mockHashPassword).toHaveBeenNthCalledWith(2, 'demo123', 'salt-student', 120000);
    expect(mockHashPassword).toHaveBeenNthCalledWith(3, 'demo123', 'salt-admin', 120000);

    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(
      2,
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
      4,
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
    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(
      6,
      'internal.auth.upsertCredentialByUsername',
      expect.objectContaining({
        username: 'demo_admin',
        role: 'admin',
        passwordHash: 'hash-admin',
        passwordSalt: 'salt-admin',
        passwordHashIterations: 120000,
        isActive: true,
      }),
    );
  });

  it('records profile ensure failures without attempting credential writes for that user', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    mockFetchInternalMutation
      // teacher ensure -> fail
      .mockResolvedValueOnce({ ok: false, reason: 'organization_not_found' })
      // student ensure + upsert
      .mockResolvedValueOnce({ ok: true, created: false, profileId: 'student-id' })
      .mockResolvedValueOnce({ ok: true, updated: false })
      // admin ensure + upsert
      .mockResolvedValueOnce({ ok: true, created: false, profileId: 'admin-id' })
      .mockResolvedValueOnce({ ok: true, updated: true });

    mockGeneratePasswordSalt.mockReturnValueOnce('salt-student');
    mockGeneratePasswordSalt.mockReturnValueOnce('salt-admin');
    mockHashPassword.mockResolvedValueOnce('hash-student');
    mockHashPassword.mockResolvedValueOnce('hash-admin');

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      results: [
        { username: 'demo_teacher', status: 'organization_not_found' },
        { username: 'demo_student', status: 'created' },
        { username: 'demo_admin', status: 'updated' },
      ],
    });

    expect(mockFetchInternalMutation).toHaveBeenCalledTimes(5);
  });

  it('returns 500 when credential provisioning fails', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockFetchInternalMutation.mockRejectedValue(new Error('boom'));

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Failed to ensure demo credentials' });

    consoleError.mockRestore();
  });
});
