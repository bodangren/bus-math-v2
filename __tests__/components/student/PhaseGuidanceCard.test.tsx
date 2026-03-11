import { render, screen } from '@testing-library/react';

import { PhaseGuidanceCard } from '@/components/student/PhaseGuidanceCard';

describe('PhaseGuidanceCard', () => {
  it('renders phase goal, success criteria, and lesson objectives', () => {
    render(
      <PhaseGuidanceCard
        guidance={{
          lessonType: 'accounting',
          phaseNumber: 3,
          phaseLabel: 'Guided Practice',
          goal: 'Practice the accounting move with teacher support.',
          successCriteria: [
            'Complete the interactive task with your group.',
            'Explain why the accounting move is correct.',
          ],
        }}
        learningObjectives={[
          'Classify transaction effects on the accounting equation.',
          'Use evidence from Sarah Chen’s store records.',
        ]}
      />,
    );

    expect(screen.getByText('Guided Practice')).toBeInTheDocument();
    expect(screen.getByText(/teacher support/i)).toBeInTheDocument();
    expect(screen.getByText(/complete the interactive task/i)).toBeInTheDocument();
    expect(screen.getByText(/classify transaction effects/i)).toBeInTheDocument();
  });

  it('hides the lesson-objectives section when none are provided', () => {
    render(
      <PhaseGuidanceCard
        guidance={{
          lessonType: 'excel',
          phaseNumber: 2,
          phaseLabel: 'Intro',
          goal: 'Demonstrate the spreadsheet workflow.',
          successCriteria: ['Name the quality checks before practicing.'],
        }}
        learningObjectives={null}
      />,
    );

    expect(screen.queryByText('This phase advances these lesson objectives')).not.toBeInTheDocument();
  });
});
