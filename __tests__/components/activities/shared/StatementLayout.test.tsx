import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { StatementLayout } from '@/components/activities/shared';

describe('StatementLayout', () => {
  it('tracks editable rows and computes subtotals', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <StatementLayout
        title="Income Statement"
        sections={[
          {
            id: 'income',
            label: 'Income Statement',
            rows: [
              { id: 'revenue', label: 'Revenue', kind: 'editable', placeholder: '0' },
              { id: 'net-income', label: 'Net Income', kind: 'subtotal', sumOf: ['revenue'] },
            ],
          },
        ]}
        onValueChange={onValueChange}
      />,
    );

    await user.type(screen.getByLabelText('Revenue'), '1000');

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        revenue: '1000',
      }),
    );
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });
});
