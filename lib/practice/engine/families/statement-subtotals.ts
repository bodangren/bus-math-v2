import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily, type ProblemPartDefinition } from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateMiniLedger, type MiniLedger, type MiniLedgerConfig } from '@/lib/practice/engine/mini-ledger';
import { generateMerchandisingTimeline } from '@/lib/practice/engine/merchandising';

export type StatementSubtotalsKind = 'balance-sheet' | 'income-statement' | 'equity-statement' | 'retail-income-statement';

export interface StatementSubtotalsRow extends ProblemPartDefinition {
  id: string;
  kind: 'editable' | 'prefilled';
  label: string;
  value?: number;
  placeholder?: string;
  sumOf?: string[];
  note?: string;
  targetId: number;
  details: {
    statementKind: StatementSubtotalsKind;
    rowRole: 'subtotal';
    sectionId: string;
    expectedValue: number;
    tolerance: number;
    explanation: string;
  };
}

export interface StatementSubtotalsSection {
  id: string;
  label: string;
  description?: string;
  rows: StatementSubtotalsRow[];
}

export interface StatementSubtotalsDefinition extends ProblemDefinition {
  miniLedger: MiniLedger;
  statementKind: StatementSubtotalsKind;
  sections: StatementSubtotalsSection[];
  rows: StatementSubtotalsRow[];
  parts: StatementSubtotalsRow[];
  scaffolding: {
    statementLabel: string;
    guidance: string;
    blanks: number;
  };
  workedExample?: Record<string, unknown>;
}

export type StatementSubtotalsResponse = Partial<Record<string, number>>;

export interface StatementSubtotalsConfig extends MiniLedgerConfig {
  mode?: ProblemDefinition['mode'];
  statementKind?: StatementSubtotalsKind;
  tolerance?: number;
  /** 'low' produces fewer blanks (e.g. income-statement: only net income is editable). Default: 'standard'. */
  density?: 'low' | 'standard';
}

export interface StatementSubtotalsReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

function scoreNumericPart(expected: number, actual: unknown, tolerance: number) {
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) {
    return {
      isCorrect: false,
      score: 0,
      normalizedAnswer: normalizePracticeValue(actual),
    };
  }

  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    normalizedAnswer: normalizePracticeValue(parsed),
  };
}

function createPrefilledRow(
  statementKind: StatementSubtotalsKind,
  id: string,
  label: string,
  value: number,
  note?: string,
): StatementSubtotalsRow {
  return {
    id,
    label,
    kind: 'prefilled',
    prompt: `${label} is provided in the statement snapshot.`,
    value,
    note,
    expectedAnswerShape: 'number',
    canonicalAnswer: value,
    explanation: `${label} is provided in the statement snapshot.`,
    artifactTarget: String(value),
    targetId: value,
    details: {
      statementKind,
      rowRole: 'subtotal',
      sectionId: 'prefilled',
      expectedValue: value,
      tolerance: 0,
      explanation: `${label} is provided in the statement snapshot.`,
    },
  };
}

function createEditableSubtotalRow(params: {
  statementKind: StatementSubtotalsKind;
  sectionId: string;
  id: string;
  label: string;
  expectedValue: number;
  sumOf: string[];
  tolerance: number;
  explanation: string;
  note?: string;
}): StatementSubtotalsRow {
  return {
    id: params.id,
    label: params.label,
    kind: 'editable',
    prompt: `What is ${params.label.toLowerCase()}?`,
    placeholder: '0',
    sumOf: params.sumOf,
    expectedAnswerShape: 'number',
    canonicalAnswer: params.expectedValue,
    explanation: params.explanation,
    misconceptionTags: [`${params.statementKind}-subtotal-error`, `${params.sectionId}-subtotal-error`],
    standardCode: `ACC-M7-Q-${params.statementKind.replace(/-/g, '').toUpperCase()}`,
    artifactTarget: String(params.expectedValue),
    targetId: params.expectedValue,
    note: params.note,
    details: {
      statementKind: params.statementKind,
      rowRole: 'subtotal',
      sectionId: params.sectionId,
      expectedValue: params.expectedValue,
      tolerance: params.tolerance,
      explanation: params.explanation,
    },
  };
}

function buildServiceIncomeStatement(ledger: MiniLedger, tolerance: number) {
  const revenueAccounts = ledger.accounts.filter((account) => account.accountType === 'revenue');
  const expenseAccounts = ledger.accounts.filter((account) => account.accountType === 'expense');

  const revenueRows = revenueAccounts.map((account) =>
    createPrefilledRow('income-statement', `revenue-${account.id}`, account.label, account.statementBalance, 'Revenue recognized in the period.'),
  );
  const expenseRows = expenseAccounts.map((account) =>
    createPrefilledRow('income-statement', `expense-${account.id}`, account.label, Math.abs(account.statementBalance), 'Expense recognized in the period.'),
  );

  const totalRevenue = revenueRows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  const totalRevenueRow = createEditableSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'revenues',
    id: 'total-revenue',
    label: 'Total Revenues',
    expectedValue: totalRevenue,
    sumOf: revenueRows.map((row) => row.id),
    tolerance,
    explanation: 'Add the revenue lines above.',
    note: 'Use the revenue section to find the total.',
  });
  const totalExpensesRow = createEditableSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'expenses',
    id: 'total-expenses',
    label: 'Total Expenses',
    expectedValue: totalExpenses,
    sumOf: expenseRows.map((row) => row.id),
    tolerance,
    explanation: 'Add the expense lines above.',
    note: 'Use the expense section to find the total.',
  });
  const netIncomeRow = createEditableSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'bottom-line',
    id: 'net-income',
    label: 'Net Income',
    expectedValue: netIncome,
    sumOf: [totalRevenueRow.id, totalExpensesRow.id],
    tolerance,
    explanation: 'Subtract total expenses from total revenues.',
    note: 'Use the section totals to find the bottom line.',
  });

  const sections: StatementSubtotalsSection[] = [
    {
      id: 'revenues',
      label: 'Revenues',
      description: 'Revenue lines are already given; complete the total at the bottom.',
      rows: [...revenueRows, totalRevenueRow],
    },
    {
      id: 'expenses',
      label: 'Expenses',
      description: 'Expense lines are already given; complete the total at the bottom.',
      rows: [...expenseRows, totalExpensesRow],
    },
    {
      id: 'bottom-line',
      label: 'Bottom Line',
      description: 'Use the section totals to calculate income.',
      rows: [netIncomeRow],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
    parts: [totalRevenueRow, totalExpensesRow, netIncomeRow],
    scaffolding: {
      statementLabel: 'Income statement',
      guidance: 'Fill in the missing subtotals after reading the statement rows.',
      blanks: 3,
    },
  };
}

function buildBalanceSheetSubtotals(ledger: MiniLedger, tolerance: number) {
  const assetRows = ledger.accounts
    .filter((account) => account.accountType === 'asset')
      .map((account) =>
      createPrefilledRow(
        'balance-sheet',
        `asset-${account.id}`,
        account.label,
        account.statementBalance,
        account.contraOf ? 'Contra assets reduce the section total.' : 'Asset line item.',
      ),
    );
  const liabilityRows = ledger.accounts
    .filter((account) => account.accountType === 'liability')
    .map((account) => createPrefilledRow('balance-sheet', `liability-${account.id}`, account.label, account.statementBalance, 'Liability line item.'));
  const equityRows = ledger.accounts
    .filter((account) => account.accountType === 'equity')
    .map((account) => createPrefilledRow('balance-sheet', `equity-${account.id}`, account.label, account.statementBalance, 'Equity line item.'));

  const totalAssets = assetRows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const totalClaims = [...liabilityRows, ...equityRows].reduce((sum, row) => sum + (row.value ?? 0), 0);

  const totalAssetsRow = createEditableSubtotalRow({
    statementKind: 'balance-sheet',
    sectionId: 'assets',
    id: 'total-assets',
    label: 'Total Assets',
    expectedValue: totalAssets,
    sumOf: assetRows.map((row) => row.id),
    tolerance,
    explanation: 'Add the asset section lines.',
    note: 'Use the asset section to calculate the total.',
  });
  const totalClaimsRow = createEditableSubtotalRow({
    statementKind: 'balance-sheet',
    sectionId: 'claims',
    id: 'total-liabilities-equity',
    label: 'Total Liabilities and Equity',
    expectedValue: totalClaims,
    sumOf: [...liabilityRows, ...equityRows].map((row) => row.id),
    tolerance,
    explanation: 'Add the liabilities and equity section lines.',
    note: 'Use the claims section to calculate the total.',
  });

  const sections: StatementSubtotalsSection[] = [
    {
      id: 'assets',
      label: 'Assets',
      description: 'The total assets line is missing.',
      rows: [...assetRows, totalAssetsRow],
    },
    {
      id: 'claims',
      label: 'Liabilities and Equity',
      description: 'The claims side needs its matching total.',
      rows: [...liabilityRows, ...equityRows, totalClaimsRow],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
    parts: [totalAssetsRow, totalClaimsRow],
    scaffolding: {
      statementLabel: 'Balance sheet',
      guidance: 'Use the row totals to complete the missing balance sheet subtotals.',
      blanks: 2,
    },
  };
}

function buildEquityStatement(ledger: MiniLedger, tolerance: number) {
  const beginningCapital = createPrefilledRow(
    'equity-statement',
    'beginning-capital',
    'Beginning Capital',
    ledger.totals.beginningCapital,
    'Starting owner capital before period activity.',
  );
  const netIncome = createPrefilledRow('equity-statement', 'net-income', 'Net Income', ledger.totals.netIncome, 'Income carried into equity.');
  const dividends = createPrefilledRow('equity-statement', 'dividends', 'Dividends', ledger.totals.dividends, 'Dividends reduce owner equity.');
  const endingCapital = createEditableSubtotalRow({
    statementKind: 'equity-statement',
    sectionId: 'equity',
    id: 'ending-capital',
    label: 'Ending Capital',
    expectedValue: ledger.totals.endingCapital,
    sumOf: [beginningCapital.id, netIncome.id, dividends.id],
    tolerance,
    explanation: 'Add beginning capital and net income, then subtract dividends.',
    note: 'Use the equity flow above to find the ending balance.',
  });

  const sections: StatementSubtotalsSection[] = [
    {
      id: 'equity',
      label: "Owner's Equity Statement",
      description: 'Only the ending capital subtotal is missing.',
      rows: [beginningCapital, netIncome, dividends, endingCapital],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
    parts: [endingCapital],
    scaffolding: {
      statementLabel: "Owner's equity statement",
      guidance: 'Read the equity flow and complete the final subtotal.',
      blanks: 1,
    },
  };
}

function buildRetailIncomeStatement(seed: number, ledger: MiniLedger, tolerance: number) {
  const rng = mulberry32(seed ^ 0x53ad2fc1);
  const timeline = generateMerchandisingTimeline(seed, {
    role: 'seller',
    discountMethod: pick(['gross', 'net'] as const, rng),
    paymentTiming: pick(['within-discount-period', 'after-discount-period'] as const, rng),
    fobCondition: pick(['shipping-point', 'destination'] as const, rng),
    saleAmount: pick([1200, 1500, 1800, 2400, 3000], rng),
    costAmount: pick([720, 900, 1080, 1440, 1800], rng),
    returnAmount: pick([0, 120, 150, 180, 240], rng),
    discountRate: pick([0.02, 0.05, 0.1] as const, rng),
    freightAmount: pick([0, 25, 35, 45, 60], rng),
  });

  const salesReturns = timeline.returnAmount;
  const salesDiscounts =
    timeline.discountMethod === 'gross' && timeline.paymentTiming === 'within-discount-period'
      ? Math.round((timeline.saleAmount - salesReturns) * timeline.discountRate)
      : 0;
  const netSales = timeline.saleAmount - salesReturns - salesDiscounts;
  const returnedCost = timeline.returnAmount > 0 ? Math.round((timeline.returnAmount / timeline.saleAmount) * timeline.costAmount) : 0;
  const costOfGoodsSold = Math.max(0, timeline.costAmount - returnedCost);
  const grossProfit = netSales - costOfGoodsSold;
  const operatingExpenses = ledger.totals.expenses;
  const netIncome = grossProfit - operatingExpenses;

  const grossSalesRow = createPrefilledRow('retail-income-statement', 'gross-sales', 'Gross Sales', timeline.saleAmount, 'Use the original retail selling price.');
  const salesReturnsRow = createPrefilledRow('retail-income-statement', 'sales-returns', 'Sales Returns and Allowances', salesReturns, 'Returns reduce sales revenue.');
  const salesDiscountsRow = createPrefilledRow('retail-income-statement', 'sales-discounts', 'Sales Discounts', salesDiscounts, 'Discounts reduce sales revenue when applicable.');
  const netSalesRow = createEditableSubtotalRow({
    statementKind: 'retail-income-statement',
    sectionId: 'sales',
    id: 'net-sales',
    label: 'Net Sales',
    expectedValue: netSales,
    sumOf: [grossSalesRow.id, salesReturnsRow.id, salesDiscountsRow.id],
    tolerance,
    explanation: 'Subtract returns and discounts from gross sales.',
    note: 'Use the sales lines to find net sales.',
  });
  const costOfGoodsSoldRow = createPrefilledRow('retail-income-statement', 'cogs', 'Cost of Goods Sold', costOfGoodsSold, 'Retail cost of the merchandise sold.');
  const grossProfitRow = createEditableSubtotalRow({
    statementKind: 'retail-income-statement',
    sectionId: 'profit',
    id: 'gross-profit',
    label: 'Gross Profit',
    expectedValue: grossProfit,
    sumOf: [netSalesRow.id, costOfGoodsSoldRow.id],
    tolerance,
    explanation: 'Subtract cost of goods sold from net sales.',
    note: 'Use the sales and cost lines to find gross profit.',
  });
  const operatingExpensesRow = createPrefilledRow('retail-income-statement', 'operating-expenses', 'Operating Expenses', operatingExpenses, 'Use the period expense total.');
  const netIncomeRow = createEditableSubtotalRow({
    statementKind: 'retail-income-statement',
    sectionId: 'bottom-line',
    id: 'retail-net-income',
    label: 'Net Income',
    expectedValue: netIncome,
    sumOf: [grossProfitRow.id, operatingExpensesRow.id],
    tolerance,
    explanation: 'Subtract operating expenses from gross profit.',
    note: 'Use gross profit and operating expenses to find net income.',
  });

  const sections: StatementSubtotalsSection[] = [
    {
      id: 'sales',
      label: 'Sales',
      description: 'Retail sales need a net sales subtotal.',
      rows: [grossSalesRow, salesReturnsRow, salesDiscountsRow, netSalesRow],
    },
    {
      id: 'profit',
      label: 'Merchandise Cost',
      description: 'Use net sales and cost of goods sold to find gross profit.',
      rows: [costOfGoodsSoldRow, grossProfitRow],
    },
    {
      id: 'expenses',
      label: 'Operating Expenses',
      description: 'The operating expense total is already provided.',
      rows: [operatingExpensesRow, netIncomeRow],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
    parts: [netSalesRow, grossProfitRow, netIncomeRow],
    scaffolding: {
      statementLabel: 'Retail income statement',
      guidance: 'Combine the sales lines, cost lines, and operating expenses to fill the blanks.',
      blanks: 3,
    },
  };
}

function buildLowDensityIncomeStatement(ledger: MiniLedger, tolerance: number) {
  const revenueAccounts = ledger.accounts.filter((account) => account.accountType === 'revenue');
  const expenseAccounts = ledger.accounts.filter((account) => account.accountType === 'expense');

  const revenueRows = revenueAccounts.map((account) =>
    createPrefilledRow('income-statement', `revenue-${account.id}`, account.label, account.statementBalance, 'Revenue recognized in the period.'),
  );
  const expenseRows = expenseAccounts.map((account) =>
    createPrefilledRow('income-statement', `expense-${account.id}`, account.label, Math.abs(account.statementBalance), 'Expense recognized in the period.'),
  );

  const totalRevenue = revenueRows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const netIncome = totalRevenue - totalExpenses;

  // Low density: section totals are prefilled, only net income is editable
  const totalRevenueRow = createPrefilledRow('income-statement', 'total-revenue', 'Total Revenues', totalRevenue, 'Add the revenue lines above.');
  const totalExpensesRow = createPrefilledRow('income-statement', 'total-expenses', 'Total Expenses', totalExpenses, 'Add the expense lines above.');
  const netIncomeRow = createEditableSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'bottom-line',
    id: 'net-income',
    label: 'Net Income',
    expectedValue: netIncome,
    sumOf: [totalRevenueRow.id, totalExpensesRow.id],
    tolerance,
    explanation: 'Subtract total expenses from total revenues.',
    note: 'Use the section totals to find the bottom line.',
  });

  const sections: StatementSubtotalsSection[] = [
    {
      id: 'revenues',
      label: 'Revenues',
      description: 'Revenue lines and total are already given.',
      rows: [...revenueRows, totalRevenueRow],
    },
    {
      id: 'expenses',
      label: 'Expenses',
      description: 'Expense lines and total are already given.',
      rows: [...expenseRows, totalExpensesRow],
    },
    {
      id: 'bottom-line',
      label: 'Bottom Line',
      description: 'Use the totals above to finish the income statement.',
      rows: [netIncomeRow],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
    parts: [netIncomeRow],
    scaffolding: {
      statementLabel: 'Income statement',
      guidance: 'Use the totals above to complete the bottom line.',
      blanks: 1,
    },
  };
}

function buildStatementBody(kind: StatementSubtotalsKind, seed: number, ledger: MiniLedger, tolerance: number, density: 'low' | 'standard' = 'standard') {
  if (kind === 'balance-sheet') {
    return buildBalanceSheetSubtotals(ledger, tolerance);
  }

  if (kind === 'equity-statement') {
    return buildEquityStatement(ledger, tolerance);
  }

  if (kind === 'retail-income-statement') {
    return buildRetailIncomeStatement(seed, ledger, tolerance);
  }

  if (density === 'low') {
    return buildLowDensityIncomeStatement(ledger, tolerance);
  }

  return buildServiceIncomeStatement(ledger, tolerance);
}

function buildReviewFeedback(
  part: StatementSubtotalsRow,
  studentResponse: StatementSubtotalsResponse,
  gradeResultPart: GradeResult['parts'][number],
): StatementSubtotalsReviewFeedback {
  const selectedValue = studentResponse[part.id];
  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    selectedLabel: selectedValue === undefined ? 'Not entered' : formatAmount(Number(selectedValue)),
    expectedLabel: formatAmount(part.targetId),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `${part.label} is correct.`
      : `${part.label} should be ${formatAmount(part.targetId)}.`,
  };
}

export function buildStatementSubtotalsReviewFeedback(
  definition: StatementSubtotalsDefinition,
  studentResponse: StatementSubtotalsResponse,
  gradeResult: GradeResult,
) : Record<string, StatementSubtotalsReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((partResult) => {
      const part = definition.parts.find((entry) => entry.id === partResult.partId);
      if (!part) {
        return [
          partResult.partId,
          {
            status: partResult.isCorrect ? 'correct' : 'incorrect',
            selectedLabel: 'Not entered',
            expectedLabel: 'Unknown',
            misconceptionTags: partResult.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      return [part.id, buildReviewFeedback(part, studentResponse, partResult)] as const;
    }),
  ) as Record<string, StatementSubtotalsReviewFeedback>;
}

export const statementSubtotalsFamily: ProblemFamily<
  StatementSubtotalsDefinition,
  StatementSubtotalsResponse,
  StatementSubtotalsConfig
> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x3d4c2b19);
    const statementKind = config.statementKind ?? pick(
      ['balance-sheet', 'income-statement', 'equity-statement', 'retail-income-statement'] as const,
      rng,
    );
    const miniLedger = generateMiniLedger(seed, {
      ...config,
      companyType: statementKind === 'balance-sheet' || statementKind === 'retail-income-statement' ? 'retail' : 'service',
      includeContraAccounts: statementKind === 'balance-sheet' || statementKind === 'retail-income-statement',
      capitalMode: 'ending',
    });
    const tolerance = config.tolerance ?? 0;
    const density = config.density ?? 'standard';
    const body = buildStatementBody(statementKind, seed, miniLedger, tolerance, density);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'statement-subtotals',
      mode: config.mode ?? 'assessment',
      activityId: `statement-subtotals-${statementKind}-${seed}`,
      prompt: {
        title: `Complete the ${body.scaffolding.statementLabel.toLowerCase()}`,
        stem: body.scaffolding.guidance,
      },
      miniLedger,
      statementKind,
      sections: body.sections,
      rows: body.rows,
      parts: body.parts,
      scaffolding: body.scaffolding,
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'mini-ledger',
        seed,
        companyType: miniLedger.companyType,
        statementKind,
      },
    };
  },

  solve(definition) {
    return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId]));
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const scoreResult = scoreNumericPart(part.targetId, studentResponse[part.id], part.details.tolerance);
      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: scoreResult.normalizedAnswer,
        isCorrect: scoreResult.isCorrect,
        score: scoreResult.score,
        maxScore: 1,
        misconceptionTags: scoreResult.isCorrect ? [] : [part.details.statementKind, `${part.details.sectionId}-subtotal-error`],
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'All statement subtotals are correct.'
        : 'Recheck the dependent subtotals and section totals.',
    };
  },

  toEnvelope(definition, studentResponse, gradeResult) {
    return buildPracticeSubmissionEnvelopeFromGrade(
      {
        activityId: definition.activityId,
        mode: definition.mode,
      },
      studentResponse,
      gradeResult,
    );
  },
};
