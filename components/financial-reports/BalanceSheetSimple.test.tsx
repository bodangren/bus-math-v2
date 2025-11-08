import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  BalanceSheetSimple,
  type BalanceSheetSimpleData
} from './BalanceSheetSimple';

const balancedSheet: BalanceSheetSimpleData = {
  asOfDate: 'As of December 31, 2024',
  assets: {
    currentAssets: {
      cash: 37_750,
      accountsReceivable: 18_500,
      inventory: 25_000,
      prepaidExpenses: 3_500,
      totalCurrentAssets: 84_750
    },
    fixedAssets: {
      equipment: 45_000,
      accumulatedDepreciation: -15_000,
      netEquipment: 30_000,
      buildings: 85_000,
      land: 25_000,
      totalFixedAssets: 140_000
    },
    totalAssets: 224_750
  },
  liabilities: {
    currentLiabilities: {
      accountsPayable: 12_500,
      accruedLiabilities: 4_200,
      shortTermDebt: 8_000,
      totalCurrentLiabilities: 24_700
    },
    longTermLiabilities: {
      longTermDebt: 45_000,
      mortgagePayable: 65_000,
      totalLongTermLiabilities: 110_000
    },
    totalLiabilities: 134_700
  },
  equity: {
    commonStock: 50_000,
    retainedEarnings: 40_050,
    totalEquity: 90_050
  },
  totalLiabilitiesAndEquity: 224_750
};

const unbalancedSheet: BalanceSheetSimpleData = {
  ...balancedSheet,
  totalLiabilitiesAndEquity: 220_000
};

describe('BalanceSheetSimple', () => {
  it('indicates when the statement is balanced and shows ratios', () => {
    render(<BalanceSheetSimple data={balancedSheet} showRatios />);

    expect(screen.getByText(/Balanced/i)).toBeInTheDocument();
    expect(screen.getByText('$84,750')).toBeInTheDocument();
    expect(screen.getByText('$90,050')).toBeInTheDocument();
    expect(screen.getByText('Working Capital')).toBeInTheDocument();
  });

  it('flags out-of-balance statements when totals mismatch', () => {
    render(<BalanceSheetSimple data={unbalancedSheet} showCalculations />);

    expect(screen.getByText(/Out of Balance/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Balance Sheet does not balance/i)
    ).toBeInTheDocument();
  });
});
