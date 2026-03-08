import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AuthButton } from '@/components/auth-button';

const { mockGetServerSessionClaims } = vi.hoisted(() => ({
  mockGetServerSessionClaims: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  getServerSessionClaims: mockGetServerSessionClaims,
}));

vi.mock('@/components/logout-button', () => ({
  LogoutButton: () => <button type="button">Logout</button>,
}));

describe('AuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in link when no session exists', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);

    const component = await AuthButton();
    render(component);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/login');
  });

  it('renders username and logout button when session exists', async () => {
    mockGetServerSessionClaims.mockResolvedValue({
      sub: 'profile-1',
      username: 'demo_teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    const component = await AuthButton();
    render(component);

    expect(screen.getByText('Hey, demo_teacher!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });
});
