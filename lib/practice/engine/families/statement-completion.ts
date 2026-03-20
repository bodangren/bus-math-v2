import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily, type ProblemPartDefinition } from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateMiniLedger, type MiniLedger, type MiniLedgerConfig } from '@/lib/practice/engine/mini-ledger';

export type StatementCompletionKind = 'income-statement' | 'balance-sheet' | 'equity-statement';

export interface StatementCompletionRow {
  id: string;
  label: string;
  kind: 'editable' | 'prefilled' | 'subtotal';
  value?: number;
  placeholder?: string;
  sumOf?: string[];
  note?: string;
  targetId?: number;
  prompt?: string;
  expectedAnswerShape?: string;
  canonicalAnswer?: unknown;
  explanation?: string;
  misconceptionTags?: string[];
  standardCode?: string;
  artifactTarget?: string;
  details?: {
    statementKind: StatementCompletionKind;
    statementLabel: string;
    rowRole: string;
    sourceLabels: string[];
    tolerance: number;
    explanation: string;
  };
}

export interface StatementCompletionSection {
  id: string;
  label: string;
  description?: string;
  rows: StatementCompletionRow[];
}

export interface StatementCompletionPart extends ProblemPartDefinition {
  id: string;
  kind: 'editable';
  label: string;
  description: string;
  targetId: number;
  note?: string;
  details: NonNullable<StatementCompletionRow['details']>;
}

export interface StatementCompletionDefinition extends ProblemDefinition {
  miniLedger: MiniLedger;
  statementKind: StatementCompletionKind;
  sections: StatementCompletionSection[];
  rows: StatementCompletionRow[];
  parts: StatementCompletionPart[];
  scaffolding: {
    statementLabel: string;
    guidance: string;
    blanks: number;
  };
  workedExample?: Record<string, unknown>;
}

export type StatementCompletionResponse = Partial<Record<string, number>>;

export interface StatementCompletionConfig extends MiniLedgerConfig {
  mode?: ProblemDefinition['mode'];
  statementKind?: StatementCompletionKind;
  tolerance?: number;
}

export interface StatementCompletionReviewFeedback {
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

function createSubtotalRow(id: string, label: string, sumOf: string[], note?: string): StatementCompletionRow {
  return {
    id,
    label,
    kind: 'subtotal',
    sumOf,
    note,
  };
}

function createPrefilledRow(id: string, label: string, value: number, note?: string): StatementCompletionRow {
  return {
    id,
    label,
    kind: 'prefilled',
    value,
    note,
  };
}

function createEditableRow(
  statementKind: StatementCompletionKind,
  statementLabel: string,
  id: string,
  label: string,
  targetId: number,
  rowRole: string,
  sourceLabels: string[],
  tolerance: number,
  explanation: string,
  note?: string,
): StatementCompletionPart {
  return {
    id,
    label,
    kind: 'editable',
    description: `Complete the ${label.toLowerCase()}.`,
    prompt: `What is ${label.toLowerCase()}?`,
    expectedAnswerShape: 'number',
    canonicalAnswer: targetId,
    explanation,
    misconceptionTags: [`${statementKind}-mismatch`, `${rowRole}-error`],
    standardCode: `ACC-M7-D-${statementKind.replace(/-/g, '').toUpperCase()}`,
    artifactTarget: String(targetId),
    targetId,
    note,
    details: {
      statementKind,
      statementLabel,
      rowRole,
      sourceLabels,
      tolerance,
      explanation,
    },
  };
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

function accountDisplayAmount(account: MiniLedger['accounts'][number]) {
  return account.statementBalance;
}

function sumRowValues(rows: StatementCompletionRow[]) {
  return rows.reduce((sum, row) => sum + (row.kind === 'editable' ? 0 : row.value ?? 0), 0);
}

function buildIncomeStatement(ledger: MiniLedger, tolerance: number) {
  const revenueAccounts = ledger.accounts.filter((account) => account.accountType === 'revenue');
  const expenseAccounts = ledger.accounts.filter((account) => account.accountType === 'expense');

  const revenueRows = revenueAccounts.map((account) =>
    createPrefilledRow(
      `revenue-${account.id}`,
      account.label,
      accountDisplayAmount(account),
      'Revenue recognized in the period.',
    ),
  );
  const expenseRows = expenseAccounts.map((account) =>
    createPrefilledRow(
      `expense-${account.id}`,
      account.label,
      accountDisplayAmount(account),
      'Expense recognized in the period.',
    ),
  );

  const totalRevenueRow = createSubtotalRow(
    'total-revenues',
    'Total Revenues',
    revenueRows.map((row) => row.id),
    'Add the revenue lines above.',
  );
  const totalExpenseRow = createSubtotalRow(
    'total-expenses',
    'Total Expenses',
    expenseRows.map((row) => row.id),
    'Add the expense lines above.',
  );
  const netIncome = ledger.totals.revenue - ledger.totals.expenses;
  const netIncomePart = createEditableRow(
    'income-statement',
    'Income Statement',
    'net-income',
    'Net Income',
    netIncome,
    'net-income',
    [totalRevenueRow.label, totalExpenseRow.label],
    tolerance,
    'Net income equals total revenues minus total expenses.',
    'Subtract total expenses from total revenues.',
  );

  const sections: StatementCompletionSection[] = [
    {
      id: 'revenues',
      label: 'Revenue Section',
      description: 'Recognize the earning side of the statement first.',
      rows: [...revenueRows, totalRevenueRow],
    },
    {
      id: 'expenses',
      label: 'Expense Section',
      description: 'List the period costs before calculating the bottom line.',
      rows: [...expenseRows, totalExpenseRow],
    },
    {
      id: 'bottom-line',
      label: 'Bottom Line',
      description: 'Use the totals above to finish the income statement.',
      rows: [netIncomePart],
    },
  ];

  return {
    sections,
    parts: [netIncomePart],
    rows: sections.flatMap((section) => section.rows),
    scaffolding: {
      statementLabel: 'Income statement',
      guidance: 'Use the totals above to complete the bottom line.',
      blanks: 1,
    },
  };
}

function buildBalanceSheet(ledger: MiniLedger, tolerance: number) {
  const assetAccounts = ledger.accounts.filter((account) => account.accountType === 'asset');
  const liabilityAccounts = ledger.accounts.filter((account) => account.accountType === 'liability');
  const equityAccounts = ledger.accounts.filter((account) => account.accountType === 'equity');

  const assetRows = assetAccounts.map((account) =>
    createPrefilledRow(
      `asset-${account.id}`,
      account.label,
      accountDisplayAmount(account),
      account.contraOf ? 'Contra asset included in the asset section.' : 'Asset balance in the statement.',
    ),
  );
  const liabilityRows = liabilityAccounts.map((account) =>
    createPrefilledRow(
      `liability-${account.id}`,
      account.label,
      accountDisplayAmount(account),
      'Liability balance in the claims section.',
    ),
  );
  const equityRows = equityAccounts.map((account) =>
    createPrefilledRow(
      `equity-${account.id}`,
      account.label,
      accountDisplayAmount(account),
      'Equity balance in the claims section.',
    ),
  );

  const totalAssets = sumRowValues(assetRows);
  const totalClaims = sumRowValues(liabilityRows) + sumRowValues(equityRows);

  const totalAssetsPart = createEditableRow(
    'balance-sheet',
    'Balance Sheet',
    'total-assets',
    'Total Assets',
    totalAssets,
    'total-assets',
    assetRows.map((row) => row.label),
    tolerance,
    'Total assets equal the sum of the asset section.',
    'Add the asset section rows.',
  );
  const totalClaimsPart = createEditableRow(
    'balance-sheet',
    'Balance Sheet',
    'total-liabilities-equity',
    'Total Liabilities and Equity',
    totalClaims,
    'total-liabilities-equity',
    [...liabilityRows.map((row) => row.label), ...equityRows.map((row) => row.label)],
    tolerance,
    'Total liabilities and equity equal the claims section.',
    'Add liabilities and equity.',
  );

  const sections: StatementCompletionSection[] = [
    {
      id: 'assets',
      label: 'Assets',
      description: 'Start with the resources the business controls.',
      rows: [...assetRows, totalAssetsPart],
    },
    {
      id: 'claims',
      label: 'Liabilities and Equity',
      description: 'The claims side must match total assets.',
      rows: [...liabilityRows, ...equityRows, totalClaimsPart],
    },
  ];

  return {
    sections,
    parts: [totalAssetsPart, totalClaimsPart],
    rows: sections.flatMap((section) => section.rows),
    scaffolding: {
      statementLabel: 'Balance sheet',
      guidance: 'Use the grouped sections to complete both totals.',
      blanks: 2,
    },
  };
}

function buildEquityStatement(ledger: MiniLedger, tolerance: number) {
  const beginningCapital = createPrefilledRow(
    'beginning-capital',
    'Beginning Capital',
    ledger.totals.beginningCapital,
    'Starting owner equity at the beginning of the period.',
  );
  const netIncome = createPrefilledRow('net-income', 'Net Income', ledger.totals.netIncome, 'Carried from the income statement.');
  const dividends = createPrefilledRow('dividends', 'Dividends', ledger.totals.dividends, 'Withdrawals reduce owner equity.');
  const endingCapital = createEditableRow(
    'equity-statement',
    'Owner\'s Equity Statement',
    'ending-capital',
    'Ending Capital',
    ledger.totals.endingCapital,
    'ending-capital',
    [beginningCapital.label, netIncome.label, dividends.label],
    tolerance,
    'Ending capital equals beginning capital plus net income minus dividends.',
    'Add beginning capital and net income, then subtract dividends.',
  );

  const sections: StatementCompletionSection[] = [
    {
      id: 'equity',
      label: 'Owner\'s Equity Statement',
      description: 'The ending balance closes the statement.',
      rows: [beginningCapital, netIncome, dividends, endingCapital],
    },
  ];

  return {
    sections,
    parts: [endingCapital],
    rows: sections.flatMap((section) => section.rows),
    scaffolding: {
      statementLabel: 'Owner\'s equity statement',
      guidance: 'Carry the period activity into the ending balance.',
      blanks: 1,
    },
  };
}

function buildStatementBody(statementKind: StatementCompletionKind, ledger: MiniLedger, tolerance: number) {
  if (statementKind === 'balance-sheet') {
    return buildBalanceSheet(ledger, tolerance);
  }

  if (statementKind === 'equity-statement') {
    return buildEquityStatement(ledger, tolerance);
  }

  return buildIncomeStatement(ledger, tolerance);
}

function buildReviewFeedback(
  part: StatementCompletionPart,
  studentResponse: StatementCompletionResponse,
  gradeResultPart: GradeResult['parts'][number],
): StatementCompletionReviewFeedback {
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

export function buildStatementCompletionReviewFeedback(
  definition: StatementCompletionDefinition,
  studentResponse: StatementCompletionResponse,
  gradeResult: GradeResult,
) : Record<string, StatementCompletionReviewFeedback> {
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
  ) as Record<string, StatementCompletionReviewFeedback>;
}

export const statementCompletionFamily: ProblemFamily<
  StatementCompletionDefinition,
  StatementCompletionResponse,
  StatementCompletionConfig
> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x2b8e5c11);
    const statementKind = config.statementKind ?? pick<StatementCompletionKind>(
      ['income-statement', 'balance-sheet', 'equity-statement'],
      rng,
    );
    const companyType =
      config.companyType ??
      (statementKind === 'balance-sheet' ? 'retail' : 'service');
    const includeContraAccounts = config.includeContraAccounts ?? statementKind === 'balance-sheet';
    const miniLedger = generateMiniLedger(seed, {
      ...config,
      companyType,
      includeContraAccounts,
      capitalMode: 'ending',
    });
    const tolerance = config.tolerance ?? 0;
    const body = buildStatementBody(statementKind, miniLedger, tolerance);
    const statementLabel = body.scaffolding.statementLabel;

    return {
      contractVersion: 'practice.v1',
      familyKey: 'statement-completion',
      mode: config.mode ?? 'assessment',
      activityId: `statement-completion-${statementKind}-${seed}`,
      prompt: {
        title: `Complete the ${statementLabel.toLowerCase()}`,
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
        misconceptionTags: scoreResult.isCorrect ? [] : [part.details.rowRole, `${part.details.statementKind}-mismatch`],
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'All statement blanks are correct.'
        : 'Recheck the section totals and the statement flow.',
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
