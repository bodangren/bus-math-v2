import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UnitIntroduction } from './UnitIntroduction';
import { buildUnitContent } from '@/lib/test-utils/mock-factories';

describe('UnitIntroduction', () => {
  it('renders intro video, entry event, project overview, and objectives', () => {
    const unitContent = buildUnitContent();

    render(<UnitIntroduction {...unitContent.introduction!} />);

    expect(screen.getByText(/Smart Ledger Launch/)).toBeInTheDocument();
    expect(screen.getByText(/How can we build trustworthy books/)).toBeInTheDocument();
    expect(screen.getByTitle(/Unit Kickoff/)).toBeInTheDocument();
    expect(screen.getByText(/Entry Event/)).toBeInTheDocument();
    expect(screen.getByText(/Angel investor diligence/)).toBeInTheDocument();
    expect(screen.getByText(/Excel tables/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start Learning: Core Concepts/ })).toHaveAttribute(
      'href',
      '#core-concepts'
    );
  });
});
