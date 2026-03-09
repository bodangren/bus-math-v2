import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRequireAdminSessionClaims } = vi.hoisted(() => ({
  mockRequireAdminSessionClaims: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  requireAdminSessionClaims: mockRequireAdminSessionClaims,
}));

const { default: AdminDashboardPage } = await import('../../../../app/admin/dashboard/page');

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireAdminSessionClaims.mockRejectedValue(new Error('NEXT_REDIRECT:/auth/login'));

    await expect(AdminDashboardPage()).rejects.toThrow('NEXT_REDIRECT:/auth/login');
    expect(mockRequireAdminSessionClaims).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('redirects non-admin users away from the admin dashboard', async () => {
    mockRequireAdminSessionClaims.mockRejectedValue(
      new Error('NEXT_REDIRECT:/student/dashboard'),
    );

    await expect(AdminDashboardPage()).rejects.toThrow('NEXT_REDIRECT:/student/dashboard');
    expect(mockRequireAdminSessionClaims).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('renders for admin users', async () => {
    mockRequireAdminSessionClaims.mockResolvedValue({
      sub: 'admin_profile_1',
      username: 'admin_one',
      role: 'admin',
      iat: 1,
      exp: 2,
    });

    const page = await AdminDashboardPage();

    expect(page).toBeDefined();
  });
});
