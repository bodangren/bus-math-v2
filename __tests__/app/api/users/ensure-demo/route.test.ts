import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateAdminClient = vi.fn();
const mockListUsers = vi.fn();
const mockUpdateUserById = vi.fn();
const mockCreateUser = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();
const mockDelete = vi.fn();
const mockIn = vi.fn();
let staleVersionRows: Array<{ id: string }> = [];

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

const { POST } = await import('../../../../../app/api/users/ensure-demo/route');

describe('POST /api/users/ensure-demo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    staleVersionRows = [];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'lesson_versions') {
        return {
          upsert: mockUpsert,
          select: () => ({
            eq: () => ({
              neq: () =>
                Promise.resolve({
                  data: staleVersionRows,
                  error: null,
                }),
            }),
          }),
          delete: mockDelete,
        };
      }

      if (table === 'phase_versions') {
        return {
          upsert: mockUpsert,
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [
                  { id: 'phase-1', phase_number: 1 },
                  { id: 'phase-2', phase_number: 2 },
                  { id: 'phase-3', phase_number: 3 },
                  { id: 'phase-4', phase_number: 4 },
                  { id: 'phase-5', phase_number: 5 },
                  { id: 'phase-6', phase_number: 6 },
                ],
                error: null,
              }),
          }),
        };
      }

      return { upsert: mockUpsert };
    });

    mockUpsert.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ in: mockIn });
    mockIn.mockResolvedValue({ error: null });
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

  it('creates missing demo users and provisions a six-phase lesson with spreadsheet activity', async () => {
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
    expect(mockFrom).toHaveBeenCalledWith('lesson_versions');
    expect(mockFrom).toHaveBeenCalledWith('phase_versions');
    expect(mockFrom).toHaveBeenCalledWith('phase_sections');
    expect(mockFrom).toHaveBeenCalledWith('activities');

    const phaseRowsCall = mockUpsert.mock.calls.find(([rows]) =>
      Array.isArray(rows) && rows.some((row) => typeof row?.phase_number === 'number')
    );
    expect(phaseRowsCall).toBeDefined();
    const phaseRows = phaseRowsCall?.[0] as Array<{ phase_number: number }>;
    expect(phaseRows).toHaveLength(6);
    expect(phaseRows.map((row) => row.phase_number)).toEqual([1, 2, 3, 4, 5, 6]);

    const sectionRowsCall = mockUpsert.mock.calls.find(([rows]) =>
      Array.isArray(rows) && rows.some((row) => typeof row?.section_type === 'string')
    );
    expect(sectionRowsCall).toBeDefined();
    const sectionRows = sectionRowsCall?.[0] as Array<{ section_type: string; content?: { activityId?: string } }>;
    expect(sectionRows.some((row) => row.section_type === 'activity')).toBe(true);
    expect(
      sectionRows.some(
        (row) => row.section_type === 'activity' && typeof row.content?.activityId === 'string'
      )
    ).toBe(true);

    const activityCall = mockUpsert.mock.calls.find(([rows]) =>
      !Array.isArray(rows) &&
      typeof rows === 'object' &&
      rows !== null &&
      (rows as { component_key?: string }).component_key === 'spreadsheet-evaluator'
    );
    expect(activityCall).toBeDefined();
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

  it('deletes stale demo lesson versions before seeding sections', async () => {
    staleVersionRows = [{ id: 'stale-version-1' }, { id: 'stale-version-2' }];

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockDelete).toHaveBeenCalled();
    expect(mockIn).toHaveBeenCalledWith('id', ['stale-version-1', 'stale-version-2']);
  });
});
