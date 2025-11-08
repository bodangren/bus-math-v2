import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  BalanceSheetDetailed,
  type BalanceSheetDetailedData
} from './BalanceSheetDetailed';

const detailedSheet: BalanceSheetDetailedData = {
  asOfDate: 'As of December 31, 2024',
  assets: {
    currentAssets: {
      cashAndEquivalents: {
        cashOnHand: 2_500,
        checkingAccount: 18_750,
        savingsAccount: 12_500,
        moneyMarketFunds: 8_000,
        totalCash: 41_750
      },
      receivables: {
        accountsReceivable: 22_000,
        notesReceivable: 3_500,
        allowanceForDoubtfulAccounts: -2_000,
        netReceivables: 23_500
      },
      inventory: {
        rawMaterials: 8_000,
        workInProcess: 5_000,
        finishedGoods: 15_000,
        totalInventory: 28_000
      },
      otherCurrentAssets: {
        prepaidExpenses: 4_500,
        marketableSecurities: 6_000,
        totalOtherCurrent: 10_500
      },
      totalCurrentAssets: 103_750
    },
    fixedAssets: {
      propertyPlantEquipment: {
        land: 35_000,
        buildings: 95_000,
        equipment: 58_000,
        vehicles: 25_000,
        furniture: 12_000,
        totalPPE: 225_000,
        accumulatedDepreciation: -45_000,
        netPPE: 180_000
      },
      intangibleAssets: {
        patents: 15_000,
        trademarks: 8_000,
        goodwill: 22_000,
        totalIntangible: 45_000
      },
      investments: {
        longTermInvestments: 18_000,
        subsidiaryInvestments: 12_000,
        totalInvestments: 30_000
      },
      totalFixedAssets: 255_000
    },
    totalAssets: 358_750
  },
  liabilities: {
    currentLiabilities: {
      payables: {
        accountsPayable: 15_500,
        notesPayable: 8_000,
        accruedExpenses: 6_200,
        totalPayables: 29_700
      },
      shortTermDebt: {
        shortTermLoans: 12_000,
        currentPortionLongTerm: 8_500,
        totalShortTermDebt: 20_500
      },
      otherCurrentLiabilities: {
        accruedWages: 4_200,
        accruedTaxes: 3_800,
        deferredRevenue: 2_500,
        totalOtherCurrent: 10_500
      },
      totalCurrentLiabilities: 60_700
    },
    longTermLiabilities: {
      longTermDebt: {
        mortgagePayable: 75_000,
        bondsPayable: 50_000,
        bankLoans: 35_000,
        totalLongTermDebt: 160_000
      },
      otherLongTermLiabilities: {
        deferredTaxLiability: 8_500,
        pensionLiability: 12_000,
        totalOtherLongTerm: 20_500
      },
      totalLongTermLiabilities: 180_500
    },
    totalLiabilities: 241_200
  },
  equity: {
    paidInCapital: {
      commonStock: 50_000,
      preferredStock: 25_000,
      additionalPaidInCapital: 15_000,
      totalPaidInCapital: 90_000
    },
    retainedEarnings: {
      beginningRetainedEarnings: 35_000,
      netIncome: 29_250,
      dividendsPaid: -8_000,
      endingRetainedEarnings: 56_250
    },
    otherEquity: {
      treasuryStock: -5_000,
      accumulatedOtherIncome: -23_700,
      totalOtherEquity: -28_700
    },
    totalEquity: 117_550
  },
  totalLiabilitiesAndEquity: 358_750
};

describe('BalanceSheetDetailed', () => {
  it('displays the full financial statement summary', () => {
    render(<BalanceSheetDetailed data={detailedSheet} />);

    expect(screen.getAllByText(/stockholders/i)[0]).toBeInTheDocument();
    expect(screen.getByText('$103,750')).toBeInTheDocument();
    expect(screen.getByText(/Balanced/i)).toBeInTheDocument();
  });

  it('reveals nested line items when show details is toggled', async () => {
    const user = userEvent.setup();
    render(<BalanceSheetDetailed data={detailedSheet} />);

    expect(screen.queryByText(/Accounts Receivable/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show details/i }));

    expect(screen.getByText(/Accounts Receivable/i)).toBeInTheDocument();
  });
});
