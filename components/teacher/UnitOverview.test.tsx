import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnitOverview } from './UnitOverview';
import { type Lesson } from '@/lib/db/schema/validators';

describe('UnitOverview', () => {
  const mockLesson: Lesson = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    unitNumber: 1,
    title: 'Balance by Design',
    slug: 'balance-by-design',
    description: 'Learn the fundamental accounting equation and how assets, liabilities, and equity work together.',
    learningObjectives: [
      'Understand the accounting equation',
      'Identify assets, liabilities, and equity',
      'Apply the accounting equation to real-world scenarios'
    ],
    orderIndex: 1,
    metadata: {
      duration: 120,
      durationLabel: '3-4 weeks',
      difficulty: 'beginner',
      tags: ['accounting', 'fundamentals'],
      unitContent: {
        drivingQuestion: {
          question: 'How can a business track what it owns, what it owes, and what belongs to its owners?',
          context: 'Students explore the fundamental accounting equation through a real business scenario.'
        },
        objectives: {
          content: [
            'Financial statement analysis',
            'Business decision-making',
            'Professional communication'
          ],
          skills: [
            'Excel table formatting',
            'Excel SUMIF formulas',
            'Excel conditional formatting',
            'Data visualization techniques'
          ],
          deliverables: [
            'Complete financial statement',
            'Professional presentation'
          ]
        },
        assessment: {
          performanceTask: {
            title: 'Create a Balance Sheet',
            description: 'Students create a complete balance sheet for a business scenario',
            requirements: [
              'Accurate asset classification',
              'Proper liability categorization',
              'Correct equity calculation'
            ],
            context: 'Real-world business scenario'
          },
          milestones: [
            {
              id: 'milestone-1',
              day: 5,
              title: 'Asset Identification',
              description: 'Students identify and classify business assets',
              criteria: ['Correctly classify 5 assets', 'Explain asset types']
            },
            {
              id: 'milestone-2',
              day: 10,
              title: 'Complete Equation Application',
              description: 'Apply accounting equation to scenarios',
              criteria: ['Balance equation correctly', 'Show all work']
            }
          ],
          rubric: []
        },
        learningSequence: {
          weeks: []
        },
        prerequisites: {
          knowledge: ['Basic math'],
          technology: ['Excel'],
          resources: []
        }
      }
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  it('renders unit title and number', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText('Unit 1: Balance by Design')).toBeInTheDocument();
  });

  it('renders unit description', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText(/Learn the fundamental accounting equation/)).toBeInTheDocument();
  });

  it('renders unit meta information', () => {
    render(<UnitOverview lesson={mockLesson} gradeLevel="9-12" course="Business Operations" />);

    expect(screen.getByText(/3-4 weeks/)).toBeInTheDocument();
    expect(screen.getByText(/9-12/)).toBeInTheDocument();
    expect(screen.getByText(/Business Operations/)).toBeInTheDocument();
  });

  it('renders essential question when available', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText('Essential Question')).toBeInTheDocument();
    expect(screen.getByText(/How can a business track what it owns/)).toBeInTheDocument();
  });

  it('renders learning targets from learning objectives', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText('Learning Targets')).toBeInTheDocument();
    expect(screen.getByText('Understand the accounting equation')).toBeInTheDocument();
    expect(screen.getByText('Identify assets, liabilities, and equity')).toBeInTheDocument();
  });

  it('renders Excel skills when available', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText('Excel Skills')).toBeInTheDocument();
    expect(screen.getByText(/Excel table formatting/)).toBeInTheDocument();
    expect(screen.getByText(/Excel SUMIF formulas/)).toBeInTheDocument();
  });

  it('renders business skills from objectives', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText('Business Skills')).toBeInTheDocument();
    expect(screen.getByText('Financial statement analysis')).toBeInTheDocument();
    expect(screen.getByText('Business decision-making')).toBeInTheDocument();
  });

  it('renders key assessments from performance task and milestones', () => {
    render(<UnitOverview lesson={mockLesson} />);

    expect(screen.getByText('Key Assessments')).toBeInTheDocument();
    expect(screen.getByText('Create a Balance Sheet')).toBeInTheDocument();
    expect(screen.getByText(/Asset Identification \(Day 5\)/)).toBeInTheDocument();
    expect(screen.getByText(/Complete Equation Application \(Day 10\)/)).toBeInTheDocument();
  });

  it('renders capstone connection', () => {
    const customCapstone = 'This unit provides the foundation for creating complete financial models in the capstone project.';
    render(<UnitOverview lesson={mockLesson} capstoneConnection={customCapstone} />);

    expect(screen.getByText('Connection to Capstone Project')).toBeInTheDocument();
    expect(screen.getByText(customCapstone)).toBeInTheDocument();
  });

  it('handles lesson without unit content gracefully', () => {
    const minimalLesson: Lesson = {
      ...mockLesson,
      metadata: null,
      learningObjectives: null
    };

    render(<UnitOverview lesson={minimalLesson} />);

    // Should still render basic information
    expect(screen.getByText('Unit 1: Balance by Design')).toBeInTheDocument();
    expect(screen.getByText(/Learn the fundamental accounting equation/)).toBeInTheDocument();
  });

  it('uses default values for optional props', () => {
    render(<UnitOverview lesson={mockLesson} />);

    // Default grade level and course should be rendered
    expect(screen.getByText(/9-12/)).toBeInTheDocument();
    expect(screen.getByText(/Business Operations/)).toBeInTheDocument();
  });

  it('renders correct number of learning targets', () => {
    render(<UnitOverview lesson={mockLesson} />);

    const learningTargets = mockLesson.learningObjectives;
    expect(learningTargets).toHaveLength(3);

    learningTargets?.forEach(target => {
      expect(screen.getByText(target)).toBeInTheDocument();
    });
  });

  it('filters Excel skills correctly', () => {
    render(<UnitOverview lesson={mockLesson} />);

    // Should show Excel-related skills
    expect(screen.getByText(/Excel table formatting/)).toBeInTheDocument();
    expect(screen.getByText(/Excel SUMIF formulas/)).toBeInTheDocument();

    // Should not show non-Excel skills in Excel section
    const excelSkillsSection = screen.getByText('Excel Skills').closest('div');
    expect(excelSkillsSection).not.toHaveTextContent('Financial statement analysis');
  });
});
