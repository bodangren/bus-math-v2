import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CashFlowStatementSimple,
  type CashFlowStatementSimpleData
} from './CashFlowStatementSimple';

const cashFlowStatement: CashFlowStatementSimpleData = {
  period: 'For the Year Ended December 31, 2024',
  operatingActivities: {
    netIncome: 29_250,
    depreciation: 8_000,
    changeInReceivables: -5_000,
    changeInInventory: -3_000,
    changeInPayables: 2_500,
    netOperatingCashFlow: 31_750
  },
  investingActivities: {
    equipmentPurchases: -15_000,
    equipmentSales: 2_000,
    investmentPurchases: -8_000,
    investmentSales: 3_000,
    netInvestingCashFlow: -18_000
  },
  financingActivities: {
    stockIssuance: 10_000,
    dividendPayments: -5_000,
    loanProceeds: 12_000,
    loanRepayments: -8_000,
    netFinancingCashFlow: 9_000
  },
  netChangeInCash: 22_750,
  beginningCash: 15_000,
  endingCash: 37_750
};

describe('CashFlowStatementSimple', () => {
  it('renders each activity section with the provided totals', () => {
    render(<CashFlowStatementSimple data={cashFlowStatement} showCalculations />);

    expect(screen.getByText(/Cash Increased/i)).toBeInTheDocument();
    expect(screen.getByText('$31,750')).toBeInTheDocument();
    expect(screen.getByText('$37,750')).toBeInTheDocument();
    expect(
      screen.getByText(/Ending Cash = Beginning Cash \+ Net Change in Cash/i)
    ).toBeInTheDocument();
  });

  it('shows a decreased badge when net cash change is negative', () => {
    render(
      <CashFlowStatementSimple
        data={{ ...cashFlowStatement, netChangeInCash: -10_000, endingCash: 5_000 }}
      />
    );

    expect(screen.getByText(/Cash Decreased/i)).toBeInTheDocument();
  });
});
