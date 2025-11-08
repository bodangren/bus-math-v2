import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TAccountDetailed } from './TAccountDetailed';
import type { AccountingTransaction } from './accounting-types';

const debitTransaction: AccountingTransaction = {
  id: 'debit-1',
  date: '2024-01-02',
  description: 'Product sale',
  amount: 4000,
  reference: 'JE-101'
};

const creditTransaction: AccountingTransaction = {
  id: 'credit-1',
  date: '2024-01-05',
  description: 'Rent payment',
  amount: 1000
};

describe('TAccountDetailed', () => {
  it('renders ending balance with beginning balance factored in', () => {
    render(
      <TAccountDetailed
        accountName="Cash"
        accountType="asset"
        beginningBalance={1000}
        debits={[debitTransaction]}
        credits={[creditTransaction]}
        showRunningBalance
        showJournalReferences
        showFormulas
        title="Cash Ledger"
      />
    );

    expect(screen.getByText(/Ending Balance/)).toHaveTextContent('$4,000');
    expect(screen.getByTestId('running-balance-debit-1')).toHaveTextContent('Bal: $5,000');
    expect(screen.getByText(/JE: JE-101/)).toBeInTheDocument();
  });
});
