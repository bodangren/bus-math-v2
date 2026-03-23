import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JournalEntryTable } from '@/components/activities/shared';

describe('JournalEntryTable', () => {
  it('renders a balanced journal entry summary', () => {
    render(
      <JournalEntryTable
        title="Journal entry"
        scenarioPanel={
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Scenario</div>
            <div>Record the journal lines in canonical order.</div>
          </div>
        }
        availableAccounts={[
          { id: 'cash', label: 'Cash' },
          { id: 'revenue', label: 'Revenue' },
        ]}
        expectedLineCount={2}
        defaultValue={[
          { id: 'line-1', accountId: 'cash', debit: 100, credit: '', memo: 'cash sale' },
          { id: 'line-2', accountId: 'revenue', debit: '', credit: 100, memo: 'sale revenue' },
        ]}
      />,
    );

    expect(screen.getByText('Record the journal lines in canonical order.')).toBeInTheDocument();
    expect(screen.getByText(/journal entry balances/i)).toBeInTheDocument();
    expect(screen.getAllByText('Cash').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Revenue').length).toBeGreaterThan(0);
  });
});
