import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AccountingEquationLayout } from '@/components/activities/shared/AccountingEquationLayout';

describe('AccountingEquationLayout', () => {
  it('tracks the editable term and shows the guided helper caption', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <AccountingEquationLayout
        title="Complete the accounting equation"
        description="Use the ledger snapshot to solve for owner equity."
        mode="guided_practice"
        helperText="Use assets minus liabilities to find owner equity."
        facts={[
          { id: 'assets', label: 'Assets', value: 8200 },
          { id: 'liabilities', label: 'Liabilities', value: 3200 },
        ]}
        terms={{
          assets: { id: 'assets', label: 'Assets', value: 8200, hidden: false, editable: false },
          liabilities: { id: 'liabilities', label: 'Liabilities', value: 3200, hidden: false, editable: false },
          equity: { id: 'equity', label: "Owner's Equity", hidden: true, editable: true, placeholder: '0', value: 5000 },
        }}
        defaultValues={{ equity: '' }}
        onValueChange={onValueChange}
      />,
    );

    await user.type(screen.getAllByLabelText(/owner's equity amount/i)[0], '5000');

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        equity: '5000',
      }),
    );
    expect(screen.getByText(/use assets minus liabilities/i)).toBeInTheDocument();
  });

  it('locks the inputs in teacher review and shows student, expected, and tag annotations', () => {
    render(
      <AccountingEquationLayout
        title="Complete the accounting equation"
        mode="assessment"
        facts={[
          { id: 'assets', label: 'Assets', value: 8200 },
          { id: 'liabilities', label: 'Liabilities', value: 3200 },
        ]}
        terms={{
          assets: { id: 'assets', label: 'Assets', value: 8200, hidden: false, editable: false },
          liabilities: { id: 'liabilities', label: 'Liabilities', value: 3200, hidden: false, editable: false },
          equity: { id: 'equity', label: "Owner's Equity", hidden: true, editable: true, placeholder: '0', value: 5000 },
        }}
        values={{ equity: '4200' }}
        readOnly
        teacherView
        feedback={{
          equity: {
            status: 'incorrect',
            message: 'Owner equity should be 5,000.',
            misconceptionTags: ['equation-imbalance'],
            selectedLabel: '4,200',
            expectedLabel: '5,000',
          },
        }}
      />,
    );

    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Expected')).toBeInTheDocument();
    expect(screen.getByText('Tag')).toBeInTheDocument();
    expect(screen.getByText('equation-imbalance')).toBeInTheDocument();
    expect(screen.queryAllByLabelText(/owner's equity amount/i)).toHaveLength(0);
    expect(screen.getAllByText('4,200').length).toBeGreaterThan(0);
  });
});
