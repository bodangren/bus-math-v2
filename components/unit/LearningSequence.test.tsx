import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LearningSequence } from './LearningSequence';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('LearningSequence', () => {
  it('renders weeks, days, activities, and milestones', () => {
    const unitContent = buildUnitContent({
      learningSequence: {
        weeks: [
          {
            weekNumber: 1,
            title: 'Foundations',
            description: 'Kickoff and baseline skills',
            days: [
              {
                day: 1,
                focus: 'Launch',
                activities: ["Watch Sarah's story"],
                resources: ['Overview page'],
                milestone: 'Define challenge'
              }
            ]
          }
        ]
      }
    });

    render(<LearningSequence learningSequence={unitContent.learningSequence} />);

    expect(screen.getByText(/Week 1/)).toBeInTheDocument();
    expect(screen.getByText(/Launch/)).toBeInTheDocument();
    expect(screen.getByText(/Watch Sarah's story/)).toBeInTheDocument();
    expect(screen.getByText(/Define challenge/)).toBeInTheDocument();
  });
});
