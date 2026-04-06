import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JournalEntryTable } from '@/components/activities/shared/JournalEntryTable';

describe('JournalEntryTable', () => {
  it('renders a balanced journal entry summary', () => {
    const { container } = render(
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

    expect(container.querySelector('[data-layout="general-journal"]')).toBeInTheDocument();
    expect(screen.getByText('Record the journal lines in canonical order.')).toBeInTheDocument();
    expect(screen.getByText(/journal entry balances/i)).toBeInTheDocument();
    expect(screen.getAllByText('Cash').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Revenue').length).toBeGreaterThan(0);
  });

  it('groups journal dates and distinguishes debit and credit line indentation', () => {
    const { container } = render(
      <JournalEntryTable
        title="Journal entry"
        availableAccounts={[
          { id: 'cash', label: 'Cash' },
          { id: 'revenue', label: 'Revenue' },
        ]}
        expectedLineCount={2}
        readOnly
        defaultValue={[
          { id: 'line-1', date: '03/20', accountId: 'cash', debit: 100, credit: '', memo: 'cash sale' },
          { id: 'line-2', date: '03/20', accountId: 'revenue', debit: '', credit: 100, memo: 'sale revenue' },
        ]}
      />,
    );

    // Desktop: date appears only once for consecutive same-date rows
    // Mobile: date header appears once for the group
    // Total: 2 (1 desktop + 1 mobile group header)
    expect(screen.getAllByText('03/20')).toHaveLength(2);

    // Use desktop section for data-line-side checks
    const desktopSection = container.querySelector('.hidden.md\\:block');
    const debitRow = desktopSection!.querySelector('[data-line-id="line-1"]');
    const creditRow = desktopSection!.querySelector('[data-line-id="line-2"]');
    expect(debitRow).toHaveAttribute('data-line-side', 'debit');
    expect(creditRow).toHaveAttribute('data-line-side', 'credit');
  });

  it('shows teaching-mode steps and next-step control', () => {
    render(
      <JournalEntryTable
        title="Journal entry"
        mode="teaching"
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

    expect(screen.getByText(/teaching mode/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    expect(screen.getByText(/record the debit side first/i)).toBeInTheDocument();
  });

  it('renders desktop table with hidden md:block and mobile cards with md:hidden', () => {
    const { container } = render(
      <JournalEntryTable
        title="Journal entry"
        availableAccounts={[
          { id: 'cash', label: 'Cash' },
          { id: 'revenue', label: 'Revenue' },
        ]}
        expectedLineCount={2}
        readOnly
        defaultValue={[
          { id: 'line-1', date: '03/20', accountId: 'cash', debit: 100, credit: '', memo: 'cash sale' },
          { id: 'line-2', date: '03/20', accountId: 'revenue', debit: '', credit: 100, memo: 'sale revenue' },
        ]}
      />,
    );

    const desktopTable = container.querySelector('.hidden.md\\:block');
    expect(desktopTable).toBeInTheDocument();

    const mobileSection = container.querySelector('.md\\:hidden');
    expect(mobileSection).toBeInTheDocument();
  });

  it('renders mobile stacked cards with article elements for each line', () => {
    const { container } = render(
      <JournalEntryTable
        title="Journal entry"
        availableAccounts={[
          { id: 'cash', label: 'Cash' },
          { id: 'revenue', label: 'Revenue' },
        ]}
        expectedLineCount={2}
        readOnly
        defaultValue={[
          { id: 'line-1', date: '03/20', accountId: 'cash', debit: 100, credit: '', memo: 'cash sale' },
          { id: 'line-2', date: '03/20', accountId: 'revenue', debit: '', credit: 100, memo: 'sale revenue' },
        ]}
      />,
    );

    const mobileSection = container.querySelector('.md\\:hidden');
    expect(mobileSection).not.toBeNull();
    const articles = mobileSection!.querySelectorAll('article');
    expect(articles).toHaveLength(2);
  });

  it('renders grouped-date headers in mobile view when dates change', () => {
    const { container } = render(
      <JournalEntryTable
        title="Journal entry"
        availableAccounts={[
          { id: 'cash', label: 'Cash' },
          { id: 'revenue', label: 'Revenue' },
          { id: 'expense', label: 'Expense' },
        ]}
        expectedLineCount={3}
        readOnly
        showDates
        defaultValue={[
          { id: 'line-1', date: '03/20', accountId: 'cash', debit: 100, credit: '', memo: 'cash sale' },
          { id: 'line-2', date: '03/20', accountId: 'revenue', debit: '', credit: 100, memo: 'sale revenue' },
          { id: 'line-3', date: '03/21', accountId: 'expense', debit: 50, credit: '', memo: 'expense' },
        ]}
      />,
    );

    const mobileSection = container.querySelector('.md\\:hidden');
    expect(mobileSection).not.toBeNull();
    // Date headers should appear when date changes
    const dateHeaders = mobileSection!.querySelectorAll('[data-date-header]');
    expect(dateHeaders).toHaveLength(2); // '03/20' and '03/21'
  });

  it('hides mobile cards when showDates is false', () => {
    const { container } = render(
      <JournalEntryTable
        title="Journal entry"
        availableAccounts={[
          { id: 'cash', label: 'Cash' },
          { id: 'revenue', label: 'Revenue' },
        ]}
        expectedLineCount={2}
        readOnly
        showDates={false}
        defaultValue={[
          { id: 'line-1', date: '03/20', accountId: 'cash', debit: 100, credit: '', memo: 'cash sale' },
          { id: 'line-2', date: '03/20', accountId: 'revenue', debit: '', credit: 100, memo: 'sale revenue' },
        ]}
      />,
    );

    const mobileSection = container.querySelector('.md\\:hidden');
    expect(mobileSection).not.toBeNull();
    // No date headers when showDates is false
    const dateHeaders = mobileSection!.querySelectorAll('[data-date-header]');
    expect(dateHeaders).toHaveLength(0);
  });
});
