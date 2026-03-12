/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonRenderer } from '../../../components/student/LessonRenderer';
import { usePhaseProgress } from '../../../hooks/usePhaseProgress';
import { usePhaseCompletion } from '../../../hooks/usePhaseCompletion';
import type { ContentBlock } from '@/types/curriculum';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock usePhaseProgress hook
vi.mock('@/hooks/usePhaseProgress', () => ({
  usePhaseProgress: vi.fn(() => ({
    data: null,
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

// Mock usePhaseCompletion hook
vi.mock('@/hooks/usePhaseCompletion', () => ({
  usePhaseCompletion: vi.fn(() => ({
    completePhase: vi.fn(),
    isCompleting: false,
    error: null,
  })),
}));

vi.mock('@/components/lesson/ActivityRenderer', () => ({
  ActivityRenderer: ({
    activityId,
    required,
  }: {
    activityId: string;
    required?: boolean;
  }) => (
    <div data-testid="activity-renderer">
      Activity renderer for {activityId}
      {required ? ' (required)' : ''}
    </div>
  ),
}));

vi.mock('@/components/lesson/PhaseRenderer', () => ({
  PhaseRenderer: ({
    contentBlocks,
    lessonId,
    phaseNumber,
  }: {
    contentBlocks: ContentBlock[];
    lessonId: string;
    phaseNumber: number;
  }) => (
    <div data-testid="phase-renderer">
      Shared renderer for {lessonId} phase {phaseNumber} with {contentBlocks.length} blocks
    </div>
  ),
}));

describe('LessonRenderer', () => {
  const mockLesson = {
    id: '123',
    unitNumber: 1,
    title: 'Introduction to Financial Statements',
    slug: 'intro-to-financial-statements',
    description: 'Learn the basics of financial statements',
    learningObjectives: [
      'Understand balance sheets',
      'Read income statements',
      'Analyze cash flow statements',
    ],
    orderIndex: 1,
    metadata: null,
  };

  const defaultProps = {
    currentPhaseNumber: 1,
    lessonSlug: 'intro-to-financial-statements',
  };

  it('renders lesson header with title and description', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [] as ContentBlock[],
        estimatedMinutes: 15,
        metadata: { phaseType: 'intro' as const },
      },
    ];
    
    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Financial Statements')).toBeInTheDocument();
    expect(screen.getByText('Learn the basics of financial statements')).toBeInTheDocument();
  });

  it('renders learning objectives', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [] as ContentBlock[],
        estimatedMinutes: 15,
        metadata: { phaseType: 'intro' as const },
      },
    ];
    
    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
    expect(screen.getAllByText('Understand balance sheets').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Read income statements').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analyze cash flow statements').length).toBeGreaterThan(0);
  });

  it('renders empty state when no phases', () => {
    render(<LessonRenderer lesson={mockLesson} phases={[]} currentPhaseNumber={99} lessonSlug="intro-to-financial-statements" />);

    expect(screen.getByText('Phase not found.')).toBeInTheDocument();
  });

  it('renders phases with titles and numbers', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [] as ContentBlock[],
        estimatedMinutes: 15,
        metadata: { phaseType: 'intro' as const },
      },
      {
        id: 'phase-2',
        phaseNumber: 2,
        title: 'Practice',
        contentBlocks: [] as ContentBlock[],
        estimatedMinutes: 30,
        metadata: { phaseType: 'practice' as const },
      },
    ];

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} currentPhaseNumber={2} lessonSlug="intro-to-financial-statements" />);

    expect(screen.getAllByText('Phase 1')).toHaveLength(1); // Only in stepper
    expect(screen.getAllByText('Phase 2')).toHaveLength(2); // One in stepper, one in content
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('renders markdown content blocks', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [
          {
            id: 'block-1',
            type: 'markdown' as const,
            content: 'This is markdown content',
          },
        ],
        estimatedMinutes: null,
        metadata: { phaseType: 'intro' as const },
      },
    ];

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByTestId('phase-renderer')).toHaveTextContent(
      'Shared renderer for intro-to-financial-statements phase 1 with 1 blocks',
    );
  });

  it('renders callout content blocks', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [
          {
            id: 'block-1',
            type: 'callout' as const,
            variant: 'why-this-matters' as const,
            content: 'This is important information',
          },
        ],
        estimatedMinutes: null,
        metadata: { phaseType: 'intro' as const },
      },
    ];

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByTestId('phase-renderer')).toHaveTextContent(
      'Shared renderer for intro-to-financial-statements phase 1 with 1 blocks',
    );
  });

  it('renders video content blocks', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [
          {
            id: 'block-1',
            type: 'video' as const,
            props: {
              videoUrl: 'https://example.com/video.mp4',
              duration: 300,
            },
          },
        ],
        estimatedMinutes: null,
        metadata: { phaseType: 'intro' as const },
      },
    ];

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByTestId('phase-renderer')).toHaveTextContent(
      'Shared renderer for intro-to-financial-statements phase 1 with 1 blocks',
    );
  });

  it('renders image content blocks', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [
          {
            id: 'block-1',
            type: 'image' as const,
            props: {
              imageUrl: 'https://example.com/image.png',
              alt: 'Example diagram',
            },
          },
        ],
        estimatedMinutes: null,
        metadata: { phaseType: 'intro' as const },
      },
    ];

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByTestId('phase-renderer')).toHaveTextContent(
      'Shared renderer for intro-to-financial-statements phase 1 with 1 blocks',
    );
  });

  it('renders activity content blocks', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Practice',
        contentBlocks: [
          {
            id: 'block-1',
            type: 'activity' as const,
            activityId: 'activity-123',
            required: true,
          },
        ],
        estimatedMinutes: null,
        metadata: { phaseType: 'practice' as const },
      },
    ];

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByTestId('phase-renderer')).toHaveTextContent(
      'Shared renderer for intro-to-financial-statements phase 1 with 1 blocks',
    );
  });

  it('renders a phase guidance shell for the current lesson phase', () => {
    const mockPhases = [
      {
        id: 'phase-2',
        phaseNumber: 2,
        title: 'Concept Intro',
        contentBlocks: [
          {
            id: 'block-1',
            type: 'markdown' as const,
            content: 'Work through the accounting logic.',
          },
        ],
        estimatedMinutes: 20,
        metadata: { phaseType: 'example' as const },
      },
    ];

    render(
      <LessonRenderer
        lesson={mockLesson}
        phases={mockPhases}
        currentPhaseNumber={2}
        lessonSlug="intro-to-financial-statements"
      />,
    );

    expect(screen.getByText('Phase Focus')).toBeInTheDocument();
    expect(screen.getByText(/explicit a\/l\/e reasoning/i)).toBeInTheDocument();
    expect(screen.getByText('This phase advances these lesson objectives')).toBeInTheDocument();
  });

  it('renders lesson without description', () => {
    const lessonWithoutDescription = {
      ...mockLesson,
      description: null,
    };
    
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [] as ContentBlock[],
        estimatedMinutes: 15,
        metadata: { phaseType: 'intro' as const },
      },
    ];

    render(<LessonRenderer lesson={lessonWithoutDescription} phases={mockPhases} {...defaultProps} />);

    expect(screen.getByText('Introduction to Financial Statements')).toBeInTheDocument();
    expect(screen.queryByText('Learn the basics of financial statements')).not.toBeInTheDocument();
  });

  it('automatically triggers completion for Read phases', () => {
    const mockPhases = [
      {
        id: 'phase-1',
        phaseNumber: 1,
        title: 'Introduction',
        contentBlocks: [],
      },
    ];
    const mockCompletePhase = vi.fn();
    vi.mocked(usePhaseCompletion).mockReturnValue({
      completePhase: mockCompletePhase,
      isCompleting: false,
      error: null,
    } as any);

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} {...defaultProps} />);

    expect(mockCompletePhase).toHaveBeenCalled();
  });

  it('disables Next Phase button when the current Do phase is not completed', () => {
    const mockPhases = [
      { 
        id: 'p1', 
        phaseNumber: 1, 
        title: 'P1',
        contentBlocks: [{ id: 'b1', type: 'activity' as const, activityId: 'act1', required: true }]
      },
      { id: 'p2', phaseNumber: 2, title: 'P2' },
    ];
    // Mock progress showing phase 1 is NOT completed
    vi.mocked(usePhaseProgress).mockReturnValue({
      data: { phases: [{ phaseId: 'p1', status: 'available' }] } as any,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} currentPhaseNumber={1} lessonSlug="slug" />);

    const nextButton = screen.getByRole('button', { name: /next phase/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables Next Phase button when the current phase is completed', () => {
    const mockPhases = [
      { id: 'p1', phaseNumber: 1, title: 'P1' },
      { id: 'p2', phaseNumber: 2, title: 'P2' },
    ];
    // Mock progress showing phase 1 IS completed
    vi.mocked(usePhaseProgress).mockReturnValue({
      data: { phases: [{ phaseId: 'p1', status: 'completed' }, { phaseId: 'p2', status: 'available' }] } as any,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} currentPhaseNumber={1} lessonSlug="slug" />);

    const nextButton = screen.getByRole('button', { name: /next phase/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('enables Next Phase button for Read phases even if not completed in DB', () => {
    const mockPhases = [
      { id: 'p1', phaseNumber: 1, title: 'P1', contentBlocks: [] }, // Read phase
      { id: 'p2', phaseNumber: 2, title: 'P2' },
    ];
    // Mock progress showing phase 1 is available (not yet completed)
    vi.mocked(usePhaseProgress).mockReturnValue({
      data: { phases: [{ phaseId: 'p1', status: 'available' }] } as any,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    render(<LessonRenderer lesson={mockLesson} phases={mockPhases} currentPhaseNumber={1} lessonSlug="slug" />);

    const nextButton = screen.getByRole('button', { name: /next phase/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('shows a lesson completion panel with continue-learning actions on the final completed phase', () => {
    const mockPhases = [
      { id: 'p1', phaseNumber: 1, title: 'P1' },
      { id: 'p2', phaseNumber: 2, title: 'P2' },
      { id: 'p3', phaseNumber: 3, title: 'P3' },
    ];

    vi.mocked(usePhaseProgress).mockReturnValue({
      data: {
        phases: [
          { phaseId: 'p1', status: 'completed' },
          { phaseId: 'p2', status: 'completed' },
          { phaseId: 'p3', status: 'completed' },
        ],
      } as any,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    render(
      <LessonRenderer
        lesson={mockLesson}
        phases={mockPhases}
        currentPhaseNumber={3}
        lessonSlug="intro-to-financial-statements"
        isLessonComplete
        recommendedLesson={{
          title: 'Next Lesson',
          slug: 'next-lesson',
          actionLabel: 'Start Lesson',
        }}
      />,
    );

    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute(
      'href',
      '/student/dashboard',
    );
    expect(screen.getByRole('link', { name: /start lesson/i })).toHaveAttribute(
      'href',
      '/student/lesson/next-lesson',
    );
  });
});
