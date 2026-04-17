import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonRendererErrorBoundary } from '@/components/lesson/LessonRendererErrorBoundary';
import { LessonRenderer } from '@/components/student/LessonRenderer';

vi.mock('@/hooks/usePhaseProgress', () => ({
  usePhaseProgress: () => ({
    data: { phases: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePhaseCompletion', () => ({
  usePhaseCompletion: () => ({
    completePhase: vi.fn(),
    isCompleting: false,
  }),
}));

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    profile: { role: 'student' },
    loading: false,
  }),
}));

const mockLesson = {
  id: 'lesson-1',
  unitNumber: 1,
  title: 'Introduction to Accounting',
  slug: 'intro-to-accounting',
  description: 'Learn the basics of accounting',
  learningObjectives: ['Understand double-entry bookkeeping'],
  orderIndex: 1,
  metadata: null,
};

const mockPhases = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'Phase 1: Getting Started',
    contentBlocks: [
      {
        type: 'markdown' as const,
        id: 'block-1',
        content: 'Welcome to the lesson',
      },
    ],
    estimatedMinutes: 10,
    metadata: { phaseType: 'intro' as const },
  },
];

describe('LessonRendererErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <LessonRendererErrorBoundary>
        <LessonRenderer
          lesson={mockLesson}
          phases={mockPhases}
          currentPhaseNumber={1}
          lessonSlug={mockLesson.slug}
        />
      </LessonRendererErrorBoundary>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Introduction to Accounting');
  });

  it('shows error fallback when child component throws', () => {
    const ErrorThrowingComponent = () => {
      throw new Error('Test error');
    };

    render(
      <LessonRendererErrorBoundary>
        <ErrorThrowingComponent />
      </LessonRendererErrorBoundary>
    );

    expect(screen.getByText('Something went wrong loading this lesson')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('shows refresh page button in error fallback', () => {
    const ErrorThrowingComponent = () => {
      throw new Error('Test error');
    };

    render(
      <LessonRendererErrorBoundary>
        <ErrorThrowingComponent />
      </LessonRendererErrorBoundary>
    );

    expect(screen.getByTestId('lesson-error-refresh-button')).toBeInTheDocument();
    expect(screen.getByText('Refresh page')).toBeInTheDocument();
  });

  it('shows back to dashboard button in error fallback', () => {
    const ErrorThrowingComponent = () => {
      throw new Error('Test error');
    };

    render(
      <LessonRendererErrorBoundary>
        <ErrorThrowingComponent />
      </LessonRendererErrorBoundary>
    );

    expect(screen.getByTestId('lesson-error-dashboard-button')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('dashboard button has onClick handler', () => {
    const ErrorThrowingComponent = () => {
      throw new Error('Test error');
    };

    render(
      <LessonRendererErrorBoundary>
        <ErrorThrowingComponent />
      </LessonRendererErrorBoundary>
    );

    const dashboardButton = screen.getByTestId('lesson-error-dashboard-button');
    expect(dashboardButton).toBeInstanceOf(HTMLButtonElement);
  });
});