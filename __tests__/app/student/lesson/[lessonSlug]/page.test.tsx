import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation';

import LessonPage from '../../../../../app/student/lesson/[lessonSlug]/page';

const { mockGetServerSessionClaims } = vi.hoisted(() => ({
  mockGetServerSessionClaims: vi.fn(),
}));
const { mockFetchQuery } = vi.hoisted(() => ({
  mockFetchQuery: vi.fn(),
}));
const { mockFetchInternalQuery } = vi.hoisted(() => ({
  mockFetchInternalQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth/server', () => ({
  getServerSessionClaims: mockGetServerSessionClaims,
}));

vi.mock('@/lib/convex/server', async () => {
  const actual = await vi.importActual<typeof import('@/lib/convex/server')>(
    '@/lib/convex/server',
  );
  return {
    ...actual,
    fetchQuery: mockFetchQuery,
    fetchInternalQuery: mockFetchInternalQuery,
    api: {
      api: {
        getLessonWithContent: 'api.api.getLessonWithContent',
        getFirstLessonSlug: 'api.api.getFirstLessonSlug',
        getLessonBySlugOrId: 'api.api.getLessonBySlugOrId',
      },
    },
    internal: {
      api: {
        canAccessPhase: 'internal.api.canAccessPhase',
      },
      activities: {
        getProfileById: 'internal.activities.getProfileById',
      },
      student: {
        getLessonProgress: 'internal.student.getLessonProgress',
      },
    },
  };
});

vi.mock('@/components/student/LessonRenderer', () => ({
  LessonRenderer: ({
    lesson,
    phases,
    currentPhaseNumber,
    lessonSlug,
  }: {
    lesson: { title: string };
    phases: unknown[];
    currentPhaseNumber: number;
    lessonSlug: string;
  }) => {
    const firstPhase = phases[0] as { contentBlocks?: unknown[] } | undefined;
    const firstBlock = firstPhase?.contentBlocks?.[0] ?? null;

    return (
      <div data-testid="lesson-renderer">
        <h1>{lesson.title}</h1>
        <div data-testid="phase-count">{phases.length}</div>
        <div data-testid="current-phase">{currentPhaseNumber}</div>
        <div data-testid="lesson-slug">{lessonSlug}</div>
        <pre data-testid="first-block">{JSON.stringify(firstBlock)}</pre>
      </div>
    );
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeConvexLesson(slug = 'test-lesson') {
  return {
    _id: 'cvx-lesson-1',
    unitNumber: 1,
    title: 'Test Lesson',
    slug,
    description: 'A test lesson',
    learningObjectives: ['Objective 1'],
    orderIndex: 1,
    metadata: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function makeConvexPhases(phaseCount = 3) {
  return Array.from({ length: phaseCount }, (_, i) => ({
    _id: `pv-${i + 1}`,
    lessonVersionId: 'lv-1',
    phaseNumber: i + 1,
    title: `Phase ${i + 1}`,
    estimatedMinutes: 10,
    createdAt: Date.now(),
    sections: [
      {
        _id: `ps-${i + 1}`,
        phaseVersionId: `pv-${i + 1}`,
        sequenceOrder: 1,
        sectionType: 'text',
        content: { markdown: `# Phase ${i + 1}` },
        createdAt: Date.now(),
      },
    ],
  }));
}

function makeConvexContent(slug = 'test-lesson', phaseCount = 3) {
  return {
    lesson: makeConvexLesson(slug),
    phases: makeConvexPhases(phaseCount),
  };
}

// ── Shared mock setup ─────────────────────────────────────────────────────────

function setupDefaultMocks() {
  mockGetServerSessionClaims.mockResolvedValue({
    sub: 'user-123',
    username: 'student',
    role: 'student',
    iat: 1,
    exp: 2,
  });

  mockFetchQuery.mockImplementation(async (name: unknown) => {
    if (name === 'api.api.getLessonWithContent') {
      return makeConvexContent();
    }
    if (name === 'api.api.getLessonBySlugOrId') {
      return { _id: 'cvx-lesson-1' };
    }
    return null;
  });

  mockFetchInternalQuery.mockImplementation(async (name: unknown) => {
    if (name === 'internal.activities.getProfileById') {
      return { _id: 'user-123', role: 'student' };
    }
    if (name === 'internal.api.canAccessPhase') {
      return true;
    }
    if (name === 'internal.student.getLessonProgress') {
      return { phases: [] };
    }
    return null;
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LessonPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupDefaultMocks();
  });

  it('renders lesson phases from Convex content', async () => {
    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '1' }),
    });
    render(page);
    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('phase-count')).toHaveTextContent('3');
  });

  it('redirects unauthenticated users to login', async () => {
    mockGetServerSessionClaims.mockResolvedValue(null);
    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'test-lesson' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });

  it('calls notFound when lesson is missing from Convex', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') return null;
      return null;
    });
    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'missing-lesson' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}
    expect(notFound).toHaveBeenCalled();
  });

  it('redirects legacy slug to first lesson when available', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') return null;
      if (name === 'api.api.getFirstLessonSlug') return 'unit-1-lesson-1';
      return null;
    });
    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'unit01-lesson01' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}
    expect(redirect).toHaveBeenCalledWith('/student/lesson/unit-1-lesson-1?phase=1');
  });

  it('shows no-phase error when lesson has zero phases in Convex', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') {
        return { lesson: makeConvexLesson(), phases: [] };
      }
      return null;
    });
    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({}),
    });
    render(page);
    expect(screen.getByText('Lesson Not Available')).toBeInTheDocument();
  });

  it('maps activity sections into activity content blocks', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') {
        return {
          lesson: makeConvexLesson(),
          phases: [
            {
              _id: 'pv-1',
              phaseNumber: 1,
              title: 'Phase 1',
              estimatedMinutes: 10,
              createdAt: Date.now(),
              sections: [
                {
                  _id: 'ps-activity',
                  phaseVersionId: 'pv-1',
                  sequenceOrder: 1,
                  sectionType: 'activity',
                  content: { activityId: 'cvx-activity-abc', required: true },
                  createdAt: Date.now(),
                },
              ],
            },
          ],
        };
      }
      if (name === 'api.api.getLessonBySlugOrId') return { _id: 'cvx-lesson-1' };
      return null;
    });
    mockFetchInternalQuery.mockImplementation(async (name: unknown) => {
      if (name === 'internal.activities.getProfileById') return { _id: 'user-123', role: 'student' };
      if (name === 'internal.api.canAccessPhase') return true;
      if (name === 'internal.student.getLessonProgress') return { phases: [] };
      return null;
    });

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '1' }),
    });
    render(page);

    const firstBlockText = screen.getByTestId('first-block').textContent ?? 'null';
    const firstBlock = JSON.parse(firstBlockText) as {
      type: string;
      activityId?: string;
      required?: boolean;
    };

    expect(firstBlock.type).toBe('activity');
    expect(firstBlock.activityId).toBe('cvx-activity-abc');
    expect(firstBlock.required).toBe(true);
  });

  it('falls back to markdown content for unsupported section types', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') {
        return {
          lesson: makeConvexLesson(),
          phases: [
            {
              _id: 'pv-1',
              phaseNumber: 1,
              title: 'Phase 1',
              estimatedMinutes: 10,
              createdAt: Date.now(),
              sections: [
                {
                  _id: 'ps-unsupported',
                  phaseVersionId: 'pv-1',
                  sequenceOrder: 1,
                  sectionType: 'unsupported',
                  content: { text: 'Fallback content' },
                  createdAt: Date.now(),
                },
              ],
            },
          ],
        };
      }
      if (name === 'api.api.getLessonBySlugOrId') return { _id: 'cvx-lesson-1' };
      return null;
    });
    mockFetchInternalQuery.mockImplementation(async (name: unknown) => {
      if (name === 'internal.activities.getProfileById') return { _id: 'user-123', role: 'student' };
      if (name === 'internal.api.canAccessPhase') return true;
      if (name === 'internal.student.getLessonProgress') return { phases: [] };
      return null;
    });

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '1' }),
    });
    render(page);

    const firstBlockText = screen.getByTestId('first-block').textContent ?? 'null';
    const firstBlock = JSON.parse(firstBlockText) as { type: string; content?: string };

    expect(firstBlock.type).toBe('markdown');
    expect(firstBlock.content).toBe('Fallback content');
  });

  it('shows access error page when Convex access check throws', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') return makeConvexContent();
      if (name === 'api.api.getLessonBySlugOrId') return { _id: 'cvx-lesson-1' };
      return null;
    });
    mockFetchInternalQuery.mockImplementation(async (name: unknown) => {
      if (name === 'internal.activities.getProfileById') return { _id: 'user-123', role: 'student' };
      if (name === 'internal.api.canAccessPhase') throw new Error('Database error');
      return null;
    });

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '1' }),
    });
    render(page);
    expect(screen.getByText('Unable to Verify Access')).toBeInTheDocument();
  });

  it('allows teacher role to bypass phase locking', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') return makeConvexContent();
      return null;
    });
    mockFetchInternalQuery.mockImplementation(async (name: unknown) => {
      if (name === 'internal.activities.getProfileById') return { _id: 'user-123', role: 'teacher' };
      return null;
    });

    const page = await LessonPage({
      params: Promise.resolve({ lessonSlug: 'test-lesson' }),
      searchParams: Promise.resolve({ phase: '3' }),
    });
    render(page);
    expect(screen.getByTestId('current-phase')).toHaveTextContent('3');
    // Only getLessonWithContent + getProfileById called (no access checks for teachers)
    expect(mockFetchQuery).toHaveBeenCalledTimes(1);
    expect(mockFetchInternalQuery).toHaveBeenCalledTimes(1);
  });

  it('redirects to the first incomplete phase using Convex lesson progress', async () => {
    mockFetchQuery.mockImplementation(async (name: unknown) => {
      if (name === 'api.api.getLessonWithContent') return makeConvexContent();
      if (name === 'api.api.getLessonBySlugOrId') return { _id: 'cvx-lesson-1' };
      return null;
    });
    mockFetchInternalQuery.mockImplementation(async (name: unknown) => {
      if (name === 'internal.activities.getProfileById') return { _id: 'user-123', role: 'student' };
      if (name === 'internal.student.getLessonProgress') {
        return {
          phases: [
            { phaseNumber: 1, status: 'completed' },
            { phaseNumber: 2, status: 'completed' },
            { phaseNumber: 3, status: 'available' },
          ],
        };
      }
      if (name === 'internal.api.canAccessPhase') return true;
      return null;
    });

    try {
      await LessonPage({
        params: Promise.resolve({ lessonSlug: 'test-lesson' }),
        searchParams: Promise.resolve({}),
      });
    } catch {}

    expect(redirect).toHaveBeenCalledWith('/student/lesson/test-lesson?phase=3');
  });
});
