import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonRenderer } from './LessonRenderer';
import type { ContentBlock } from '@/lib/db/schema/phases';

// Mock usePhaseProgress hook
vi.mock('@/hooks/usePhaseProgress', () => ({
  usePhaseProgress: vi.fn(() => ({
    data: null,
    isLoading: false,
    refetch: vi.fn(),
  })),
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
    expect(screen.getByText('Understand balance sheets')).toBeInTheDocument();
    expect(screen.getByText('Read income statements')).toBeInTheDocument();
    expect(screen.getByText('Analyze cash flow statements')).toBeInTheDocument();
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

    expect(screen.getByText('This is markdown content')).toBeInTheDocument();
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

    expect(screen.getByText('why this matters')).toBeInTheDocument();
    expect(screen.getByText('This is important information')).toBeInTheDocument();
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

    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/video.mp4')).toBeInTheDocument();
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

    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Example diagram')).toBeInTheDocument();
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

    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText(/activity-123/i)).toBeInTheDocument();
    expect(screen.getByText('(Required)')).toBeInTheDocument();
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

  it('renders lesson without learning objectives', () => {
    const lessonWithoutObjectives = {
      ...mockLesson,
      learningObjectives: null,
    };

    render(<LessonRenderer lesson={lessonWithoutObjectives} phases={[]} {...defaultProps} />);

    expect(screen.queryByText('Learning Objectives')).not.toBeInTheDocument();
  });
});