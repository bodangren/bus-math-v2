import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AssessmentOverview } from './AssessmentOverview';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('AssessmentOverview', () => {
  it('displays performance task details and requirements', () => {
    const unitContent = buildUnitContent({
      assessment: {
        performanceTask: {
          title: 'Board Review',
          description: 'Present key insights to Sarah Chen.',
          requirements: ['4-minute board readout', 'Live spreadsheet walkthrough'],
          context: 'Students simulate an investor diligence meeting'
        },
        milestones: [
          {
            id: 'milestone-a',
            day: 2,
            title: 'Scenario modeling draft',
            description: 'Complete base financial model',
            criteria: ['All tabs linked', 'Assumptions documented']
          }
        ],
        rubric: [
          {
            name: 'Storytelling',
            weight: '20%',
            exemplary: 'Narrative ties to data seamlessly',
            proficient: 'Clear narrative with minor gaps',
            developing: 'Narrative is unclear'
          }
        ]
      }
    });

    render(<AssessmentOverview assessment={unitContent.assessment} />);

    expect(screen.getByText('Board Review')).toBeInTheDocument();
    expect(screen.getByText('4-minute board readout')).toBeInTheDocument();
    expect(screen.getByText(/Scenario modeling draft/)).toBeInTheDocument();
    expect(screen.getByText(/Storytelling/)).toBeInTheDocument();
  });
});
