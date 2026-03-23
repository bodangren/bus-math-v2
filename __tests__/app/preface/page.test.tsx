import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PrefacePage from '../../../app/preface/page';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('@/components/activities/quiz/ComprehensionCheck', () => ({
  ComprehensionCheck: () => <div data-testid="comprehension-check" />,
}));

vi.mock('@/components/activities/simulations/CashFlowChallenge', () => ({
  CashFlowChallenge: () => <div data-testid="cash-flow-challenge" />,
}));

describe('PrefacePage', () => {
  it('renders value pillars and lesson phases', () => {
    render(<PrefacePage />);

    expect(screen.getByRole('heading', { name: /Build real workbooks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Present to real audiences/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Finish with a capstone/i })).toBeInTheDocument();
  });

  it('shows the six lesson phases', () => {
    render(<PrefacePage />);

    expect(screen.getByText('Hook')).toBeInTheDocument();
    expect(screen.getByText('Instruction')).toBeInTheDocument();
    expect(screen.getByText('Guided Practice')).toBeInTheDocument();
    expect(screen.getByText('Independent Practice')).toBeInTheDocument();
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('Closing')).toBeInTheDocument();
  });

  it('renders interactive demo components', () => {
    render(<PrefacePage />);

    expect(screen.getByTestId('comprehension-check')).toBeInTheDocument();
    expect(screen.getByTestId('cash-flow-challenge')).toBeInTheDocument();
  });
});
