import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { FinancialDashboard } from '../../../components/activities/charts/FinancialDashboard';

describe('FinancialDashboard', () => {
  it('calls refresh and export handlers', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const onExport = vi.fn();

    render(<FinancialDashboard onRefresh={onRefresh} onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name: /refresh data/i }));
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
    });
  });

  it('shows KPI values from props', () => {
    render(
      <FinancialDashboard
        kpis={[
          { title: 'Custom Revenue', value: '$10,000', change: 5, trend: 'up' },
          { title: 'Custom Profit', value: '$6,000', change: -2, trend: 'down' }
        ]}
        refreshable={false}
        exportable={false}
      />
    );

    expect(screen.getByText('Custom Revenue')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('Custom Profit')).toBeInTheDocument();
  });
});
