import { describe, expect, it } from 'vitest';

import {
  generateAccrualAdjustmentScenario,
  generateAdjustmentScenario,
  generateDeferralAdjustmentScenario,
  generateDepreciationAdjustmentScenario,
} from '@/lib/practice/engine/adjustments';

describe('adjustment scenario generator', () => {
  it('is deterministic for the same seed when using the default scenario picker', () => {
    const scenario = generateAdjustmentScenario(2026);

    expect(scenario).toEqual(generateAdjustmentScenario(2026));
    expect(['deferral', 'accrual', 'depreciation']).toContain(scenario.kind);
  });

  it('builds deferral scenarios with mirrored asset and expense methods', () => {
    const assetMethod = generateDeferralAdjustmentScenario(7, {
      accountLabel: 'Insurance',
      amount: 1200,
      coverageMonths: 12,
      initialRecordingMethod: 'asset',
      reportingDate: '2026-03-31',
      startDate: '2026-01-01',
    });
    const expenseMethod = generateDeferralAdjustmentScenario(7, {
      accountLabel: 'Insurance',
      amount: 1200,
      coverageMonths: 12,
      initialRecordingMethod: 'expense',
      reportingDate: '2026-03-31',
      startDate: '2026-01-01',
    });

    expect(assetMethod).toMatchObject({
      kind: 'deferral',
      method: 'asset',
      accountLabel: 'Insurance',
      adjustmentAmount: 300,
      elapsedMonths: 3,
      remainingAmount: 900,
      entry: {
        debitLabel: 'Insurance Expense',
        creditLabel: 'Prepaid Insurance',
        amount: 300,
      },
    });
    expect(expenseMethod).toMatchObject({
      kind: 'deferral',
      method: 'expense',
      accountLabel: 'Insurance',
      adjustmentAmount: 300,
      elapsedMonths: 3,
      remainingAmount: 900,
      amount: 900, // expense-method uses remainingAmount (unexpired portion)
      entry: {
        debitLabel: 'Prepaid Insurance',
        creditLabel: 'Insurance Expense',
        amount: 900, // correcting entry reclassifies the unexpired portion
      },
    });
  });

  it('builds accrual scenarios for both revenue and expense adjustments', () => {
    const revenue = generateAccrualAdjustmentScenario(11, {
      amount: 800,
      accrualKind: 'revenue',
      accountLabel: 'Service Revenue',
      incurredDate: '2026-03-28',
      reportingDate: '2026-03-31',
    });
    const expense = generateAccrualAdjustmentScenario(11, {
      amount: 540,
      accrualKind: 'expense',
      accountLabel: 'Wages Expense',
      incurredDate: '2026-03-27',
      reportingDate: '2026-03-31',
    });

    expect(revenue).toMatchObject({
      kind: 'accrual',
      accrualKind: 'revenue',
      amount: 800,
      entry: {
        debitLabel: 'Accounts Receivable',
        creditLabel: 'Service Revenue',
        amount: 800,
      },
    });
    expect(expense).toMatchObject({
      kind: 'accrual',
      accrualKind: 'expense',
      amount: 540,
      entry: {
        debitLabel: 'Wages Expense',
        creditLabel: 'Wages Payable',
        amount: 540,
      },
    });
  });

  it('builds depreciation scenarios with straight-line and variable salvage methods', () => {
    const straightLine = generateDepreciationAdjustmentScenario(19, {
      assetCategory: 'Equipment',
      cost: 4800,
      salvageValue: 1200,
      usefulLifeMonths: 12,
      purchaseDate: '2026-01-01',
      reportingDate: '2026-03-31',
      method: 'straight-line',
    });
    const variableSalvage = generateDepreciationAdjustmentScenario(19, {
      assetCategory: 'Equipment',
      cost: 4800,
      salvageValue: 600,
      usefulLifeMonths: 10,
      purchaseDate: '2026-01-01',
      reportingDate: '2026-03-31',
      method: 'variable-salvage',
    });

    expect(straightLine).toMatchObject({
      kind: 'depreciation',
      method: 'straight-line',
      assetCategory: 'Equipment',
      depreciationExpense: 900,
      accumulatedDepreciation: 900,
      carryingAmount: 3900,
      entry: {
        debitLabel: 'Depreciation Expense',
        creditLabel: 'Accumulated Depreciation - Equipment',
        amount: 900,
      },
    });
    expect(variableSalvage).toMatchObject({
      kind: 'depreciation',
      method: 'variable-salvage',
      assetCategory: 'Equipment',
      depreciationExpense: 1260,
      accumulatedDepreciation: 1260,
      carryingAmount: 3540,
      entry: {
        debitLabel: 'Depreciation Expense',
        creditLabel: 'Accumulated Depreciation - Equipment',
        amount: 1260,
      },
    });
  });
});
