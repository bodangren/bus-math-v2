import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NextLessonCard } from '@/components/dashboard/NextLessonCard';

describe('NextLessonCard', () => {
  it('renders an actionable next lesson with description and CTA', () => {
    render(
      <NextLessonCard
        heading="Continue Learning"
        description="Pick up where progress left off."
        emptyMessage="All published lessons are complete."
        lesson={{
          unitNumber: 2,
          title: 'Cash Controls',
          description: 'Resume the current published lesson.',
          slug: 'unit-2-lesson-2',
          actionLabel: 'Resume Lesson',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: /continue learning/i })).toBeInTheDocument();
    expect(screen.getByText(/unit 2/i)).toBeInTheDocument();
    expect(screen.getByText('Cash Controls')).toBeInTheDocument();
    expect(screen.getByText(/resume the current published lesson/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resume lesson/i })).toHaveAttribute(
      'href',
      '/student/lesson/unit-2-lesson-2',
    );
  });

  it('renders a completion-state message when no lesson is available', () => {
    render(
      <NextLessonCard
        heading="Next Best Lesson"
        description="Direct the student into the most relevant published lesson."
        lesson={null}
        emptyMessage="All published lessons are complete."
      />,
    );

    expect(screen.getByRole('heading', { name: /next best lesson/i })).toBeInTheDocument();
    expect(screen.getByText(/all published lessons are complete/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the capstone label instead of Unit 9 for the culminating lesson', () => {
    render(
      <NextLessonCard
        heading="Continue Learning"
        description="Pick up where progress left off."
        emptyMessage="All published lessons are complete."
        lesson={{
          unitNumber: 9,
          title: 'Capstone: Investor-Ready Plan',
          description: 'Rehearse the final investor pitch.',
          slug: 'capstone-investor-ready-plan',
          actionLabel: 'Resume Lesson',
        }}
      />,
    );

    expect(screen.getByText(/^Capstone$/)).toBeInTheDocument();
    expect(screen.queryByText(/^Unit 9$/)).not.toBeInTheDocument();
  });
});
