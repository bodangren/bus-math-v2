import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, usernameToEmail } from './AuthProvider';

// Mock the Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  })),
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

describe('components/auth/AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful session fetch
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Mock auth state change subscription
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    // Mock profiles query
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });
  });

  describe('usernameToEmail utility', () => {
    it('converts username to internal email format', () => {
      expect(usernameToEmail('demo_student')).toBe('demo_student@internal.domain');
      expect(usernameToEmail('demo_teacher')).toBe('demo_teacher@internal.domain');
      expect(usernameToEmail('john_doe')).toBe('john_doe@internal.domain');
    });

    it('handles usernames with special characters', () => {
      expect(usernameToEmail('test.user')).toBe('test.user@internal.domain');
      expect(usernameToEmail('user-123')).toBe('user-123@internal.domain');
    });
  });

  describe('AuthProvider', () => {
    it('provides auth context to children', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially loading
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // After session check, should show not authenticated
      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('profile-username')).toHaveTextContent('No profile');
      });
    });

    it('fetches user session on mount', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });

    it('sets up auth state change listener', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Mock console.error to avoid noise in test output
      const originalError = console.error;
      console.error = vi.fn();

      function ComponentWithoutProvider() {
        useAuth();
        return null;
      }

      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    it('provides signIn method', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: {} },
        error: null,
      });

      function TestSignIn() {
        const { signIn } = useAuth();
        return (
          <button onClick={() => signIn('demo_student', 'password123')}>
            Sign In
          </button>
        );
      }

      render(
        <AuthProvider>
          <TestSignIn />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });

      screen.getByText('Sign In').click();

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'demo_student@internal.domain',
          password: 'password123',
        });
      });
    });

    it('provides signOut method', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      function TestSignOut() {
        const { signOut } = useAuth();
        return <button onClick={() => signOut()}>Sign Out</button>;
      }

      render(
        <AuthProvider>
          <TestSignOut />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });

      screen.getByText('Sign Out').click();

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('Profile fetching', () => {
    it('fetches profile when user is authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'demo_student@internal.domain',
      };

      const mockProfile = {
        id: 'user-123',
        organizationId: 'org-123',
        username: 'demo_student',
        role: 'student' as const,
        displayName: 'Demo Student',
        avatarUrl: null,
        metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('profile-username')).toHaveTextContent('demo_student');
      });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });

    it('handles profile fetch errors gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'demo_student@internal.domain',
      };

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      });

      // Mock console.error to avoid noise
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('profile-username')).toHaveTextContent('No profile');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching profile:',
        { message: 'Profile not found' }
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
