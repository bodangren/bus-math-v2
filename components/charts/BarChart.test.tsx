import { render, screen } from '@testing-library/react';

import { BarChart } from './BarChart';

const barData = [
  { unit: 'Unit 1', completed: 20, assigned: 25 },
  { unit: 'Unit 2', completed: 18, assigned: 24 }
];

const barSeries = [
  { key: 'completed', label: 'Completed' },
  { key: 'assigned', label: 'Assigned' }
];

describe('BarChart', () => {
  it('shows stacked bar legend entries and aria label', () => {
    render(
      <BarChart
        title="Lesson Progress"
        data={barData}
        series={barSeries}
        xAxisKey="unit"
        stacked
        ariaLabel="Lesson progress chart"
      />
    );

    expect(screen.getByRole('img', { name: /lesson progress chart/i })).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
  });
});
