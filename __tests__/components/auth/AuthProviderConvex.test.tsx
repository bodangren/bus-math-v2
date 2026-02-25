import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../components/auth/AuthProvider';

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/convex/_generated/api', () => ({
  api: {
    profiles: {
      getProfileByUsername: 'profiles:getProfileByUsername',
    },
    auth: {
      signIn: 'auth:signIn',
      signOut: 'auth:signOut',
    },
  },
}));

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
  });

  it('provides auth context using Convex', async () => {
    const { useQuery } = await import('convex/react');
    const { api } = await import('@/convex/_generated/api');

    // Mock no user
    (useQuery as any).mockReturnValue(null);

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

  it('provides profile when user is found in Convex', async () => {
    const { useQuery } = await import('convex/react');
    
    const mockProfile = {
      _id: 'user-123',
      username: 'demo_student',
      role: 'student',
      displayName: 'Demo Student',
    };

    // Mock user found (this logic might change based on how we track "current user" in Convex)
    (useQuery as any).mockReturnValue(mockProfile);

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
