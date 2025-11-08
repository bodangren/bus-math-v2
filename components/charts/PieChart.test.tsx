import { render, screen } from '@testing-library/react';

import { PieChart } from './PieChart';

const segments = [
  { id: 'cash', label: 'Cash', value: 4200 },
  { id: 'inventory', label: 'Inventory', value: 2100 },
  { id: 'equipment', label: 'Equipment', value: 6000 }
];

describe('PieChart', () => {
  it('renders segment labels from props', () => {
    render(<PieChart title="Asset Mix" segments={segments} ariaLabel="Asset pie chart" />);

    expect(screen.getByRole('img', { name: /asset pie chart/i })).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });
});
