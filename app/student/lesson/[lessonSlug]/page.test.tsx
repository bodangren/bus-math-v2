import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import LessonPage from './page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(),
  },
}));

// Mock LessonRenderer component
vi.mock('@/components/student/LessonRenderer', () => ({
  LessonRenderer: ({ lesson, phases }: { lesson: { title: string }; phases: unknown[] }) => (
    <div data-testid="lesson-renderer">
      <h1>{lesson.title}</h1>
      <div data-testid="phase-count">{phases.length}</div>
    </div>
  ),
}));

describe('LessonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders lesson with phases when found', async () => {
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

    // Mock the query chain
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

    const params = Promise.resolve({ lessonSlug: 'test-lesson' });
    const result = await LessonPage({ params });

    render(result);

    expect(screen.getByTestId('lesson-renderer')).toBeInTheDocument();
    expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('phase-count')).toHaveTextContent('2');
    expect(notFound).not.toHaveBeenCalled();
  });

  it('calls notFound when lesson does not exist', async () => {
    // Mock database query to return empty result
    const { db } = await import('@/lib/db/drizzle');
    const limitMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(db.select).mockReturnValue({ from: fromMock } as never);

    const params = Promise.resolve({ lessonSlug: 'non-existent' });

    try {
      await LessonPage({ params });
    } catch {
      // notFound() throws, so we catch it
    }

    expect(notFound).toHaveBeenCalled();
  });

  it('fetches lesson by slug correctly', async () => {
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

    const orderByMock = vi.fn().mockResolvedValue([]);
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

    const params = Promise.resolve({ lessonSlug: 'another-lesson' });
    const result = await LessonPage({ params });

    render(result);

    expect(screen.getByText('Another Lesson')).toBeInTheDocument();
    expect(screen.getByTestId('phase-count')).toHaveTextContent('0');
  });

  it('handles lesson with no phases', async () => {
    // Mock database query
    const { db } = await import('@/lib/db/drizzle');
    const mockLesson = {
      id: '789',
      unitNumber: 3,
      title: 'Lesson Without Phases',
      slug: 'lesson-without-phases',
      description: 'A lesson with no phases',
      learningObjectives: ['Learn something'],
      orderIndex: 3,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderByMock = vi.fn().mockResolvedValue([]);
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

    const params = Promise.resolve({ lessonSlug: 'lesson-without-phases' });
    const result = await LessonPage({ params });

    render(result);

    expect(screen.getByText('Lesson Without Phases')).toBeInTheDocument();
    expect(screen.getByTestId('phase-count')).toHaveTextContent('0');
  });
});
