import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UnitHeader, type UnitHeaderProps } from './UnitHeader';

const buildProps = (overrides: Partial<UnitHeaderProps> = {}): UnitHeaderProps => ({
  unitNumber: 3,
  title: 'Integrated Model Sprint',
  description: 'Students build a full three-statement model with Sarah Chen.',
  durationLabel: '2-3 weeks',
  difficulty: 'advanced',
  durationMinutes: null,
  ...overrides
});

describe('UnitHeader', () => {
  it('renders unit metadata with duration label and difficulty badge', () => {
    render(<UnitHeader {...buildProps()} />);

    expect(screen.getByText('Unit 3')).toBeInTheDocument();
    expect(screen.getByText('2-3 weeks')).toBeInTheDocument();
    expect(screen.getByText(/Integrated Model Sprint/)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Chen/)).toBeInTheDocument();
    expect(screen.getByText(/Advanced/)).toBeInTheDocument();
  });

  it('falls back to formatted minutes when no duration label provided', () => {
    render(
      <UnitHeader
        {...buildProps({
          durationLabel: undefined,
          durationMinutes: 90
        })}
      />
    );

    expect(screen.getByText('90 min')).toBeInTheDocument();
  });

  it('shows placeholder text when difficulty is missing', () => {
    render(
      <UnitHeader
        {...buildProps({
          difficulty: undefined
        })}
      />
    );

    expect(screen.getByText(/Skill level TBD/i)).toBeInTheDocument();
  });
});
