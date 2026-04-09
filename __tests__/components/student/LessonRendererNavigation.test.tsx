import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  learningObjectives: ['Understand double-entry bookkeeping', 'Learn the accounting equation'],
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
        type: 'markdown',
        id: 'block-1',
        content: 'Welcome to the lesson',
        required: false,
      },
    ],
    estimatedMinutes: 10,
    metadata: { phaseType: 'intro' },
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Phase 2: Practice',
    contentBlocks: [
      {
        type: 'activity',
        id: 'block-2',
        content: { activityId: 'test-activity' },
        required: true,
      },
    ],
    estimatedMinutes: 20,
    metadata: { phaseType: 'practice' },
  },
];

describe('LessonRenderer', () => {
  describe('breadcrumb navigation', () => {
    it('shows breadcrumb with Dashboard link and lesson title', () => {
      render(
        <LessonRenderer
          lesson={mockLesson}
          phases={mockPhases}
          currentPhaseNumber={1}
          lessonSlug={mockLesson.slug}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      const titleElements = screen.getAllByText(mockLesson.title);
      expect(titleElements.length).toBeGreaterThan(0);
    });

    it('Dashboard breadcrumb links to student dashboard', () => {
      render(
        <LessonRenderer
          lesson={mockLesson}
          phases={mockPhases}
          currentPhaseNumber={1}
          lessonSlug={mockLesson.slug}
        />
      );

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/student/dashboard');
    });
  });

  describe('lesson completion state', () => {
    it('shows Back to Dashboard link when lesson is complete', () => {
      render(
        <LessonRenderer
          lesson={mockLesson}
          phases={mockPhases}
          currentPhaseNumber={2}
          lessonSlug={mockLesson.slug}
          isLessonComplete={true}
        />
      );

      const backToDashboardLink = screen.getByText('Back to Dashboard').closest('a');
      expect(backToDashboardLink).toHaveAttribute('href', '/student/dashboard');
    });

    it('shows recommended lesson link when available', () => {
      const recommendedLesson = {
        slug: 'next-lesson',
        actionLabel: 'Continue to Next Lesson',
      };

      render(
        <LessonRenderer
          lesson={mockLesson}
          phases={mockPhases}
          currentPhaseNumber={2}
          lessonSlug={mockLesson.slug}
          isLessonComplete={true}
          recommendedLesson={recommendedLesson}
        />
      );

      expect(screen.getByText('Continue to Next Lesson')).toBeInTheDocument();
      const nextLessonLink = screen.getByText('Continue to Next Lesson').closest('a');
      expect(nextLessonLink).toHaveAttribute('href', '/student/lesson/next-lesson');
    });
  });
});

