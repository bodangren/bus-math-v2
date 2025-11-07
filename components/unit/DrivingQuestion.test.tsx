import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DrivingQuestion } from './DrivingQuestion';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('DrivingQuestion', () => {
  it('renders the question, context, and scenario', () => {
    const unitContent = buildUnitContent();

    render(<DrivingQuestion drivingQuestion={unitContent.drivingQuestion} />);

    expect(screen.getByText(/How can we build/i)).toBeInTheDocument();
    expect(screen.getByText(/Teams use TechStart/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Chen/)).toBeInTheDocument();
  });

  it('returns null when no driving question is provided', () => {
    const { container } = render(<DrivingQuestion />);

    expect(container).toBeEmptyDOMElement();
  });
});
