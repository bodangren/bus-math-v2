import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  CashFlowStatementDetailed,
  type CashFlowStatementDetailedData
} from './CashFlowStatementDetailed';

const detailedCashFlow: CashFlowStatementDetailedData = {
  period: 'For the Year Ended December 31, 2024',
  operatingActivities: {
    netIncome: 29_250,
    adjustments: {
      depreciation: 8_000,
      amortization: 2_500,
      lossOnSaleOfAssets: 1_200,
      badDebtExpense: 800,
      stockBasedCompensation: 3_500,
      deferredTaxes: -1_500,
      totalAdjustments: 14_500
    },
    workingCapitalChanges: {
      accountsReceivable: -5_000,
      inventory: -3_000,
      prepaidExpenses: -500,
      accountsPayable: 2_500,
      accruedLiabilities: 1_200,
      deferredRevenue: 800,
      totalWorkingCapitalChanges: -4_000
    },
    netOperatingCashFlow: 39_750
  },
  investingActivities: {
    capitalExpenditures: {
      equipmentPurchases: -15_000,
      buildingPurchases: -25_000,
      vehiclePurchases: -8_000,
      totalCapEx: -48_000
    },
    assetSales: {
      equipmentSales: 2_000,
      buildingSales: 5_000,
      totalAssetSales: 7_000
    },
    investments: {
      purchaseOfSecurities: -12_000,
      saleOfSecurities: 8_000,
      acquisitions: -15_000,
      totalInvestments: -19_000
    },
    netInvestingCashFlow: -60_000
  },
  financingActivities: {
    equity: {
      stockIssuance: 15_000,
      stockRepurchases: -5_000,
      dividendPayments: -8_000,
      totalEquity: 2_000
    },
    debt: {
      loanProceeds: 25_000,
      loanRepayments: -12_000,
      bondIssuance: 20_000,
      bondRepayments: -8_000,
      totalDebt: 25_000
    },
    netFinancingCashFlow: 27_000
  },
  supplementalDisclosures: {
    interestPaid: 3_500,
    taxesPaid: 9_750,
    nonCashTransactions: {
      assetAcquisitionByDebt: 10_000,
      stockIssuedForServices: 2_500
    }
  },
  netChangeInCash: 6_750,
  beginningCash: 15_000,
  endingCash: 21_750
};

describe('CashFlowStatementDetailed', () => {
  it('renders supplemental disclosures and summary totals', () => {
    render(<CashFlowStatementDetailed data={detailedCashFlow} showSupplemental />);

    expect(screen.getByText(/Detailed Cash Flow Statement/i)).toBeInTheDocument();
    expect(screen.getAllByText('$39,750')[0]).toBeInTheDocument();
    expect(screen.getByText(/Supplemental Cash Flow Disclosures/i)).toBeInTheDocument();
    expect(screen.getAllByText('$3,500')[0]).toBeInTheDocument();
  });

  it('reveals aggregated adjustment totals when toggled', async () => {
    const user = userEvent.setup();
    render(<CashFlowStatementDetailed data={detailedCashFlow} />);

    expect(screen.queryByText(/Total Adjustments/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show details/i }));

    expect(screen.getByText(/Total Adjustments/i)).toBeInTheDocument();
  });
});
