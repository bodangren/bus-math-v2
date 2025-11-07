import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UnitOverview } from './UnitOverview';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('UnitOverview', () => {
  it('lists learning objectives, skills, and deliverables', () => {
    const unitContent = buildUnitContent({
      objectives: {
        content: ['Explain cash flow categories'],
        skills: ['Use SUMIFS to reconcile data'],
        deliverables: ['Board-ready dashboard']
      }
    });

    render(<UnitOverview objectives={unitContent.objectives} />);

    expect(screen.getByText('Explain cash flow categories')).toBeInTheDocument();
    expect(screen.getByText('Use SUMIFS to reconcile data')).toBeInTheDocument();
    expect(screen.getByText('Board-ready dashboard')).toBeInTheDocument();
  });

  it('shows placeholder text when a section has no items', () => {
    const unitContent = buildUnitContent({
      objectives: {
        content: [],
        skills: [],
        deliverables: []
      }
    });

    render(<UnitOverview objectives={unitContent.objectives} />);

    expect(screen.getAllByText(/Details coming soon/i)).toHaveLength(3);
  });
});
