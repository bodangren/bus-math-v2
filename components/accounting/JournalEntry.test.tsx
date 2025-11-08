import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JournalEntry } from './JournalEntry';
import type { JournalEntryLine } from './accounting-types';

const balancedLines: JournalEntryLine[] = [
  {
    id: '1',
    account: 'Cash',
    accountType: 'asset',
    debit: 1000
  },
  {
    id: '2',
    account: 'Service Revenue',
    accountType: 'revenue',
    credit: 1000
  }
];

const unbalancedLines: JournalEntryLine[] = [
  {
    id: '1',
    account: 'Cash',
    accountType: 'asset',
    debit: 1200
  },
  {
    id: '2',
    account: 'Accounts Payable',
    accountType: 'liability',
    credit: 1000
  }
];

describe('JournalEntry', () => {
  it('marks entries as balanced when debits equal credits', () => {
    render(
      <JournalEntry
        entryNumber="JE-001"
        date="2024-01-01"
        description="Record sale"
        lines={balancedLines}
      />
    );

    expect(screen.getByTestId('journal-validation')).toHaveTextContent('Balanced');
    expect(screen.getByText(/Entry is balanced/)).toBeInTheDocument();
  });

  it('flags unbalanced entries with the difference', () => {
    render(
      <JournalEntry
        entryNumber="JE-002"
        date="2024-01-02"
        description="Record purchase"
        lines={unbalancedLines}
      />
    );

    expect(screen.getByTestId('journal-validation')).toHaveTextContent('Unbalanced');
    expect(screen.getByText(/Entry is unbalanced/)).toHaveTextContent('$200');
  });
});
