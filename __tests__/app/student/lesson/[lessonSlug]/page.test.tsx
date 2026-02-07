import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation';

import LessonPage from '../../../../../app/student/lesson/[lessonSlug]/page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    query: {
      lessonVersions: { findMany: vi.fn() },
      phaseVersions: { findMany: vi.fn() },
      phaseSections: { findMany: vi.fn() },
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/components/student/LessonRenderer', () => ({
  LessonRenderer: ({ lesson, phases, currentPhaseNumber, lessonSlug }: { lesson: { title: string }; phases: unknown[]; currentPhaseNumber: number; lessonSlug: string }) => (
    <div data-testid="lesson-renderer">
      <h1>{lesson.title}</h1>
      <div data-testid="phase-count">{phases.length}</div>
      <div data-testid="current-phase">{currentPhaseNumber}</div>
      <div data-testid="lesson-slug">{lessonSlug}</div>
    </div>
  ),
}));

const baseLesson = {
  id: '123',
  unitNumber: 1,
  title: 'Base Lesson',
  slug: 'test-lesson',
  description: 'Base description',
  learningObjectives: ['Objective 1'],
  orderIndex: 1,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockDbSelect(lessonResult: unknown[] = [baseLesson], profileRole: 'student' | 'teacher' | 'admin' = 'student') {
  return async () => {
    const { db } = await import('@/lib/db/drizzle');
    const limitLesson = vi.fn().mockResolvedValue(lessonResult);
    const limitProfile = vi.fn().mockResolvedValue([{ id: 'user-123', role: profileRole }]);
    const whereLesson = vi.fn().mockReturnValue({ limit: limitLesson });
    const whereProfile = vi.fn().mockReturnValue({ limit: limitProfile });
    const fromLesson = vi.fn().mockReturnValue({ where: whereLesson });
    const fromProfile = vi.fn().mockReturnValue({ where: whereProfile });
    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) return { from: fromLesson } as never;
      return { from: fromProfile } as never;
    });
  };
}

async function mockVersionedPhases(phaseCount = 3) {
  const { db } = await import('@/lib/db/drizzle');
  vi.mocked(db.query.lessonVersions.findMany).mockResolvedValue([
    {
      id: 'lv-1',
      lessonId: '123',
      version: 1,
      title: 'Versioned Lesson',
      description: 'Versioned description',
      status: 'published',
      createdAt: new Date(),
    },
  ] as never);

  const phases = Array.from({ length: phaseCount }).map((_, i) => ({
    id: `pv-${i + 1}`,
    lessonVersionId: 'lv-1',
    phaseNumber: i + 1,
    title: `Phase ${i + 1}`,
    estimatedMinutes: 10,
    createdAt: new Date(),
  }));
  vi.mocked(db.query.phaseVersions.findMany).mockResolvedValue(phases as never);
  vi.mocked(db.query.phaseSections.findMany).mockResolvedValue(
    phases.map((p) => ({
      id: `ps-${p.phaseNumber}`,
      phaseVersionId: p.id,
      sequenceOrder: 1,
      sectionType: 'text',
      content: { markdown: `# ${p.title}` },
      createdAt: new Date(),
    })) as never,
  );
}

describe('LessonPage', () => {
  beforeEach(async () => {
    vi.resetAllMocks();

    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    } as never);

    await mockDbSelect()();
    await mockVersionedPhases(3);
  });

  it('renders versioned lesson phase', async () => {
    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '1' }),
    });
    render(page);
    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
    expect(screen.getByText('Versioned Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('phase-count')).toHaveTextContent('3');
  });

  it('redirects unauthenticated users to login', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as never);

    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'test-lesson' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}

    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('calls notFound when lesson is missing', async () => {
    await mockDbSelect([])();
    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'missing-lesson' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}
    expect(notFound).toHaveBeenCalled();
  });

  it('redirects legacy slug to first lesson when available', async () => {
    const { db } = await import('@/lib/db/drizzle');
    const limitMissing = vi.fn().mockResolvedValue([]);
    const whereMissing = vi.fn().mockReturnValue({ limit: limitMissing });
    const fromMissing = vi.fn().mockReturnValue({ where: whereMissing });
    const limitFirst = vi.fn().mockResolvedValue([{ slug: 'foundations-ledger-basics' }]);
    const orderByFirst = vi.fn().mockReturnValue({ limit: limitFirst });
    const fromFirst = vi.fn().mockReturnValue({ orderBy: orderByFirst });
    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) return { from: fromMissing } as never;
      return { from: fromFirst } as never;
    });

    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'unit01-lesson01' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}
    expect(redirect).toHaveBeenCalledWith('/student/lesson/foundations-ledger-basics?phase=1');
  });

  it('shows no-phase error when versioned phases are absent', async () => {
    const { db } = await import('@/lib/db/drizzle');
    vi.mocked(db.query.phaseVersions.findMany).mockResolvedValue([] as never);

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({}),
    });
    render(page);
    expect(screen.getByText('Lesson Not Available')).toBeInTheDocument();
  });

  it('shows access error page when RPC fails', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    } as never);

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '1' }),
    });
    render(page);
    expect(screen.getByText('Unable to Verify Access')).toBeInTheDocument();
  });

  it('allows teacher role to bypass phase locking', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const rpc = vi.fn();
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'teacher@example.com' } },
          error: null,
        }),
      },
      rpc,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    } as never);
    await mockDbSelect([baseLesson], 'teacher')();

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '3' }),
    });
    render(page);
    expect(screen.getByTestId('current-phase')).toHaveTextContent('3');
    expect(rpc).not.toHaveBeenCalled();
  });
});
