import { render, screen } from '@testing-library/react';

import { DoughnutChart } from './DoughnutChart';

const doughnutSegments = [
  { id: 'cash', label: 'Cash', value: 3200 },
  { id: 'receivables', label: 'Receivables', value: 1800 }
];

describe('DoughnutChart', () => {
  it('shows formatted total in the center overlay', () => {
    render(<DoughnutChart title="Working Capital" segments={doughnutSegments} totalLabel="Working Capital" />);

    expect(screen.getByRole('img', { name: /working capital/i })).toBeInTheDocument();
    expect(screen.getAllByText('Working Capital').length).toBeGreaterThan(0);
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });
});
