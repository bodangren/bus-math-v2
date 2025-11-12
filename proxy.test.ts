import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Mock NextResponse before any imports
const mockNext = vi.fn();
const mockRedirect = vi.fn();

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: mockNext,
      redirect: mockRedirect,
    },
  };
});

// Mock @supabase/ssr
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

// Import after mocks are defined
const { proxy } = await import('./proxy');

// Helper to create a mock NextRequest
function createRequest(pathname: string, cookies: Record<string, string> = {}) {
  const url = new URL(`http://localhost:3000${pathname}`);

  // Add clone method to URL (required by Next.js proxy)
  const nextUrl = Object.assign(url, {
    clone: () => new URL(url.toString()),
  });

  const request = {
    nextUrl,
    url: url.toString(),
    cookies: {
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
      set: vi.fn(),
    },
    headers: new Headers(),
  } as unknown as NextRequest;

  return request;
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset NextResponse mocks
    mockNext.mockImplementation(() => {
      const response = {
        status: 200,
        headers: new Headers(),
        cookies: {
          set: vi.fn(),
          getAll: vi.fn(() => []),
        },
      };
      return response;
    });

    mockRedirect.mockImplementation((url: URL | string) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      return {
        status: 307,
        headers: new Headers({ location: urlString }),
      };
    });

    // Setup default mock chain for profile queries
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  describe('Public routes', () => {
    it('allows access to / without authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows access to /preface without authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/preface');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows access to /curriculum without authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/curriculum');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows access to /login without authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/login');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows access to /auth routes without authentication', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/auth/callback');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Unauthenticated access to protected routes', () => {
    it('redirects to /login when accessing /student without auth', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/student');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fstudent');
    });

    it('redirects to /login when accessing /teacher without auth', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/teacher');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fteacher');
    });

    it('preserves deep paths in redirect query param', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/student/dashboard/progress');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('redirect=%2Fstudent%2Fdashboard%2Fprogress');
    });
  });

  describe('Student role access', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'student-123' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { role: 'student' },
        error: null,
      });
    });

    it('allows student to access /student routes', async () => {
      const request = createRequest('/student');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows student to access /student/* routes', async () => {
      const request = createRequest('/student/dashboard');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('redirects student to /student when accessing /teacher routes', async () => {
      const request = createRequest('/teacher');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/student');
    });
  });

  describe('Teacher role access', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'teacher-123' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { role: 'teacher' },
        error: null,
      });
    });

    it('allows teacher to access /teacher routes', async () => {
      const request = createRequest('/teacher');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows teacher to access /teacher/* routes', async () => {
      const request = createRequest('/teacher/dashboard');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows teacher to access /student routes', async () => {
      const request = createRequest('/student');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows teacher to access /student/* routes', async () => {
      const request = createRequest('/student/dashboard');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Admin role access', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      });
    });

    it('allows admin to access /teacher routes', async () => {
      const request = createRequest('/teacher');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('allows admin to access /student routes', async () => {
      const request = createRequest('/student');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });
  });

  describe('User with no profile', () => {
    it('redirects to /login when user has no profile', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-no-profile' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createRequest('/student');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });
  });

  describe('Edge cases', () => {
    it('handles nested public routes', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/preface/overview');
      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it('handles query parameters on protected routes', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = createRequest('/student/dashboard?tab=progress');
      const response = await proxy(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('redirect=');
    });
  });
});
