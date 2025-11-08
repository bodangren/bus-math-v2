import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TAccountSimple } from './TAccountSimple';
import type { AccountingTransaction } from './accounting-types';

const debitTransactions: AccountingTransaction[] = [
  {
    id: 'debit-1',
    date: '2024-01-01',
    description: 'Initial investment',
    amount: 5000
  }
];

const creditTransactions: AccountingTransaction[] = [
  {
    id: 'credit-1',
    date: '2024-01-15',
    description: 'Equipment purchase',
    amount: 2000
  }
];

describe('TAccountSimple', () => {
  it('calculates balances for debit-normal accounts', () => {
    render(
      <TAccountSimple
        accountName="Cash"
        accountType="asset"
        debits={debitTransactions}
        credits={creditTransactions}
      />
    );

    expect(screen.getByTestId('account-balance')).toHaveTextContent('$3,000');
  });

  it('applies account type colors to the badge', () => {
    render(<TAccountSimple accountName="Supplies" accountType="asset" />);

    const badge = screen.getByText(/Asset Account/);
    expect(badge.className).toContain('bg-blue-100');
  });
});
