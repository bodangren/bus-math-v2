import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CapstonePage from './page';

describe('CapstonePage', () => {
  it('renders hero content and navigation links', () => {
    render(<CapstonePage />);

    expect(
      screen.getByText(/Investor-Ready Capstone Project/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /capstone guidelines/i }),
    ).toHaveAttribute('href', '/capstone/guidelines');
    expect(
      screen.getByRole('link', { name: /rubrics/i }),
    ).toHaveAttribute('href', '/capstone/rubrics');
  });

  it('lists curriculum bridges for core units', () => {
    render(<CapstonePage />);

    expect(screen.getByText('Balance by Design')).toBeInTheDocument();
    expect(
      screen.getByText(/Accounting equation, account types/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Financing the Future')).toBeInTheDocument();
  });

  it('shows the 13-week milestone timeline', () => {
    render(<CapstonePage />);

    expect(screen.getAllByText(/Week 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Week 13/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Demo Day presentation/i),
    ).toBeInTheDocument();
  });
});
