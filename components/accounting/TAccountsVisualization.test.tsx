import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TAccountsVisualization, type TAccount } from './TAccountsVisualization';

const buildAccounts = (): TAccount[] => [
  {
    id: 'cash',
    name: 'Cash',
    type: 'asset',
    debits: [{ id: 'd1', date: '2024-01-02', description: 'Investment', amount: 8000 }],
    credits: [{ id: 'c1', date: '2024-01-05', description: 'Supplies', amount: 1000 }]
  },
  {
    id: 'accounts-payable',
    name: 'Accounts Payable',
    type: 'liability',
    debits: [],
    credits: [{ id: 'c2', date: '2024-01-05', description: 'Invoice', amount: 2000 }]
  },
  {
    id: 'equity',
    name: 'Owner Equity',
    type: 'equity',
    debits: [],
    credits: [{ id: 'c3', date: '2024-01-02', description: 'Capital', amount: 5000 }]
  }
];

describe('TAccountsVisualization', () => {
  it('shows balanced accounting equation and account balances from props', () => {
    render(<TAccountsVisualization accounts={buildAccounts()} />);

    expect(screen.getByTestId('equation-status')).toHaveTextContent('BALANCED');
    expect(screen.getByTestId('account-balance-cash')).toHaveTextContent('$7,000');
  });
});
