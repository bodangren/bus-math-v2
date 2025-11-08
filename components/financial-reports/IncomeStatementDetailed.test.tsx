import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  IncomeStatementDetailed,
  type IncomeStatementDetailedData
} from './IncomeStatementDetailed';

const detailedStatement: IncomeStatementDetailedData = {
  period: 'For the Year Ended December 31, 2024',
  revenues: {
    productSales: 180_000,
    serviceSales: 65_000,
    otherRevenues: 5_000,
    totalRevenue: 250_000
  },
  costOfGoodsSold: {
    beginningInventory: 25_000,
    purchases: 120_000,
    directLabor: 45_000,
    manufacturingOverhead: 18_000,
    goodsAvailableForSale: 208_000,
    endingInventory: 35_000,
    totalCOGS: 173_000
  },
  grossProfit: 77_000,
  operatingExpenses: {
    selling: {
      advertising: 12_000,
      salesCommissions: 8_000,
      deliveryExpense: 3_000,
      totalSelling: 23_000
    },
    administrative: {
      salaries: 35_000,
      rent: 18_000,
      utilities: 4_500,
      insurance: 3_500,
      depreciation: 8_000,
      totalAdministrative: 69_000
    },
    totalOperating: 92_000
  },
  operatingIncome: -15_000,
  nonOperating: {
    interestIncome: 1_200,
    dividendIncome: 800,
    gainOnSaleOfAssets: 2_000,
    totalOtherIncome: 4_000,
    interestExpense: 3_500,
    totalNonOperating: 500
  },
  incomeBeforeTaxes: -14_500,
  incomeTaxes: {
    currentTax: 0,
    deferredTax: -2_175,
    totalTaxes: -2_175
  },
  netIncome: -12_325
};

describe('IncomeStatementDetailed', () => {
  it('reveals cost of goods sold breakdown when toggled', async () => {
    const user = userEvent.setup();
    render(<IncomeStatementDetailed data={detailedStatement} />);

    expect(
      screen.queryByText(/Beginning Inventory/i)
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show details/i }));

    expect(screen.getByText(/Beginning Inventory/i)).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
  });

  it('shows a loss badge when net income is negative', () => {
    render(<IncomeStatementDetailed data={detailedStatement} />);

    expect(screen.getByText(/Loss/i)).toBeInTheDocument();
  });
});
