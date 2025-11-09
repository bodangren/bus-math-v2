import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeacherLessonPlan } from './TeacherLessonPlan';
import { type Lesson, type Phase } from '@/lib/db/schema/validators';

describe('TeacherLessonPlan', () => {
  const mockLesson: Lesson = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    unitNumber: 1,
    title: 'Introduction to Accounting Equation',
    slug: 'intro-to-accounting-equation',
    description: 'Students will learn the fundamental accounting equation and how to apply it to real business scenarios.',
    learningObjectives: [
      'Identify the key components of the accounting equation',
      'Explain why accurate financial records are essential',
      'Apply the accounting equation to business transactions'
    ],
    orderIndex: 1,
    metadata: {
      duration: 45,
      difficulty: 'beginner',
      tags: ['accounting-equation', 'fundamentals', 'business-transactions']
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockPhases: Phase[] = [
    {
      id: 'phase-1',
      lessonId: mockLesson.id,
      phaseNumber: 1,
      title: 'Hook',
      contentBlocks: [
        {
          id: '1',
          type: 'markdown',
          content: 'Students watch an introduction video about a startup business.'
        }
      ],
      estimatedMinutes: 8,
      metadata: {
        color: 'red',
        icon: 'play',
        phaseType: 'intro'
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 'phase-2',
      lessonId: mockLesson.id,
      phaseNumber: 2,
      title: 'Introduction',
      contentBlocks: [
        {
          id: '2',
          type: 'markdown',
          content: 'Brief overview of the accounting equation.'
        },
        {
          id: '3',
          type: 'callout',
          variant: 'why-this-matters',
          content: 'Understanding the accounting equation is foundational to all business operations.'
        }
      ],
      estimatedMinutes: 10,
      metadata: {
        color: 'blue',
        icon: 'book',
        phaseType: 'intro'
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }
  ];

  it('renders lesson title and number', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Unit 1 - Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Accounting Equation')).toBeInTheDocument();
  });

  it('renders lesson duration', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('45 minutes')).toBeInTheDocument();
  });

  it('renders learning objectives', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
    expect(screen.getByText(/Identify the key components/)).toBeInTheDocument();
    expect(screen.getByText(/Explain why accurate financial records/)).toBeInTheDocument();
  });

  it('renders key concepts from tags', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Key Concepts')).toBeInTheDocument();
    expect(screen.getByText('accounting-equation')).toBeInTheDocument();
    expect(screen.getByText('fundamentals')).toBeInTheDocument();
  });

  it('renders teaching strategies', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Teaching Strategies')).toBeInTheDocument();
    expect(screen.getByText('Interactive instruction')).toBeInTheDocument();
    expect(screen.getByText('Guided practice')).toBeInTheDocument();
  });

  it('renders lesson rationale from description', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Lesson Rationale')).toBeInTheDocument();
    expect(screen.getByText(/Students will learn the fundamental accounting equation/)).toBeInTheDocument();
  });

  it('renders lesson phases when provided', () => {
    render(<TeacherLessonPlan lesson={mockLesson} phases={mockPhases} lessonNumber={1} />);

    expect(screen.getByText('Lesson Phases')).toBeInTheDocument();
    expect(screen.getByText('Phase 1: Hook')).toBeInTheDocument();
    expect(screen.getByText('Phase 2: Introduction')).toBeInTheDocument();
  });

  it('renders phase content blocks', () => {
    render(<TeacherLessonPlan lesson={mockLesson} phases={mockPhases} lessonNumber={1} />);

    expect(screen.getByText(/Students watch an introduction video/)).toBeInTheDocument();
    expect(screen.getByText(/Brief overview of the accounting equation/)).toBeInTheDocument();
  });

  it('renders callout blocks with correct styling', () => {
    render(<TeacherLessonPlan lesson={mockLesson} phases={mockPhases} lessonNumber={1} />);

    expect(screen.getByText('Why This Matters')).toBeInTheDocument();
    expect(screen.getByText(/Understanding the accounting equation is foundational/)).toBeInTheDocument();
  });

  it('displays phase estimated minutes', () => {
    render(<TeacherLessonPlan lesson={mockLesson} phases={mockPhases} lessonNumber={1} />);

    expect(screen.getByText('8 min')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();
  });

  it('renders differentiation strategies', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Differentiation Strategies')).toBeInTheDocument();
    expect(screen.getByText('ELL Support')).toBeInTheDocument();
    expect(screen.getByText('Special Needs')).toBeInTheDocument();
    expect(screen.getByText('Gifted Extension')).toBeInTheDocument();
  });

  it('renders required materials section', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    expect(screen.getByText('Required Materials')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Physical Materials')).toBeInTheDocument();
  });

  it('calls onNavigate when navigation buttons clicked', async () => {
    const mockNavigate = vi.fn();
    const user = userEvent.setup();

    render(
      <TeacherLessonPlan
        lesson={mockLesson}
        lessonNumber={1}
        onNavigate={mockNavigate}
      />
    );

    const prevButton = screen.getByTitle('Previous lesson');
    const nextButton = screen.getByTitle('Next lesson');

    await user.click(prevButton);
    expect(mockNavigate).toHaveBeenCalledWith('prev');

    await user.click(nextButton);
    expect(mockNavigate).toHaveBeenCalledWith('next');
  });

  it('calls onLessonChange when lesson selector changed', async () => {
    const mockLessonChange = vi.fn();
    const user = userEvent.setup();

    const availableLessons = [
      { number: 1, title: 'Introduction' },
      { number: 2, title: 'Core Concepts' },
      { number: 3, title: 'Practice' }
    ];

    render(
      <TeacherLessonPlan
        lesson={mockLesson}
        lessonNumber={1}
        availableLessons={availableLessons}
        onLessonChange={mockLessonChange}
      />
    );

    const selector = screen.getByLabelText('Jump to:');
    await user.selectOptions(selector, '2');

    expect(mockLessonChange).toHaveBeenCalledWith(2);
  });

  it('renders teacher guidance for phases', () => {
    render(<TeacherLessonPlan lesson={mockLesson} phases={mockPhases} lessonNumber={1} />);

    // Multiple phases mean multiple guidance sections
    const teachingTips = screen.getAllByText('Teaching Tips');
    expect(teachingTips.length).toBeGreaterThan(0);

    const timingGuidance = screen.getAllByText('Timing Guidance');
    expect(timingGuidance.length).toBeGreaterThan(0);

    const keyMaterials = screen.getAllByText('Key Materials');
    expect(keyMaterials.length).toBeGreaterThan(0);
  });

  it('handles lesson without phases gracefully', () => {
    render(<TeacherLessonPlan lesson={mockLesson} lessonNumber={1} />);

    // Should render overview but not phases section
    expect(screen.getByText('Lesson Overview')).toBeInTheDocument();
    expect(screen.queryByText('Lesson Phases')).not.toBeInTheDocument();
  });

  it('handles lesson without learning objectives', () => {
    const lessonWithoutObjectives: Lesson = {
      ...mockLesson,
      learningObjectives: null
    };

    render(<TeacherLessonPlan lesson={lessonWithoutObjectives} lessonNumber={1} />);

    // Should still render but without objectives section
    expect(screen.getByText('Lesson Overview')).toBeInTheDocument();
    expect(screen.queryByText('Learning Objectives')).not.toBeInTheDocument();
  });

  it('uses default duration when not specified in metadata', () => {
    const lessonWithoutDuration: Lesson = {
      ...mockLesson,
      metadata: null
    };

    render(<TeacherLessonPlan lesson={lessonWithoutDuration} lessonNumber={1} />);

    expect(screen.getByText('45 minutes')).toBeInTheDocument();
  });

  it('renders all six phase numbers with correct icons', () => {
    const allPhases: Phase[] = [1, 2, 3, 4, 5, 6].map(num => ({
      id: `phase-${num}`,
      lessonId: mockLesson.id,
      phaseNumber: num,
      title: `Phase ${num}`,
      contentBlocks: [{ id: `${num}`, type: 'markdown' as const, content: `Phase ${num} content` }],
      estimatedMinutes: 10,
      metadata: { phaseType: 'intro' as const },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    render(<TeacherLessonPlan lesson={mockLesson} phases={allPhases} lessonNumber={1} />);

    // Verify all phases render
    expect(screen.getByText('Phase 1: Phase 1')).toBeInTheDocument();
    expect(screen.getByText('Phase 6: Phase 6')).toBeInTheDocument();
  });
});
