import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily, type ProblemPartDefinition } from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateMiniLedger, type MiniLedger, type MiniLedgerAccount, type MiniLedgerConfig } from '@/lib/practice/engine/mini-ledger';
import { type PracticeAccount } from '@/lib/practice/engine/accounts';

export type StatementConstructionKind = 'balance-sheet' | 'income-statement';

export interface StatementConstructionBankItem {
  id: string;
  label: string;
  accountType: PracticeAccount['accountType'];
  statementPlacement: PracticeAccount['statementPlacement'];
  amount: number;
  included: boolean;
}

export interface StatementConstructionRow extends ProblemPartDefinition {
  id: string;
  kind: 'editable';
  label: string;
  editableField: 'label' | 'amount';
  value?: number;
  placeholder?: string;
  sumOf?: string[];
  note?: string;
  targetId: string | number;
  details: {
    statementKind: StatementConstructionKind;
    sectionId: string;
    rowRole: 'account-placement' | 'subtotal';
    expectedAnswerType: 'label' | 'number';
    expectedLabel?: string;
    expectedValue?: number;
    accountId?: string;
    accountType?: PracticeAccount['accountType'];
    bankStatus: 'included' | 'distractor';
    tolerance: number;
    explanation: string;
  };
}

export interface StatementConstructionSection {
  id: string;
  label: string;
  description?: string;
  rows: StatementConstructionRow[];
}

export interface StatementConstructionDefinition extends ProblemDefinition {
  miniLedger: MiniLedger;
  statementKind: StatementConstructionKind;
  accountBank: StatementConstructionBankItem[];
  sections: StatementConstructionSection[];
  rows: StatementConstructionRow[];
  parts: StatementConstructionRow[];
  scaffolding: {
    statementLabel: string;
    guidance: string;
    bankLabel: string;
    blanks: number;
  };
  workedExample?: Record<string, unknown>;
}

export type StatementConstructionResponse = Partial<Record<string, string | number>>;

export interface StatementConstructionConfig extends MiniLedgerConfig {
  mode?: ProblemDefinition['mode'];
  statementKind?: StatementConstructionKind;
  tolerance?: number;
}

export interface StatementConstructionReviewFeedback {
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

function shuffle<T>(items: T[], rng: () => number) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
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

function scoreLabelPart(expected: string, actual: unknown) {
  const normalized = normalizePracticeValue(actual);
  const isCorrect = normalized === normalizePracticeValue(expected);
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    normalizedAnswer: normalized,
  };
}

function makePlacementRow(params: {
  statementKind: StatementConstructionKind;
  sectionId: string;
  rowId: string;
  prompt: string;
  expectedLabel: string;
  accountId: string;
  accountType: PracticeAccount['accountType'];
  amount: number;
  bankStatus: 'included' | 'distractor';
  tolerance: number;
  explanation: string;
  placeholder?: string;
  note?: string;
}): StatementConstructionRow {
  return {
    id: params.rowId,
    kind: 'editable',
    label: params.prompt,
    prompt: params.prompt,
    editableField: 'label',
    placeholder: params.placeholder ?? params.expectedLabel,
    note: params.note,
    targetId: params.expectedLabel,
    expectedAnswerShape: 'string',
    canonicalAnswer: params.expectedLabel,
    explanation: params.explanation,
    misconceptionTags: [`${params.statementKind}-placement-error`, `${params.sectionId}-placement-error`],
    standardCode: `ACC-M7-EC-${params.statementKind.replace(/-/g, '').toUpperCase()}`,
    artifactTarget: params.expectedLabel,
    details: {
      statementKind: params.statementKind,
      sectionId: params.sectionId,
      rowRole: 'account-placement',
      expectedAnswerType: 'label',
      expectedLabel: params.expectedLabel,
      accountId: params.accountId,
      accountType: params.accountType,
      bankStatus: params.bankStatus,
      tolerance: params.tolerance,
      explanation: params.explanation,
    },
    value: params.amount,
  };
}

function makeSubtotalRow(params: {
  statementKind: StatementConstructionKind;
  sectionId: string;
  rowId: string;
  label: string;
  expectedValue: number;
  sumOf: string[];
  tolerance: number;
  explanation: string;
  note?: string;
}): StatementConstructionRow {
  return {
    id: params.rowId,
    kind: 'editable',
    label: params.label,
    prompt: `What is ${params.label.toLowerCase()}?`,
    editableField: 'amount',
    placeholder: '0',
    note: params.note,
    targetId: params.expectedValue,
    expectedAnswerShape: 'number',
    canonicalAnswer: params.expectedValue,
    explanation: params.explanation,
    misconceptionTags: [`${params.statementKind}-subtotal-error`, `${params.sectionId}-subtotal-error`],
    standardCode: `ACC-M7-EC-${params.statementKind.replace(/-/g, '').toUpperCase()}`,
    artifactTarget: String(params.expectedValue),
    sumOf: params.sumOf,
    details: {
      statementKind: params.statementKind,
      sectionId: params.sectionId,
      rowRole: 'subtotal',
      expectedAnswerType: 'number',
      expectedValue: params.expectedValue,
      bankStatus: 'included',
      tolerance: params.tolerance,
      explanation: params.explanation,
    },
  };
}

function chooseAccounts(accounts: MiniLedgerAccount[], count: number, rng: () => number) {
  return shuffle(accounts, rng).slice(0, Math.max(1, Math.min(count, accounts.length)));
}

function buildBank(
  selectedAccounts: MiniLedgerAccount[],
  distractorAccounts: MiniLedgerAccount[],
  rng: () => number,
): StatementConstructionBankItem[] {
  const bankItems = [
    ...selectedAccounts.map((account) => ({
      id: account.id,
      label: account.label,
      accountType: account.accountType,
      statementPlacement: account.statementPlacement,
      amount: 0,
      included: true as const,
    })),
    ...distractorAccounts.map((account) => ({
      id: `${account.id}-distractor`,
      label: account.label,
      accountType: account.accountType,
      statementPlacement: account.statementPlacement,
      amount: 0,
      included: false as const,
    })),
  ];

  return shuffle(bankItems.map((item) => ({ ...item })), rng);
}

function buildBalanceSheetConstruction(ledger: MiniLedger, tolerance: number, rng: () => number) {
  const assetAccounts = ledger.accounts.filter((account) => account.accountType === 'asset');
  const liabilityAccounts = ledger.accounts.filter((account) => account.accountType === 'liability');
  const equityAccounts = ledger.accounts.filter((account) => account.accountType === 'equity');
  const revenueAccounts = ledger.accounts.filter((account) => account.accountType === 'revenue');
  const expenseAccounts = ledger.accounts.filter((account) => account.accountType === 'expense');

  const selectedAssets = chooseAccounts(assetAccounts, 3, rng);
  const selectedLiabilities = chooseAccounts(liabilityAccounts, 2, rng);
  const selectedEquity = chooseAccounts(equityAccounts, 1, rng);
  const distractors = shuffle([...revenueAccounts, ...expenseAccounts].filter((account) => !selectedAssets.concat(selectedLiabilities, selectedEquity).some((entry) => entry.id === account.id)), rng).slice(0, 2);

  const assetRows = selectedAssets.map((account, index) =>
    makePlacementRow({
      statementKind: 'balance-sheet',
      sectionId: 'assets',
      rowId: `asset-${account.id}`,
      prompt: 'Asset account',
      expectedLabel: account.label,
      accountId: account.id,
      accountType: account.accountType,
      amount: account.statementBalance,
      bankStatus: 'included',
      tolerance,
      explanation: `${account.label} belongs in the assets section.`,
      placeholder: account.label,
      note: index === 0 && account.contraOf ? 'Contra assets appear in the asset section with a credit balance.' : 'Choose the correct asset from the bank.',
    }),
  );
  const totalAssets = selectedAssets.reduce((sum, account) => sum + account.statementBalance, 0);
  const totalAssetsRow = makeSubtotalRow({
    statementKind: 'balance-sheet',
    sectionId: 'assets',
    rowId: 'total-assets',
    label: 'Total Assets',
    expectedValue: totalAssets,
    sumOf: assetRows.map((row) => row.id),
    tolerance,
    explanation: 'Add the asset lines to reach total assets.',
    note: 'Use the asset section to complete the subtotal.',
  });

  const liabilityRows = selectedLiabilities.map((account) =>
    makePlacementRow({
      statementKind: 'balance-sheet',
      sectionId: 'claims',
      rowId: `liability-${account.id}`,
      prompt: 'Liability account',
      expectedLabel: account.label,
      accountId: account.id,
      accountType: account.accountType,
      amount: account.statementBalance,
      bankStatus: 'included',
      tolerance,
      explanation: `${account.label} belongs in the claims section.`,
      placeholder: account.label,
      note: 'Choose the correct liability from the bank.',
    }),
  );
  const equityRows = selectedEquity.map((account) =>
    makePlacementRow({
      statementKind: 'balance-sheet',
      sectionId: 'claims',
      rowId: `equity-${account.id}`,
      prompt: 'Equity account',
      expectedLabel: account.label,
      accountId: account.id,
      accountType: account.accountType,
      amount: account.statementBalance,
      bankStatus: 'included',
      tolerance,
      explanation: `${account.label} belongs in equity.`,
      placeholder: account.label,
      note: 'Choose the correct equity account from the bank.',
    }),
  );
  const totalClaims = [...selectedLiabilities, ...selectedEquity].reduce((sum, account) => sum + account.statementBalance, 0);
  const totalClaimsRow = makeSubtotalRow({
    statementKind: 'balance-sheet',
    sectionId: 'claims',
    rowId: 'total-liabilities-equity',
    label: 'Total Liabilities and Equity',
    expectedValue: totalClaims,
    sumOf: [...liabilityRows, ...equityRows].map((row) => row.id),
    tolerance,
    explanation: 'Add liabilities and equity to reach the claims subtotal.',
    note: 'Use the claims section to complete the subtotal.',
  });

  const sections: StatementConstructionSection[] = [
    {
      id: 'assets',
      label: 'Assets',
      description: 'Match the balance sheet accounts first, then complete the total.',
      rows: [...assetRows, totalAssetsRow],
    },
    {
      id: 'claims',
      label: 'Liabilities and Equity',
      description: 'Finish the claims side with the matching account names and total.',
      rows: [...liabilityRows, ...equityRows, totalClaimsRow],
    },
  ];

  const rows = sections.flatMap((section) => section.rows);
  const parts = rows;

  return {
    sections,
    rows,
    parts,
    accountBank: buildBank([...selectedAssets, ...selectedLiabilities, ...selectedEquity], distractors, rng).map((item) => ({
      ...item,
      amount: item.included
        ? [...selectedAssets, ...selectedLiabilities, ...selectedEquity].find((account) => account.id === item.id)?.statementBalance ?? 0
        : distractors.find((account) => account.label === item.label)?.statementBalance ?? 0,
    })),
    scaffolding: {
      statementLabel: 'Balance sheet',
      guidance: 'Type the account names into the blanks, then complete the totals.',
      bankLabel: 'Account bank',
      blanks: parts.length,
    },
  };
}

function buildIncomeStatementConstruction(ledger: MiniLedger, tolerance: number, rng: () => number) {
  const revenueAccounts = ledger.accounts.filter((account) => account.accountType === 'revenue');
  const expenseAccounts = ledger.accounts.filter((account) => account.accountType === 'expense');
  const assetAccounts = ledger.accounts.filter((account) => account.accountType === 'asset');
  const liabilityAccounts = ledger.accounts.filter((account) => account.accountType === 'liability');
  const equityAccounts = ledger.accounts.filter((account) => account.accountType === 'equity');

  const selectedRevenue = chooseAccounts(revenueAccounts, 2, rng);
  const selectedExpenses = chooseAccounts(expenseAccounts, 2, rng);
  const distractors = shuffle([...assetAccounts, ...liabilityAccounts, ...equityAccounts].filter((account) => !selectedRevenue.concat(selectedExpenses).some((entry) => entry.id === account.id)), rng).slice(0, 2);

  const revenueRows = selectedRevenue.map((account) =>
    makePlacementRow({
      statementKind: 'income-statement',
      sectionId: 'revenues',
      rowId: `revenue-${account.id}`,
      prompt: 'Revenue account',
      expectedLabel: account.label,
      accountId: account.id,
      accountType: account.accountType,
      amount: account.statementBalance,
      bankStatus: 'included',
      tolerance,
      explanation: `${account.label} belongs in the revenue section.`,
      placeholder: account.label,
      note: 'Choose the correct revenue account from the bank.',
    }),
  );
  const totalRevenue = selectedRevenue.reduce((sum, account) => sum + account.statementBalance, 0);
  const totalRevenueRow = makeSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'revenues',
    rowId: 'total-revenue',
    label: 'Total Revenues',
    expectedValue: totalRevenue,
    sumOf: revenueRows.map((row) => row.id),
    tolerance,
    explanation: 'Add the revenue rows to finish the section total.',
    note: 'Use the revenue section to complete the subtotal.',
  });

  const expenseRows = selectedExpenses.map((account) =>
    makePlacementRow({
      statementKind: 'income-statement',
      sectionId: 'expenses',
      rowId: `expense-${account.id}`,
      prompt: 'Expense account',
      expectedLabel: account.label,
      accountId: account.id,
      accountType: account.accountType,
      amount: Math.abs(account.statementBalance),
      bankStatus: 'included',
      tolerance,
      explanation: `${account.label} belongs in the expense section.`,
      placeholder: account.label,
      note: 'Choose the correct expense account from the bank.',
    }),
  );
  const totalExpenses = selectedExpenses.reduce((sum, account) => sum + Math.abs(account.statementBalance), 0);
  const totalExpensesRow = makeSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'expenses',
    rowId: 'total-expenses',
    label: 'Total Expenses',
    expectedValue: totalExpenses,
    sumOf: expenseRows.map((row) => row.id),
    tolerance,
    explanation: 'Add the expense rows to finish the section total.',
    note: 'Use the expense section to complete the subtotal.',
  });

  const netIncome = totalRevenue - totalExpenses;
  const netIncomeRow = makeSubtotalRow({
    statementKind: 'income-statement',
    sectionId: 'bottom-line',
    rowId: 'net-income',
    label: 'Net Income',
    expectedValue: netIncome,
    sumOf: [totalRevenueRow.id, totalExpensesRow.id],
    tolerance,
    explanation: 'Subtract total expenses from total revenues.',
    note: 'Use the section totals to finish the statement.',
  });

  const sections: StatementConstructionSection[] = [
    {
      id: 'revenues',
      label: 'Revenues',
      description: 'Choose the revenue accounts first, then compute the total.',
      rows: [...revenueRows, totalRevenueRow],
    },
    {
      id: 'expenses',
      label: 'Expenses',
      description: 'Choose the expense accounts next, then compute the total.',
      rows: [...expenseRows, totalExpensesRow],
    },
    {
      id: 'bottom-line',
      label: 'Bottom Line',
      description: 'Finish with the profit or loss line.',
      rows: [netIncomeRow],
    },
  ];

  const rows = sections.flatMap((section) => section.rows);
  const parts = rows;

  return {
    sections,
    rows,
    parts,
    accountBank: buildBank([...selectedRevenue, ...selectedExpenses], distractors, rng).map((item) => ({
      ...item,
      amount: item.included
        ? [...selectedRevenue, ...selectedExpenses].find((account) => account.id === item.id)?.statementBalance ?? 0
        : distractors.find((account) => account.label === item.label)?.statementBalance ?? 0,
    })),
    scaffolding: {
      statementLabel: 'Income statement',
      guidance: 'Type the account names from the bank, then complete the totals.',
      bankLabel: 'Account bank',
      blanks: parts.length,
    },
  };
}

function buildStatementConstructionBody(kind: StatementConstructionKind, ledger: MiniLedger, tolerance: number, rng: () => number) {
  if (kind === 'income-statement') {
    return buildIncomeStatementConstruction(ledger, tolerance, rng);
  }

  return buildBalanceSheetConstruction(ledger, tolerance, rng);
}

function buildReviewFeedback(
  definition: StatementConstructionDefinition,
  part: StatementConstructionRow,
  studentResponse: StatementConstructionResponse,
  gradeResultPart: GradeResult['parts'][number],
): StatementConstructionReviewFeedback {
  const selectedValue = studentResponse[part.id];
  const totalRevenue = definition.parts.find((entry) => entry.id === 'total-revenue');
  const totalExpenses = definition.parts.find((entry) => entry.id === 'total-expenses');
  const netIncome = definition.parts.find((entry) => entry.id === 'net-income');
  const rowValues = part.sumOf?.map((rowId) => Number(definition.parts.find((entry) => entry.id === rowId)?.targetId ?? 0)) ?? [];
  const subtotalChain =
    part.id === 'net-income' && totalRevenue && totalExpenses && netIncome
      ? `Total Revenues (${Number(totalRevenue.targetId).toLocaleString('en-US')}) - Total Expenses (${Number(totalExpenses.targetId).toLocaleString('en-US')}) = Net Income (${Number(netIncome.targetId).toLocaleString('en-US')})`
      : rowValues.length > 0
        ? `${rowValues.map((value) => value.toLocaleString('en-US')).join(' + ')} = ${Number(part.targetId).toLocaleString('en-US')}`
        : '';
  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    selectedLabel:
      selectedValue === undefined ? 'Not entered' : typeof selectedValue === 'number' ? formatAmount(selectedValue) : String(selectedValue),
    expectedLabel:
      part.details.expectedAnswerType === 'number'
        ? formatAmount(part.targetId as number)
        : String(part.targetId),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `${part.label} is correct.${subtotalChain ? ` ${subtotalChain}.` : ''}`
      : part.details.expectedAnswerType === 'number'
        ? `${part.label} should be ${formatAmount(part.targetId as number)}.${subtotalChain ? ` ${subtotalChain}.` : ''}`
        : `Use ${part.details.expectedLabel} on this line.`,
  };
}

export function buildStatementConstructionReviewFeedback(
  definition: StatementConstructionDefinition,
  studentResponse: StatementConstructionResponse,
  gradeResult: GradeResult,
) : Record<string, StatementConstructionReviewFeedback> {
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

      return [part.id, buildReviewFeedback(definition, part, studentResponse, partResult)] as const;
    }),
  ) as Record<string, StatementConstructionReviewFeedback>;
}

export const statementConstructionFamily: ProblemFamily<
  StatementConstructionDefinition,
  StatementConstructionResponse,
  StatementConstructionConfig
> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x4ad2a7c5);
    const statementKind = config.statementKind ?? pick(['balance-sheet', 'income-statement'] as const, rng);
    const miniLedger = generateMiniLedger(seed, {
      ...config,
      companyType: statementKind === 'income-statement' ? 'service' : 'retail',
      includeContraAccounts: statementKind === 'balance-sheet',
      capitalMode: 'ending',
    });
    const tolerance = config.tolerance ?? 0;
    const body = buildStatementConstructionBody(statementKind, miniLedger, tolerance, rng);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'statement-construction',
      mode: config.mode ?? 'assessment',
      activityId: `statement-construction-${statementKind}-${seed}`,
      prompt: {
        title: `Construct the ${body.scaffolding.statementLabel.toLowerCase()}`,
        stem: body.scaffolding.guidance,
      },
      miniLedger,
      statementKind,
      accountBank: body.accountBank,
      sections: body.sections,
      rows: body.rows,
      parts: body.parts,
      scaffolding: body.scaffolding,
      grading: {
        strategy: 'rubric',
        partialCredit: true,
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
    return Object.fromEntries(
      definition.parts.map((part) => [
        part.id,
        part.details.expectedAnswerType === 'number' ? part.targetId : part.details.expectedLabel ?? part.targetId,
      ]),
    );
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const scoreResult =
        part.details.expectedAnswerType === 'number'
          ? scoreNumericPart(part.targetId as number, studentResponse[part.id], part.details.tolerance)
          : scoreLabelPart(part.details.expectedLabel ?? String(part.targetId), studentResponse[part.id]);

      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: scoreResult.normalizedAnswer,
        isCorrect: scoreResult.isCorrect,
        score: scoreResult.score,
        maxScore: 1,
        misconceptionTags: scoreResult.isCorrect
          ? []
          : part.details.expectedAnswerType === 'number'
            ? ['arithmetic-error', `${part.details.sectionId}-subtotal-error`]
            : ['placement-error', `${part.details.sectionId}-placement-error`],
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'All statement construction entries are correct.'
        : 'Recheck the account placements and section totals.',
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
