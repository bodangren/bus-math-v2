import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  IncomeStatementSimple,
  type IncomeStatementSimpleData
} from './IncomeStatementSimple';

const profitableStatement: IncomeStatementSimpleData = {
  period: 'For the Year Ended December 31, 2024',
  revenue: 250_000,
  costOfGoodsSold: 150_000,
  grossProfit: 100_000,
  operatingExpenses: 60_000,
  operatingIncome: 40_000,
  otherIncome: 2_000,
  interestExpense: 3_000,
  netIncomeBeforeTaxes: 39_000,
  taxes: 9_750,
  netIncome: 29_250
};

const lossStatement: IncomeStatementSimpleData = {
  ...profitableStatement,
  revenue: 90_000,
  grossProfit: -10_000,
  operatingIncome: -15_000,
  netIncomeBeforeTaxes: -14_000,
  taxes: 0,
  netIncome: -14_000
};

describe('IncomeStatementSimple', () => {
  it('renders financial data and calculated margin callouts', () => {
    render(
      <IncomeStatementSimple
        data={profitableStatement}
        title="TechStart Income Statement"
        showCalculations
      />
    );

    expect(screen.getByText('TechStart Income Statement')).toBeInTheDocument();
    expect(
      screen.getByText(profitableStatement.period)
    ).toBeInTheDocument();
    expect(screen.getByText('$250,000')).toBeInTheDocument();
    expect(screen.getByText('$29,250')).toBeInTheDocument();

    expect(screen.getByText('40.0%')).toBeInTheDocument(); // gross margin
    expect(
      screen.getByText(/Gross Profit = Revenue - Cost of Goods Sold/i)
    ).toBeInTheDocument();
  });

  it('labels the statement as a loss when net income is negative', () => {
    render(<IncomeStatementSimple data={lossStatement} />);

    expect(screen.getByText('Loss')).toBeInTheDocument();
  });
});
