import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnitLessonPlan } from './UnitLessonPlan';
import { type Lesson } from '@/lib/db/schema/validators';

describe('UnitLessonPlan', () => {
  const mockLesson: Lesson = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    unitNumber: 1,
    title: 'Balance by Design',
    slug: 'balance-by-design',
    description: 'Learn the fundamental accounting equation',
    learningObjectives: null,
    orderIndex: 1,
    metadata: {
      duration: 120,
      durationLabel: '3-4 weeks',
      difficulty: 'beginner',
      tags: ['accounting'],
      unitContent: {
        drivingQuestion: {
          question: 'How can a business track what it owns and owes?',
          context: 'Business scenario'
        },
        objectives: {
          content: ['Financial analysis', 'Business communication'],
          skills: ['Excel formulas', 'Data visualization'],
          deliverables: ['Financial statement']
        },
        assessment: {
          performanceTask: {
            title: 'Create Balance Sheet',
            description: 'Complete balance sheet for business',
            requirements: ['Accurate classification', 'Proper formatting'],
            context: 'Real business scenario'
          },
          milestones: [
            {
              id: 'm1',
              day: 5,
              title: 'Asset Identification',
              description: 'Identify assets',
              criteria: ['Classify 5 assets']
            }
          ],
          rubric: [
            {
              name: 'Accuracy',
              weight: '40%',
              exemplary: 'All correct',
              proficient: 'Most correct',
              developing: 'Some correct'
            }
          ]
        },
        learningSequence: {
          weeks: [
            {
              weekNumber: 1,
              title: 'Foundation Week',
              description: 'Build core concepts',
              days: []
            }
          ]
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

  it('renders unit title and description', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Unit 1: Balance by Design')).toBeInTheDocument();
    expect(screen.getByText(/fundamental accounting equation/)).toBeInTheDocument();
  });

  it('renders Stage 1: Desired Results section', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Stage 1: Identify Desired Results')).toBeInTheDocument();
  });

  it('renders essential question', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Essential Question')).toBeInTheDocument();
    expect(screen.getByText(/How can a business track/)).toBeInTheDocument();
  });

  it('renders enduring understandings', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Enduring Understandings')).toBeInTheDocument();

    // Financial analysis appears in multiple sections, so use getAllByText
    const financialAnalysis = screen.getAllByText('Financial analysis');
    expect(financialAnalysis.length).toBeGreaterThan(0);
  });

  it('renders knowledge and skills sections', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Students will know...')).toBeInTheDocument();
    expect(screen.getByText('Students will be able to...')).toBeInTheDocument();

    // Excel formulas appears in multiple sections, so use getAllByText
    const excelFormulas = screen.getAllByText('Excel formulas');
    expect(excelFormulas.length).toBeGreaterThan(0);
  });

  it('renders Stage 2: Assessment Evidence section', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Stage 2: Determine Acceptable Evidence')).toBeInTheDocument();
  });

  it('renders performance task', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Performance Task (Summative Assessment)')).toBeInTheDocument();
    expect(screen.getByText('Create Balance Sheet')).toBeInTheDocument();
    expect(screen.getByText(/Complete balance sheet/)).toBeInTheDocument();
  });

  it('renders milestones', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Milestone Assessments (Formative)')).toBeInTheDocument();
    expect(screen.getByText('Asset Identification')).toBeInTheDocument();
    expect(screen.getByText('Day 5')).toBeInTheDocument();
  });

  it('renders rubric table', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Success Criteria & Rubric')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('All correct')).toBeInTheDocument();
  });

  it('renders Stage 3: Learning Plan section', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Stage 3: Plan Learning Experiences and Instruction')).toBeInTheDocument();
  });

  it('renders learning sequence overview', () => {
    render(<UnitLessonPlan lesson={mockLesson} />);

    expect(screen.getByText('Learning Sequence Overview')).toBeInTheDocument();
    expect(screen.getByText('Foundation Week')).toBeInTheDocument();
    expect(screen.getByText('Week 1')).toBeInTheDocument();
  });

  it('handles lesson with minimal metadata', () => {
    const minimalLesson: Lesson = {
      ...mockLesson,
      metadata: null
    };

    render(<UnitLessonPlan lesson={minimalLesson} />);

    // Should still render basic structure
    expect(screen.getByText('Unit 1: Balance by Design')).toBeInTheDocument();
    expect(screen.getByText('Stage 1: Identify Desired Results')).toBeInTheDocument();
  });

  it('renders daily lessons when provided', () => {
    const dailyLessons = [
      {
        day: 1,
        title: 'Introduction',
        focus: 'Core concepts',
        duration: '45 min',
        activities: [
          {
            name: 'Hook Activity',
            duration: '10 min',
            description: 'Engage students',
            details: ['Show video', 'Discuss']
          }
        ],
        materials: ['Projector', 'Handouts']
      }
    ];

    render(<UnitLessonPlan lesson={mockLesson} dailyLessons={dailyLessons} />);

    expect(screen.getByText('Detailed Daily Plans')).toBeInTheDocument();
    expect(screen.getByText('Day 1: Introduction')).toBeInTheDocument();
    expect(screen.getByText(/Core concepts/)).toBeInTheDocument();
  });

  it('renders assessment strategies when provided', () => {
    const strategies = [
      {
        title: 'Formative Assessment',
        strategies: ['Exit tickets', 'Quick checks']
      }
    ];

    render(<UnitLessonPlan lesson={mockLesson} assessmentStrategies={strategies} />);

    expect(screen.getByText('Assessment Strategies & Differentiation')).toBeInTheDocument();
    expect(screen.getByText('Formative Assessment')).toBeInTheDocument();
    expect(screen.getByText('Exit tickets')).toBeInTheDocument();
  });

  it('renders differentiation supports when provided', () => {
    const differentiation = [
      {
        title: 'ELL Support',
        strategies: ['Visual aids', 'Translation support']
      }
    ];

    render(<UnitLessonPlan lesson={mockLesson} differentiation={differentiation} />);

    expect(screen.getByText('Differentiation Support')).toBeInTheDocument();
    expect(screen.getByText('ELL Support')).toBeInTheDocument();
    expect(screen.getByText('Visual aids')).toBeInTheDocument();
  });

  it('renders reflection section when questions provided', () => {
    const questions = ['What worked well?', 'What needs improvement?'];

    render(<UnitLessonPlan lesson={mockLesson} reflectionQuestions={questions} />);

    expect(screen.getByText('Reflection & Continuous Improvement')).toBeInTheDocument();
    expect(screen.getByText('Post-Unit Reflection Questions')).toBeInTheDocument();
    expect(screen.getByText('What worked well?')).toBeInTheDocument();
  });
});
