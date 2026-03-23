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

    await user.click(screen.getByRole('radio', { name: /assets: balance sheet/i }));
    await user.click(screen.getByRole('checkbox', { name: /contra accounts: balance sheet/i }));

    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({
        assets: 'balance-sheet',
        contra: ['balance-sheet'],
      }),
    );
  });

  it('advances focus to the next row after a single-select choice', async () => {
    const user = userEvent.setup();

    render(
      <SelectionMatrix
        title="Effects of missing adjustments"
        rows={[
          { id: 'revenue', label: 'Revenue', selectionMode: 'single' },
          { id: 'expense', label: 'Expense', selectionMode: 'single' },
        ]}
        columns={[
          { id: 'overstated', label: 'Overstated' },
          { id: 'understated', label: 'Understated' },
          { id: 'no-effect', label: 'No effect' },
        ]}
      />,
    );

    await user.click(screen.getByRole('radio', { name: /revenue: understated/i }));

    expect(screen.getByRole('radio', { name: /expense: overstated/i })).toHaveFocus();
  });

  it('renders teacher review summary and row feedback copy', () => {
    render(
      <SelectionMatrix
        title="Normal balances"
        scenarioPanel={
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Scenario</div>
            <div>Choose the debit or credit normal balance for each account.</div>
          </div>
        }
        teacherView
        readOnly
        rows={[
          { id: 'cash', label: 'Cash', description: 'Current asset' },
          { id: 'allowance', label: 'Allowance for Doubtful Accounts', description: 'Contra asset' },
        ]}
        columns={[
          { id: 'debit', label: 'Debit' },
          { id: 'credit', label: 'Credit' },
        ]}
        defaultValue={{
          cash: 'debit',
          allowance: 'debit',
        }}
        rowFeedback={{
          cash: {
            status: 'correct',
            scoreLabel: '1/1',
            selectedLabel: 'Debit',
            expectedLabel: 'Debit',
            misconceptionTags: [],
          },
          allowance: {
            status: 'incorrect',
            scoreLabel: '0/1',
            selectedLabel: 'Debit',
            expectedLabel: 'Credit',
            misconceptionTags: ['contra-account-same-as-parent'],
            message: 'Contra accounts use the opposite side from their parent account.',
          },
        }}
        submissionSummary={{
          scoreLabel: '1/2 correct',
          attempts: 2,
          submittedAt: '2026-03-20 09:15',
          misconceptionCount: 1,
        }}
      />,
    );

    expect(screen.getByText('Choose the debit or credit normal balance for each account.')).toBeInTheDocument();
    expect(screen.getByText(/score: 1\/2 correct/i)).toBeInTheDocument();
    expect(screen.getByText(/attempts: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted: 2026-03-20 09:15/i)).toBeInTheDocument();
    expect(screen.getByText(/misconceptions: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/your answer: debit\. expected: credit\./i)).toBeInTheDocument();
    expect(screen.getByText(/contra-account-same-as-parent/i)).toBeInTheDocument();
  });
});
