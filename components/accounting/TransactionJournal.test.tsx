import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TransactionJournal, type TransactionEntry } from './TransactionJournal';
import type { JournalEntryLine } from './accounting-types';

const balancedLines: JournalEntryLine[] = [
  { id: 'l1', account: 'Cash', accountType: 'asset', debit: 3000 },
  { id: 'l2', account: 'Owner Equity', accountType: 'equity', credit: 3000 }
];

const unbalancedLines: JournalEntryLine[] = [
  { id: 'l3', account: 'Rent Expense', accountType: 'expense', debit: 1200 },
  { id: 'l4', account: 'Cash', accountType: 'asset', credit: 1000 }
];

const buildTransaction = (overrides: Partial<TransactionEntry> = {}): TransactionEntry => ({
  id: 'txn-1',
  entryNumber: 'JE-001',
  date: '2024-01-01',
  description: 'Seed funding',
  clientFocus: 'Tech Startup',
  lines: balancedLines,
  isBalanced: true,
  ...overrides
});

describe('TransactionJournal', () => {
  it('renders analytics from initial transactions', () => {
    const transactions = [
      buildTransaction(),
      buildTransaction({
        id: 'txn-2',
        entryNumber: 'JE-002',
        description: 'Studio rent',
        lines: unbalancedLines,
        isBalanced: false
      })
    ];

    render(<TransactionJournal initialTransactions={transactions} />);

    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getAllByText('Seed funding').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Studio rent').length).toBeGreaterThan(0);
  });

  it('hides the add transaction button when max transactions reached', () => {
    const transactions = [buildTransaction(), buildTransaction({ id: 'txn-3', entryNumber: 'JE-003' })];

    render(<TransactionJournal initialTransactions={transactions} maxTransactions={2} />);

    expect(screen.queryByRole('button', { name: /Add New Transaction/i })).not.toBeInTheDocument();
  });
});
