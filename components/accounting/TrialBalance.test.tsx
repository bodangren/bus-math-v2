import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TrialBalance } from './TrialBalance';
import type { TrialBalanceAccount } from './accounting-types';

const accounts: TrialBalanceAccount[] = [
  {
    id: '1',
    accountNumber: '101',
    accountName: 'Cash',
    accountType: 'asset',
    normalBalance: 'debit',
    debitBalance: 5000
  },
  {
    id: '2',
    accountNumber: '201',
    accountName: 'Accounts Payable',
    accountType: 'liability',
    normalBalance: 'credit',
    creditBalance: 2000
  },
  {
    id: '3',
    accountNumber: '301',
    accountName: 'Owner Equity',
    accountType: 'equity',
    normalBalance: 'credit',
    creditBalance: 3000
  }
];

describe('TrialBalance', () => {
  it('renders balanced status and account rows', () => {
    render(
      <TrialBalance
        companyName="TechStart Cafe"
        periodEnding="January 31, 2024"
        accounts={accounts}
        title="Trial Balance"
        groupByType
        showAccountTypes
      />
    );

    expect(screen.getByTestId('trial-balance-status')).toHaveTextContent(/balanced/i);
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Asset Accounts').className).toContain('bg-blue-100');
  });
});
