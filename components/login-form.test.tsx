import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock AuthProvider
const mockSignIn = vi.fn();

type MockProfile = {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  organization_id: string;
  display_name: string | null;
  avatar_url: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
};

const mockAuthContext: {
  signIn: typeof mockSignIn;
  profile: MockProfile | null;
  user: { id: string } | null;
  loading: boolean;
  signOut: ReturnType<typeof vi.fn>;
} = {
  signIn: mockSignIn,
  profile: null,
  user: null,
  loading: false,
  signOut: vi.fn(),
};

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => mockAuthContext,
}));

const buildProfile = (overrides?: Partial<MockProfile>): MockProfile => ({
  id: overrides?.id ?? 'user-123',
  organization_id: overrides?.organization_id ?? 'org-1',
  username: overrides?.username ?? 'demo_student',
  role: overrides?.role ?? 'student' as const,
  display_name: overrides?.display_name ?? 'Demo User',
  avatar_url: null,
  metadata: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const simulateProfileLoad = (
  rerender: ReturnType<typeof render>['rerender'],
  overrides?: Parameters<typeof buildProfile>[0],
) => {
  act(() => {
    const profile = buildProfile(overrides);
    mockAuthContext.profile = profile;
    mockAuthContext.user = { id: profile.id };
    rerender(<LoginForm />);
  });
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.profile = null;
    mockAuthContext.user = null;
    mockSearchParams.delete('redirect');
  });

  it('renders login form with username and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays demo credentials below login button', () => {
    render(<LoginForm />);

    expect(screen.getByText(/demo accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/click to populate/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use demo student credentials/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use demo teacher credentials/i })).toBeInTheDocument();
  });

  it('populates form when student demo account button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const studentButton = screen.getByRole('button', { name: /use demo student credentials/i });
    await user.click(studentButton);

    expect(screen.getByLabelText(/username/i)).toHaveValue('demo_student');
    expect(screen.getByLabelText(/password/i)).toHaveValue('demo123');
  });

  it('populates form when teacher demo account button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const teacherButton = screen.getByRole('button', { name: /use demo teacher credentials/i });
    await user.click(teacherButton);

    expect(screen.getByLabelText(/username/i)).toHaveValue('demo_teacher');
    expect(screen.getByLabelText(/password/i)).toHaveValue('demo123');
  });

  it('calls signIn with username and password on form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'demo_student');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('demo_student', 'demo123');
    });
  });

  it('displays user-friendly error message on invalid credentials', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'wrong_user');
    await user.type(screen.getByLabelText(/password/i), 'wrong_pass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid username or password/i);
    });
  });

  it('displays generic error message for unknown errors', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Network error'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'demo_student');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unable to log in/i);
    });
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'demo_student');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });
  });

  it('redirects to redirect query param after successful login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    mockSearchParams.set('redirect', '/student/dashboard');

    const { rerender } = render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'demo_student');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    simulateProfileLoad(rerender, {
      id: '123',
      username: 'demo_student',
      role: 'student',
      display_name: 'Demo Student',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('redirects to student dashboard for student role without redirect param', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    const { rerender } = render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'demo_student');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    simulateProfileLoad(rerender, {
      id: '123',
      username: 'demo_student',
      role: 'student',
      display_name: 'Demo Student',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('redirects to teacher dashboard for teacher role', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    const { rerender } = render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'demo_teacher');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    simulateProfileLoad(rerender, {
      id: '456',
      username: 'demo_teacher',
      role: 'teacher',
      display_name: 'Demo Teacher',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/teacher/dashboard');
    });
  });

  it('redirects to admin dashboard for admin role', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);
    const { rerender } = render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'admin123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    simulateProfileLoad(rerender, {
      id: '789',
      username: 'admin',
      role: 'admin',
      display_name: 'Admin User',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(usernameInput).toHaveAttribute('autocomplete', 'username');
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  it('updates aria-invalid when error is present', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'false');

    await user.type(usernameInput, 'wrong_user');
    await user.type(passwordInput, 'wrong_pass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      expect(usernameInput).toHaveAttribute('aria-describedby', 'login-error');
      expect(passwordInput).toHaveAttribute('aria-describedby', 'login-error');
    });
  });

  it('has keyboard navigation support', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginForm />);

    // Tab through form
    await user.tab();
    expect(screen.getByLabelText(/username/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/password/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /login/i })).toHaveFocus();
  });

  it('error message has role=alert and aria-live=polite', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'wrong_user');
    await user.type(screen.getByLabelText(/password/i), 'wrong_pass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });
});
