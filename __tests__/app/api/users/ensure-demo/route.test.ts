import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateAdminClient = vi.fn();
const mockListUsers = vi.fn();
const mockUpdateUserById = vi.fn();
const mockCreateUser = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

const { POST } = await import('../../../../../app/api/users/ensure-demo/route');

describe('POST /api/users/ensure-demo', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockUpsert.mockResolvedValue({ error: null });
    mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockUpdateUserById.mockResolvedValue({ error: null });
    mockCreateUser.mockResolvedValue({
      data: { user: { id: 'new-demo-user-id' } },
      error: null,
    });

    mockCreateAdminClient.mockReturnValue({
      auth: {
        admin: {
          listUsers: mockListUsers,
          updateUserById: mockUpdateUserById,
          createUser: mockCreateUser,
        },
      },
      from: mockFrom,
    });
  });

  it('creates missing demo users and upserts their profiles', async () => {
    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockCreateUser).toHaveBeenCalledTimes(2);
    expect(mockUpdateUserById).not.toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('organizations');
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockFrom).toHaveBeenCalledWith('lessons');
    expect(mockFrom).toHaveBeenCalledWith('phases');
  });

  it('resets passwords for existing demo users', async () => {
    mockListUsers.mockResolvedValue({
      data: {
        users: [
          { id: 'teacher-id', email: 'demo_teacher@internal.domain' },
          { id: 'student-id', email: 'demo_student@internal.domain' },
        ],
      },
      error: null,
    });

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockUpdateUserById).toHaveBeenCalledTimes(2);
    expect(mockUpdateUserById).toHaveBeenNthCalledWith(
      1,
      'teacher-id',
      expect.objectContaining({ password: 'demo123' })
    );
    expect(mockUpdateUserById).toHaveBeenNthCalledWith(
      2,
      'student-id',
      expect.objectContaining({ password: 'demo123' })
    );
  });

  it('returns 500 when the admin client is not available', async () => {
    mockCreateAdminClient.mockImplementation(() => {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    });

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to ensure demo users');
  });
});
