import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectionMatrix } from '@/components/activities/shared';

describe('SelectionMatrix', () => {
  it('emits selection changes for single and multiple rows', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SelectionMatrix
        title="Ledger groups"
        rows={[
          { id: 'assets', label: 'Assets', selectionMode: 'single' },
          { id: 'contra', label: 'Contra accounts', selectionMode: 'multiple' },
        ]}
        columns={[
          { id: 'balance-sheet', label: 'Balance Sheet' },
          { id: 'income-statement', label: 'Income Statement' },
        ]}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: /assets balance sheet/i }));
    await user.click(screen.getByRole('checkbox', { name: /contra accounts balance sheet/i }));

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        assets: 'balance-sheet',
        contra: ['balance-sheet'],
      }),
    );
  });
});
