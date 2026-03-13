import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notFound, redirect } from 'next/navigation';
import { render, screen } from '@testing-library/react';

const {
  mockRequireTeacherSessionClaims,
  mockFetchInternalQuery,
  mockTeacherLessonPlanPageContent,
} = vi.hoisted(() => ({
  mockRequireTeacherSessionClaims: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
  mockTeacherLessonPlanPageContent: vi.fn(
    (props: { empty: boolean; lesson: { title: string } }) => (
    <div data-testid="teacher-lesson-plan-shell">
      <span>{props.lesson.title}</span>
      <span>{props.empty ? 'empty' : 'ready'}</span>
    </div>
    ),
  ),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: mockRequireTeacherSessionClaims,
}));

vi.mock('@/lib/convex/server', async () => {
  const actual = await vi.importActual<typeof import('@/lib/convex/server')>(
    '@/lib/convex/server',
  );
  return {
    ...actual,
    fetchInternalQuery: mockFetchInternalQuery,
    internal: {
      teacher: {
        getTeacherLessonMonitoringData:
          'internal.teacher.getTeacherLessonMonitoringData',
      },
    },
  };
});

vi.mock('@/components/teacher/TeacherLessonPlanPageContent', () => ({
  TeacherLessonPlanPageContent: mockTeacherLessonPlanPageContent,
}));

const successResponse = {
  status: 'success' as const,
  unitNumber: 2,
  lesson: {
    id: 'lesson-2',
    unitNumber: 2,
    title: 'Lesson 2',
    slug: 'lesson-2',
    description: 'Lesson description',
    learningObjectives: ['Explain the workflow'],
    orderIndex: 2,
    metadata: { duration: 45 },
  },
  phases: [],
  unitLessons: [
    { id: 'lesson-1', title: 'Lesson 1', orderIndex: 1 },
    { id: 'lesson-2', title: 'Lesson 2', orderIndex: 2 },
  ],
};

const { default: TeacherLessonPage } = await import(
  '../../../../../../../app/teacher/units/[unitNumber]/lessons/[lessonId]/page'
);

describe('TeacherLessonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireTeacherSessionClaims.mockResolvedValue({
      sub: 'teacher_profile_1',
      username: 'teacher_one',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });
    mockFetchInternalQuery.mockResolvedValue(successResponse);
  });

  it('returns notFound for an invalid unit number', async () => {
    await expect(
      TeacherLessonPage({
        params: Promise.resolve({ unitNumber: 'abc', lessonId: 'lesson-1' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });

  it('loads the lesson drill-down from an internal teacher query', async () => {
    const page = await TeacherLessonPage({
      params: Promise.resolve({ unitNumber: '2', lessonId: 'lesson-2' }),
    });

    expect(page).toBeDefined();
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'internal.teacher.getTeacherLessonMonitoringData',
      {
        userId: 'teacher_profile_1',
        unitNumber: 2,
        lessonId: 'lesson-2',
      },
    );
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequireTeacherSessionClaims.mockRejectedValue(
      new Error(
        'NEXT_REDIRECT:/auth/login?redirect=/teacher/units/2/lessons/lesson-2',
      ),
    );

    await expect(
      TeacherLessonPage({
        params: Promise.resolve({ unitNumber: '2', lessonId: 'lesson-2' }),
      }),
    ).rejects.toThrow(
      'NEXT_REDIRECT:/auth/login?redirect=/teacher/units/2/lessons/lesson-2',
    );

    expect(mockRequireTeacherSessionClaims).toHaveBeenCalledWith(
      '/teacher/units/2/lessons/lesson-2',
    );
  });

  it('redirects teachers back to the dashboard when the query reports unauthorized', async () => {
    mockFetchInternalQuery.mockResolvedValue({ status: 'unauthorized' });

    await expect(
      TeacherLessonPage({
        params: Promise.resolve({ unitNumber: '2', lessonId: 'lesson-2' }),
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/teacher');

    expect(redirect).toHaveBeenCalledWith('/teacher');
  });

  it('returns notFound when the lesson is missing from the requested unit', async () => {
    mockFetchInternalQuery.mockResolvedValue({ status: 'not_found' });

    await expect(
      TeacherLessonPage({
        params: Promise.resolve({ unitNumber: '2', lessonId: 'lesson-missing' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });

  it('renders a stable empty-state shell when the lesson has no published phases', async () => {
    const page = await TeacherLessonPage({
      params: Promise.resolve({ unitNumber: '2', lessonId: 'lesson-2' }),
    });

    render(page);

    expect(screen.getByTestId('teacher-lesson-plan-shell')).toBeInTheDocument();
    expect(screen.getByText('Lesson 2')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
