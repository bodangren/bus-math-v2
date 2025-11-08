import { render, screen } from '@testing-library/react';

import { LineChart } from './LineChart';

const sampleData = [
  { month: 'Jan', revenue: 12000, expenses: 8000 },
  { month: 'Feb', revenue: 15000, expenses: 9000 }
];

const sampleSeries = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'expenses', label: 'Expenses' }
];

describe('LineChart', () => {
  it('renders a line chart with provided data and labels', () => {
    render(
      <LineChart
        title="Revenue Trends"
        description="Track month over month performance"
        data={sampleData}
        series={sampleSeries}
        ariaLabel="Revenue line chart"
      />
    );

    expect(screen.getByRole('img', { name: /revenue line chart/i })).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });
});
