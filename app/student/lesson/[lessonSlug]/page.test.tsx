import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation';
import LessonPage from './page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock LessonRenderer component
vi.mock('@/components/student/LessonRenderer', () => ({
  LessonRenderer: ({
    lesson,
    phases,
    currentPhaseNumber,
    lessonSlug
  }: {
    lesson: { title: string };
    phases: unknown[];
    currentPhaseNumber: number;
    lessonSlug: string;
  }) => (
    <div data-testid="lesson-renderer">
      <h1>{lesson.title}</h1>
      <div data-testid="phase-count">{phases.length}</div>
      <div data-testid="current-phase">{currentPhaseNumber}</div>
      <div data-testid="lesson-slug">{lessonSlug}</div>
    </div>
  ),
}));

describe('LessonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders lesson with authorized phase when found', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '123',
      unitNumber: 1,
      title: 'Test Lesson',
      slug: 'test-lesson',
      description: 'Test description',
      learningObjectives: ['Objective 1', 'Objective 2'],
      orderIndex: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases = [
      {
        id: 'phase-1',
        lessonId: '123',
        phaseNumber: 1,
        title: 'Phase 1',
        contentBlocks: [],
        estimatedMinutes: 30,
        metadata: { phaseType: 'intro' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phase-2',
        lessonId: '123',
        phaseNumber: 2,
        title: 'Phase 2',
        contentBlocks: [],
        estimatedMinutes: 45,
        metadata: { phaseType: 'practice' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockProfile = {
      id: 'user-123',
      role: 'student' as const,
    };

    // Mock the query chain
    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMockForLesson = vi.fn().mockResolvedValue([mockLesson]);
    const limitMockForProfile = vi.fn().mockResolvedValue([mockProfile]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMockForLesson });
    const whereMockForProfile = vi.fn().mockReturnValue({ limit: limitMockForProfile });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });
    const fromMockForProfile = vi.fn().mockReturnValue({ where: whereMockForProfile });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: fromMockForLesson } as never;
      } else if (callCount === 2) {
        return { from: fromMockForPhases } as never;
      } else {
        return { from: fromMockForProfile } as never;
      }
    });

    const params = Promise.resolve({ lessonSlug: 'test-lesson' });
    const searchParams = Promise.resolve({ phase: '1' });
    const result = await LessonPage({ params, searchParams });

    render(result);

    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('phase-count')).toHaveTextContent('2');
    expect(screen.getByTestId('current-phase')).toHaveTextContent('1');
    expect(notFound).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to login when user is not authenticated', async () => {
    // Mock Supabase auth to return no user
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Not authenticated' },
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    const params = Promise.resolve({ lessonSlug: 'test-lesson' });
    const searchParams = Promise.resolve({});

    try {
      await LessonPage({ params, searchParams });
    } catch {
      // redirect() throws, so we catch it
    }

    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('calls notFound when lesson does not exist', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query to return empty result
    const { db } = await import('@/lib/db/drizzle');
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as never);

    const params = Promise.resolve({ lessonSlug: 'non-existent' });
    const searchParams = Promise.resolve({});

    try {
      await LessonPage({ params, searchParams });
    } catch {
      // notFound() throws, so we catch it
    }

    expect(notFound).toHaveBeenCalled();
  });

  it('redirects to latest accessible phase when accessing locked phase', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: vi.fn()
        .mockResolvedValueOnce({ data: false, error: null }) // Phase 3 is locked
        .mockResolvedValueOnce({ data: false, error: null }) // Phase 3 check again
        .mockResolvedValueOnce({ data: true, error: null }), // Phase 2 is accessible
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '123',
      unitNumber: 1,
      title: 'Test Lesson',
      slug: 'test-lesson',
      description: 'Test description',
      learningObjectives: ['Objective 1'],
      orderIndex: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases = [
      {
        id: 'phase-1',
        lessonId: '123',
        phaseNumber: 1,
        title: 'Phase 1',
        contentBlocks: [],
        estimatedMinutes: 30,
        metadata: { phaseType: 'intro' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phase-2',
        lessonId: '123',
        phaseNumber: 2,
        title: 'Phase 2',
        contentBlocks: [],
        estimatedMinutes: 45,
        metadata: { phaseType: 'practice' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phase-3',
        lessonId: '123',
        phaseNumber: 3,
        title: 'Phase 3',
        contentBlocks: [],
        estimatedMinutes: 45,
        metadata: { phaseType: 'practice' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockProfile = {
      id: 'user-123',
      role: 'student' as const,
    };

    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMockForLesson = vi.fn().mockResolvedValue([mockLesson]);
    const limitMockForProfile = vi.fn().mockResolvedValue([mockProfile]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMockForLesson });
    const whereMockForProfile = vi.fn().mockReturnValue({ limit: limitMockForProfile });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });
    const fromMockForProfile = vi.fn().mockReturnValue({ where: whereMockForProfile });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: fromMockForLesson } as never;
      } else if (callCount === 2) {
        return { from: fromMockForPhases } as never;
      } else {
        return { from: fromMockForProfile } as never;
      }
    });

    const params = Promise.resolve({ lessonSlug: 'test-lesson' });
    const searchParams = Promise.resolve({ phase: '3' });

    try {
      await LessonPage({ params, searchParams });
    } catch {
      // redirect() throws, so we catch it
    }

    expect(redirect).toHaveBeenCalledWith('/student/lesson/test-lesson?phase=2');
  });

  it('defaults to phase 1 when no phase is specified', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '456',
      unitNumber: 2,
      title: 'Another Lesson',
      slug: 'another-lesson',
      description: null,
      learningObjectives: null,
      orderIndex: 2,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases = [
      {
        id: 'phase-1',
        lessonId: '456',
        phaseNumber: 1,
        title: 'Phase 1',
        contentBlocks: [],
        estimatedMinutes: 30,
        metadata: { phaseType: 'intro' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockProfile = {
      id: 'user-123',
      role: 'student' as const,
    };

    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMockForLesson = vi.fn().mockResolvedValue([mockLesson]);
    const limitMockForProfile = vi.fn().mockResolvedValue([mockProfile]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMockForLesson });
    const whereMockForProfile = vi.fn().mockReturnValue({ limit: limitMockForProfile });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });
    const fromMockForProfile = vi.fn().mockReturnValue({ where: whereMockForProfile });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: fromMockForLesson } as never;
      } else if (callCount === 2) {
        return { from: fromMockForPhases } as never;
      } else {
        return { from: fromMockForProfile } as never;
      }
    });

    const params = Promise.resolve({ lessonSlug: 'another-lesson' });
    const searchParams = Promise.resolve({});
    const result = await LessonPage({ params, searchParams });

    render(result);

    expect(screen.getByText('Another Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('current-phase')).toHaveTextContent('1');
  });

  it('shows error page when lesson has zero phases', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query - lesson exists but has no phases
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '789',
      unitNumber: 3,
      title: 'Empty Lesson',
      slug: 'empty-lesson',
      description: null,
      learningObjectives: null,
      orderIndex: 3,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases: never[] = []; // No phases

    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMock = vi.fn().mockResolvedValue([mockLesson]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      return {
        from: callCount === 1 ? fromMockForLesson : fromMockForPhases,
      } as never;
    });

    const params = Promise.resolve({ lessonSlug: 'empty-lesson' });
    const searchParams = Promise.resolve({});
    const result = await LessonPage({ params, searchParams });

    render(result);

    expect(screen.getByText('Lesson Not Available')).toBeInTheDocument();
    expect(screen.getByText(/does not have any phases configured/i)).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('shows error page when RPC fails', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '999',
      unitNumber: 4,
      title: 'RPC Error Lesson',
      slug: 'rpc-error-lesson',
      description: null,
      learningObjectives: null,
      orderIndex: 4,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases = [
      {
        id: 'phase-1',
        lessonId: '999',
        phaseNumber: 1,
        title: 'Phase 1',
        contentBlocks: [],
        estimatedMinutes: 30,
        metadata: { phaseType: 'intro' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockProfile = {
      id: 'user-123',
      role: 'student' as const,
    };

    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMockForLesson = vi.fn().mockResolvedValue([mockLesson]);
    const limitMockForProfile = vi.fn().mockResolvedValue([mockProfile]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMockForLesson });
    const whereMockForProfile = vi.fn().mockReturnValue({ limit: limitMockForProfile });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });
    const fromMockForProfile = vi.fn().mockReturnValue({ where: whereMockForProfile });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: fromMockForLesson } as never;
      } else if (callCount === 2) {
        return { from: fromMockForPhases } as never;
      } else {
        return { from: fromMockForProfile } as never;
      }
    });

    const params = Promise.resolve({ lessonSlug: 'rpc-error-lesson' });
    const searchParams = Promise.resolve({ phase: '1' });
    const result = await LessonPage({ params, searchParams });

    render(result);

    expect(screen.getByText('Unable to Verify Access')).toBeInTheDocument();
    expect(screen.getByText(/encountered an error while checking your access/i)).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('allows teachers to bypass phase locking', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'teacher-123', email: 'teacher@example.com' } },
          error: null,
        }),
      },
      // RPC should NOT be called for teachers
      rpc: vi.fn(),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '111',
      unitNumber: 1,
      title: 'Teacher Accessible Lesson',
      slug: 'teacher-lesson',
      description: 'Test description',
      learningObjectives: ['Objective 1'],
      orderIndex: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases = [
      {
        id: 'phase-1',
        lessonId: '111',
        phaseNumber: 1,
        title: 'Phase 1',
        contentBlocks: [],
        estimatedMinutes: 30,
        metadata: { phaseType: 'intro' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phase-2',
        lessonId: '111',
        phaseNumber: 2,
        title: 'Phase 2',
        contentBlocks: [],
        estimatedMinutes: 45,
        metadata: { phaseType: 'practice' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phase-3',
        lessonId: '111',
        phaseNumber: 3,
        title: 'Phase 3',
        contentBlocks: [],
        estimatedMinutes: 45,
        metadata: { phaseType: 'practice' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockProfile = {
      id: 'teacher-123',
      role: 'teacher' as const,
    };

    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMockForLesson = vi.fn().mockResolvedValue([mockLesson]);
    const limitMockForProfile = vi.fn().mockResolvedValue([mockProfile]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMockForLesson });
    const whereMockForProfile = vi.fn().mockReturnValue({ limit: limitMockForProfile });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });
    const fromMockForProfile = vi.fn().mockReturnValue({ where: whereMockForProfile });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: fromMockForLesson } as never;
      } else if (callCount === 2) {
        return { from: fromMockForPhases } as never;
      } else {
        return { from: fromMockForProfile } as never;
      }
    });

    const params = Promise.resolve({ lessonSlug: 'teacher-lesson' });
    const searchParams = Promise.resolve({ phase: '3' });
    const result = await LessonPage({ params, searchParams });

    render(result);

    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
    expect(screen.getByText('Teacher Accessible Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('current-phase')).toHaveTextContent('3');
    // Verify RPC was NOT called for teacher
    expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('allows admins to bypass phase locking', async () => {
    // Mock Supabase auth
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-123', email: 'admin@example.com' } },
          error: null,
        }),
      },
      // RPC should NOT be called for admins
      rpc: vi.fn(),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as never);

    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '222',
      unitNumber: 1,
      title: 'Admin Accessible Lesson',
      slug: 'admin-lesson',
      description: 'Test description',
      learningObjectives: ['Objective 1'],
      orderIndex: 1,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockPhases = [
      {
        id: 'phase-1',
        lessonId: '222',
        phaseNumber: 1,
        title: 'Phase 1',
        contentBlocks: [],
        estimatedMinutes: 30,
        metadata: { phaseType: 'intro' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'phase-2',
        lessonId: '222',
        phaseNumber: 2,
        title: 'Phase 2',
        contentBlocks: [],
        estimatedMinutes: 45,
        metadata: { phaseType: 'practice' as const },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockProfile = {
      id: 'admin-123',
      role: 'admin' as const,
    };

    const orderByMock = vi.fn().mockResolvedValue(mockPhases);
    const whereMockForPhases = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const limitMockForLesson = vi.fn().mockResolvedValue([mockLesson]);
    const limitMockForProfile = vi.fn().mockResolvedValue([mockProfile]);
    const whereMockForLesson = vi.fn().mockReturnValue({ limit: limitMockForLesson });
    const whereMockForProfile = vi.fn().mockReturnValue({ limit: limitMockForProfile });
    const fromMockForPhases = vi.fn().mockReturnValue({ where: whereMockForPhases });
    const fromMockForLesson = vi.fn().mockReturnValue({ where: whereMockForLesson });
    const fromMockForProfile = vi.fn().mockReturnValue({ where: whereMockForProfile });

    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { from: fromMockForLesson } as never;
      } else if (callCount === 2) {
        return { from: fromMockForPhases } as never;
      } else {
        return { from: fromMockForProfile } as never;
      }
    });

    const params = Promise.resolve({ lessonSlug: 'admin-lesson' });
    const searchParams = Promise.resolve({ phase: '2' });
    const result = await LessonPage({ params, searchParams });

    render(result);

    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
    expect(screen.getByText('Admin Accessible Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('current-phase')).toHaveTextContent('2');
    // Verify RPC was NOT called for admin
    expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
