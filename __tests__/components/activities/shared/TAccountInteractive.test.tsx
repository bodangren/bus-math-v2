import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TAccountInteractive } from '@/components/activities/shared/TAccountInteractive';

describe('TAccountInteractive', () => {
  it('renders debit and credit columns for each T-account and tracks ending balances', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <TAccountInteractive
        title="Posting balances"
        description="Use the posting trail to compute each ending balance."
        referenceTitle="Posting reference"
        referenceLines={[
          { id: 'line-1', date: '03/20', accountLabel: 'Cash', effectLabel: 'Debit 200' },
          { id: 'line-2', date: '03/21', accountLabel: 'Accounts Payable', effectLabel: 'Credit 200' },
        ]}
        rows={[
          {
            id: 'cash',
            accountLabel: 'Cash',
            startingBalance: 1200,
            normalSide: 'debit',
            netPostingCue: 'Debit 200',
            placeholder: '0',
            value: 1400,
          },
          {
            id: 'accounts-payable',
            accountLabel: 'Accounts Payable',
            startingBalance: 900,
            normalSide: 'credit',
            netPostingCue: 'No postings',
            placeholder: '0',
            value: 900,
          },
        ]}
        defaultValues={{ cash: '', 'accounts-payable': '' }}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Posting reference')).toBeInTheDocument();
    expect(screen.getAllByText('Debit side').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Credit side').length).toBeGreaterThan(0);
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Accounts Payable')).toBeInTheDocument();

    await user.type(screen.getAllByLabelText(/cash ending balance/i)[0], '1400');

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cash: '1400',
      }),
    );
    expect(screen.getByText(/some ending balances stay unchanged/i)).toBeInTheDocument();
  });

  it('keeps teacher-review rows visible and read only', () => {
    render(
      <TAccountInteractive
        title="Posting balances"
        mode="assessment"
        referenceLines={[
          { id: 'line-1', date: '03/20', accountLabel: 'Cash', effectLabel: 'Debit 200' },
        ]}
        rows={[
          {
            id: 'cash',
            accountLabel: 'Cash',
            startingBalance: 1200,
            normalSide: 'debit',
            netPostingCue: 'Debit 200',
            value: 1400,
          },
        ]}
        values={{ cash: '1300' }}
        readOnly
        teacherView
        rowFeedback={{
          cash: {
            status: 'incorrect',
            message: 'Expected 1,400; student entered 1,300.',
            misconceptionTags: ['posting-side-error'],
            selectedLabel: '1,300',
            expectedLabel: '1,400',
          },
        }}
      />,
    );

    expect(screen.getAllByText('posting-side-error').length).toBeGreaterThan(0);
    expect(screen.queryAllByLabelText(/cash ending balance/i)).toHaveLength(0);
    expect(screen.getAllByText(/expected 1,400; student entered 1,300/i).length).toBeGreaterThan(0);
  });

  it('shows teaching narration and step control', () => {
    render(
      <TAccountInteractive
        title="Posting balances"
        mode="teaching"
        referenceLines={[
          { id: 'line-1', date: '03/20', accountLabel: 'Cash', effectLabel: 'Debit 200' },
        ]}
        rows={[
          {
            id: 'cash',
            accountLabel: 'Cash',
            startingBalance: 1200,
            normalSide: 'debit',
            netPostingCue: 'Debit 200',
            value: 1400,
          },
        ]}
      />,
    );

    expect(screen.getByText(/teaching mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    expect(screen.getByText(/trace each posting from the trail into the t-account/i)).toBeInTheDocument();
  });
});
