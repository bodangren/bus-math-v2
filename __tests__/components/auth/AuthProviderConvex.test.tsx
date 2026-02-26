import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../components/auth/AuthProvider';

const mockFetch = vi.fn();

// Test component that uses the auth context
function TestComponent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="user-status">{user ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="profile-username">{profile?.username || 'No profile'}</div>
    </div>
  );
}

describe('components/auth/AuthProvider (Convex Migration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ authenticated: false }), { status: 200 }),
    );
  });

  it('loads unauthenticated state from session endpoint', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // After loading, should show not authenticated
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('profile-username')).toHaveTextContent('No profile');
    });
  });

  it('loads authenticated user from session endpoint', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          authenticated: true,
          user: { id: 'user-123', username: 'demo_student' },
          profile: {
            id: 'user-123',
            organization_id: 'org-123',
            username: 'demo_student',
            role: 'student',
            display_name: 'Demo Student',
            avatar_url: null,
            metadata: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
        { status: 200 },
      ),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('profile-username')).toHaveTextContent('demo_student');
    });
  });
});
