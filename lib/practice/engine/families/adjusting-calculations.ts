import {
  buildPracticeSubmissionEnvelopeFromGrade,
  type GradeResult,
  type ProblemDefinition,
  type ProblemFamily,
  type ProblemPartDefinition,
} from '@/lib/practice/engine/types';
import { practiceAccounts, getAccountById } from '@/lib/practice/engine/accounts';
import {
  generateAdjustmentScenario,
  type AdjustmentScenario,
  type AdjustmentScenarioConfig,
  type AdjustmentScenarioKind,
  type AccrualAdjustmentScenario,
  type DeferralAdjustmentScenario,
  type DepreciationAdjustmentScenario,
} from '@/lib/practice/engine/adjustments';

export type AdjustingCalculationsPresentation = 'calculation' | 'journal-entry';

export interface AdjustingCalculationsJournalLine {
  id: string;
  date: string;
  accountId: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface AdjustingCalculationsPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric' | 'journal-entry';
  label: string;
  targetId: number | string;
  details: {
    scenarioKind: AdjustmentScenarioKind;
    presentation: AdjustingCalculationsPresentation;
    rowRole: 'calculation' | 'journal-entry';
    lineIndex?: number;
    accountId?: string;
    accountLabel?: string;
    side?: 'debit' | 'credit';
    tolerance: number;
    explanation: string;
  };
}

export interface AdjustingCalculationsDefinition extends ProblemDefinition {
  scenario: AdjustmentScenario;
  presentation: AdjustingCalculationsPresentation;
  availableAccounts: Array<{ id: string; label: string }>;
  entryLines: AdjustingCalculationsJournalLine[];
  parts: AdjustingCalculationsPart[];
  scaffolding: {
    modeLabel: string;
    guidance: string;
    amountLabel: string;
    bridgeText: string;
  };
  workedExample?: Record<string, unknown>;
}

export type AdjustingCalculationsResponse = Record<string, number | string | AdjustingCalculationsJournalLine | undefined>;

export interface AdjustingCalculationsConfig extends AdjustmentScenarioConfig {
  mode?: ProblemDefinition['mode'];
  presentation?: AdjustingCalculationsPresentation;
  scenarioKind?: AdjustmentScenarioKind;
  tolerance?: number;
}

export interface AdjustingCalculationsReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

const CALCULATION_LABELS = {
  deferral: 'Adjustment amount',
  accrual: 'Accrual amount',
  depreciation: 'Depreciation expense',
} as const;

const CALCULATION_IDS = {
  deferral: 'adjustment-amount',
  accrual: 'accrual-amount',
  depreciation: 'depreciation-expense',
} as const;

const DEFERRAL_LABELS = ['Insurance', 'Rent'] as const;
const ACCRUAL_REVENUE_LABELS = ['Service Revenue', 'Consulting Revenue', 'Interest Revenue'] as const;
const ACCRUAL_EXPENSE_LABELS = ['Insurance Expense', 'Rent Expense', 'Salaries Expense', 'Utilities Expense', 'Depreciation Expense'] as const;
const DEPRECIATION_ASSET_LABELS = ['Equipment', 'Buildings'] as const;

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

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function findAccountIdByLabel(label: string) {
  const target = normalizeLabel(label);
  return practiceAccounts.find((account) => normalizeLabel(account.label) === target)?.id ?? null;
}

function buildScenarioConfig(seed: number, scenarioKind: AdjustmentScenarioKind): AdjustmentScenarioConfig {
  const rng = mulberry32(seed ^ 0x4f6c1b23);

  if (scenarioKind === 'deferral') {
    return {
      scenarioKind,
      deferral: {
        accountLabel: pick(DEFERRAL_LABELS, rng),
        initialRecordingMethod: pick(['asset', 'expense'] as const, rng),
      },
    };
  }

  if (scenarioKind === 'accrual') {
    const accrualKind = seed % 2 === 0 ? 'revenue' : 'expense';
    return {
      scenarioKind,
      accrual: {
        accountLabel:
          accrualKind === 'revenue'
            ? pick(ACCRUAL_REVENUE_LABELS, rng)
            : pick(ACCRUAL_EXPENSE_LABELS, rng),
        accrualKind,
      },
    };
  }

  return {
    scenarioKind,
    depreciation: {
      assetCategory: pick(DEPRECIATION_ASSET_LABELS, rng),
    },
  };
}

function buildCalculationPart(scenario: AdjustmentScenario, tolerance: number): AdjustingCalculationsPart {
  const label = CALCULATION_LABELS[scenario.kind];
  return {
    id: CALCULATION_IDS[scenario.kind],
    kind: 'numeric',
    label,
    prompt: `What is the ${label.toLowerCase()}?`,
    expectedAnswerShape: 'number',
    canonicalAnswer: scenario.amount,
    explanation:
      scenario.kind === 'deferral'
        ? 'Use the elapsed coverage to compute the amount that has expired.'
        : scenario.kind === 'accrual'
          ? 'The accrued amount is the amount to recognize at period end.'
          : 'Use the depreciable base and months used to compute depreciation expense.',
    misconceptionTags: [`adjusting-calculations:${scenario.kind}`, 'calculation-error'],
    standardCode: `ACC-M7-J-${scenario.kind.replace(/-/g, '').toUpperCase()}`,
    artifactTarget: String(scenario.amount),
    targetId: scenario.amount,
    details: {
      scenarioKind: scenario.kind,
      presentation: 'calculation',
      rowRole: 'calculation',
      tolerance,
      explanation:
        scenario.kind === 'deferral'
          ? 'Compute the expired portion of the prepaid amount.'
          : scenario.kind === 'accrual'
            ? 'Enter the amount to accrue at period end.'
            : 'Enter the depreciation expense for the reporting date.',
    },
  };
}

function buildJournalEntryLines(scenario: AdjustmentScenario): AdjustingCalculationsJournalLine[] {
  const reportingDate = scenario.reportingDate;
  const adjustmentAmount = scenario.amount;

  if (scenario.kind === 'deferral') {
    const deferralScenario = scenario as DeferralAdjustmentScenario;
    const debitLabel = deferralScenario.method === 'asset' ? deferralScenario.expenseAccountLabel : deferralScenario.assetAccountLabel;
    const creditLabel = deferralScenario.method === 'asset' ? deferralScenario.assetAccountLabel : deferralScenario.expenseAccountLabel;
    const debitAccountId = findAccountIdByLabel(debitLabel);
    const creditAccountId = findAccountIdByLabel(creditLabel);

    if (!debitAccountId || !creditAccountId) {
      throw new Error(`Unable to resolve deferral accounts for ${deferralScenario.accountLabel}`);
    }

    return [
      {
        id: 'line-1',
        date: reportingDate,
        accountId: debitAccountId,
        debit: adjustmentAmount,
        credit: 0,
        memo: `Record the ${deferralScenario.method === 'asset' ? 'expired expense' : 'correction'} adjustment.`,
      },
      {
        id: 'line-2',
        date: reportingDate,
        accountId: creditAccountId,
        debit: 0,
        credit: adjustmentAmount,
        memo: `Record the ${deferralScenario.method === 'asset' ? 'expired asset' : 'correction'} adjustment.`,
      },
    ];
  }

  if (scenario.kind === 'accrual') {
    const accrualScenario = scenario as AccrualAdjustmentScenario;
    const revenueAccrual = accrualScenario.accrualKind === 'revenue';
    const debitLabel = revenueAccrual ? 'Accounts Receivable' : accrualScenario.accountLabel;
    const creditLabel = revenueAccrual ? accrualScenario.accountLabel : 'Accounts Payable';
    const debitAccountId = findAccountIdByLabel(debitLabel);
    const creditAccountId = findAccountIdByLabel(creditLabel);

    if (!debitAccountId || !creditAccountId) {
      throw new Error(`Unable to resolve accrual accounts for ${accrualScenario.accountLabel}`);
    }

    return [
      {
        id: 'line-1',
        date: reportingDate,
        accountId: debitAccountId,
        debit: adjustmentAmount,
        credit: 0,
        memo: revenueAccrual ? 'Record accrued revenue.' : 'Record accrued expense.',
      },
      {
        id: 'line-2',
        date: reportingDate,
        accountId: creditAccountId,
        debit: 0,
        credit: adjustmentAmount,
        memo: revenueAccrual ? 'Record the receivable.' : 'Record the payable.',
      },
    ];
  }

  const depreciationScenario = scenario as DepreciationAdjustmentScenario;
  const accumulatedDepreciationLabel = `Accumulated Depreciation - ${depreciationScenario.assetCategory}`;
  const accumulatedDepreciationAccountId = findAccountIdByLabel(accumulatedDepreciationLabel);

  if (!accumulatedDepreciationAccountId) {
    throw new Error(`Unable to resolve depreciation account for ${depreciationScenario.assetCategory}`);
  }

  return [
    {
      id: 'line-1',
      date: reportingDate,
      accountId: 'depreciation-expense',
      debit: adjustmentAmount,
      credit: 0,
      memo: `Record depreciation on ${depreciationScenario.assetCategory.toLowerCase()}.`,
    },
    {
      id: 'line-2',
      date: reportingDate,
      accountId: accumulatedDepreciationAccountId,
      debit: 0,
      credit: adjustmentAmount,
      memo: `Record accumulated depreciation for ${depreciationScenario.assetCategory.toLowerCase()}.`,
    },
  ];
}

function shuffleAccounts<T>(items: readonly T[], rng: () => number) {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

function buildAvailableAccounts(seed: number, entryLines: AdjustingCalculationsJournalLine[]) {
  const usedAccountIds = new Set(entryLines.map((line) => line.accountId));
  const usedAccountTypes = new Set(
    entryLines
      .map((line) => getAccountById(line.accountId)?.accountType)
      .filter((accountType): accountType is (typeof practiceAccounts)[number]['accountType'] => Boolean(accountType)),
  );
  const usedNormalBalances = new Set(
    entryLines
      .map((line) => getAccountById(line.accountId)?.normalBalance)
      .filter((normalBalance): normalBalance is (typeof practiceAccounts)[number]['normalBalance'] => Boolean(normalBalance)),
  );

  const primaryPool = practiceAccounts.filter(
    (account) => !usedAccountIds.has(account.id) && usedAccountTypes.has(account.accountType),
  );
  const secondaryPool = practiceAccounts.filter(
    (account) => !usedAccountIds.has(account.id) && usedNormalBalances.has(account.normalBalance),
  );
  const fallbackPool = practiceAccounts.filter((account) => !usedAccountIds.has(account.id));
  const neighborhoodPool = primaryPool.length >= 3 ? primaryPool : secondaryPool.length >= 3 ? secondaryPool : fallbackPool;
  const rng = mulberry32(seed ^ 0x3b9aca6d ^ entryLines.length);
  const distractorCount = Math.min(5, 3 + Math.floor(rng() * 3));
  const distractors = shuffleAccounts(neighborhoodPool, rng).slice(0, distractorCount).map((account) => ({
    id: account.id,
    label: account.label,
  }));

  return Array.from(
    new Map(
      [...entryLines, ...distractors].map((lineOrAccount) => {
        if ('debit' in lineOrAccount) {
          const account = getAccountById(lineOrAccount.accountId);
          return [lineOrAccount.accountId, { id: lineOrAccount.accountId, label: account?.label ?? lineOrAccount.accountId }] as const;
        }

        return [lineOrAccount.id, lineOrAccount] as const;
      }),
    ).values(),
  );
}

function buildEntryPart(line: AdjustingCalculationsJournalLine, lineIndex: number, scenario: AdjustmentScenario, tolerance: number): AdjustingCalculationsPart {
  const account = getAccountById(line.accountId);
  const lineRole = line.debit > 0 ? 'debit' : 'credit';
  return {
    id: line.id,
    kind: 'journal-entry',
    label: `${lineRole === 'debit' ? 'Debit' : 'Credit'} line`,
    prompt: `Enter the ${lineRole} line for the adjustment.`,
    expectedAnswerShape: 'journal-entry-line',
    canonicalAnswer: line,
    explanation: line.memo,
    misconceptionTags: [`adjusting-calculations:${scenario.kind}`, `${line.id}-error`],
    standardCode: `ACC-M7-J-${scenario.kind.replace(/-/g, '').toUpperCase()}`,
    artifactTarget: line.accountId,
    targetId: line.id,
    details: {
      scenarioKind: scenario.kind,
      presentation: 'journal-entry',
      rowRole: 'journal-entry',
      lineIndex,
      accountId: line.accountId,
      accountLabel: account?.label ?? line.accountId,
      side: lineRole,
      tolerance,
      explanation: line.memo,
    },
  };
}

function formatJournalEntryLine(line: AdjustingCalculationsJournalLine) {
  const accountLabel = getAccountById(line.accountId)?.label ?? line.accountId;
  const movement = line.debit > 0 ? `debit $${formatAmount(line.debit)}` : `credit $${formatAmount(line.credit)}`;
  return `${line.date} • ${accountLabel} ${movement}`;
}

function lineSignature(line: AdjustingCalculationsJournalLine) {
  return [
    line.date.trim().toLowerCase(),
    line.accountId.trim().toLowerCase(),
    Number(line.debit ?? 0).toFixed(2),
    Number(line.credit ?? 0).toFixed(2),
    line.memo.trim().toLowerCase(),
  ].join('|');
}

function scoreNumericPart(expected: number, actual: unknown, tolerance: number) {
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) {
    return {
      isCorrect: false,
      score: 0,
      normalizedAnswer: '',
    };
  }

  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    normalizedAnswer: String(parsed),
  };
}

function scoreJournalLine(expected: AdjustingCalculationsJournalLine, actual: unknown, tolerance: number) {
  const line = actual as AdjustingCalculationsJournalLine | undefined;
  if (!line) {
    return {
      isCorrect: false,
      score: 0,
      normalizedAnswer: '',
    };
  }

  const accountMatches = line.accountId === expected.accountId;
  const dateMatches = line.date.trim().toLowerCase() === expected.date.trim().toLowerCase();
  const debitMatches = Math.abs(Number(line.debit ?? 0) - Number(expected.debit ?? 0)) <= tolerance;
  const creditMatches = Math.abs(Number(line.credit ?? 0) - Number(expected.credit ?? 0)) <= tolerance;
  const isCorrect = accountMatches && dateMatches && debitMatches && creditMatches;

  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    normalizedAnswer: lineSignature(line),
  };
}

function buildReviewFeedback(
  part: AdjustingCalculationsPart,
  studentResponse: AdjustingCalculationsResponse,
  gradeResultPart: GradeResult['parts'][number],
): AdjustingCalculationsReviewFeedback {
  const selectedValue = studentResponse[part.id];

  if (part.kind === 'numeric') {
    return {
      status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
      selectedLabel: selectedValue === undefined ? 'Not entered' : formatAmount(Number(selectedValue)),
      expectedLabel: formatAmount(Number(part.targetId)),
      misconceptionTags: gradeResultPart.misconceptionTags,
      message: gradeResultPart.isCorrect ? `${part.label} is correct.` : `${part.label} should be ${formatAmount(Number(part.targetId))}.`,
    };
  }

  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    selectedLabel:
      selectedValue && typeof selectedValue === 'object' && 'accountId' in selectedValue
        ? formatJournalEntryLine(selectedValue as AdjustingCalculationsJournalLine)
        : 'Not entered',
    expectedLabel: formatJournalEntryLine(part.canonicalAnswer as AdjustingCalculationsJournalLine),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `${part.label} is correct.`
      : `${part.label} should be ${formatJournalEntryLine(part.canonicalAnswer as AdjustingCalculationsJournalLine)}.`,
  };
}

export function buildAdjustingCalculationsReviewFeedback(
  definition: AdjustingCalculationsDefinition,
  studentResponse: AdjustingCalculationsResponse,
  gradeResult: GradeResult,
): Record<string, AdjustingCalculationsReviewFeedback> {
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
  );
}

function buildCalculationDefinition(seed: number, config: AdjustingCalculationsConfig, scenario: AdjustmentScenario) {
  const part = buildCalculationPart(scenario, config.tolerance ?? 0);

  return {
    contractVersion: 'practice.v1',
    familyKey: 'adjusting-calculations',
    mode: config.mode ?? 'guided_practice',
    activityId: `adjusting-calculations-${scenario.kind}-calculation-${seed}`,
    prompt: {
      title: `Calculate the ${part.label.toLowerCase()}`,
      stem: `${scenario.stem} First compute the amount to record.`,
    },
    scenario,
    presentation: 'calculation' as const,
    availableAccounts: [],
    entryLines: [],
    parts: [part],
    scaffolding: {
      modeLabel: 'Numeric calculation',
      guidance: scenario.stem,
      amountLabel: part.label,
      bridgeText: `Use ${formatAmount(scenario.amount)} as the amount to record.`,
    },
    grading: {
      strategy: 'numeric',
      partialCredit: false,
    },
    analyticsConfig: {
      generator: 'adjusting-calculations-family',
      seed,
      scenarioKind: scenario.kind,
      presentation: 'calculation',
    },
  } satisfies AdjustingCalculationsDefinition;
}

function buildJournalEntryDefinition(seed: number, config: AdjustingCalculationsConfig, scenario: AdjustmentScenario) {
  const entryLines = buildJournalEntryLines(scenario);
  const parts = entryLines.map((line, index) => buildEntryPart(line, index, scenario, config.tolerance ?? 0));
  const availableAccounts = buildAvailableAccounts(seed, entryLines);

  return {
    contractVersion: 'practice.v1',
    familyKey: 'adjusting-calculations',
    mode: config.mode ?? 'guided_practice',
    activityId: `adjusting-calculations-${scenario.kind}-journal-entry-${seed}`,
    prompt: {
      title: `Record the ${scenario.kind.replace(/-/g, ' ')}`,
      stem: `${scenario.stem} Record the adjustment as a journal entry after you compute the amount.`,
    },
    scenario,
    presentation: 'journal-entry' as const,
    availableAccounts,
    entryLines,
    parts,
    scaffolding: {
      modeLabel: 'Journal entry recording',
      guidance: scenario.stem,
      amountLabel: CALCULATION_LABELS[scenario.kind],
      bridgeText: `Use ${formatAmount(scenario.amount)} as the amount to record in the journal entry.`,
    },
    grading: {
      strategy: 'exact',
      partialCredit: true,
    },
    analyticsConfig: {
      generator: 'adjusting-calculations-family',
      seed,
      scenarioKind: scenario.kind,
      presentation: 'journal-entry',
    },
  } satisfies AdjustingCalculationsDefinition;
}

export const adjustingCalculationsFamily: ProblemFamily<
  AdjustingCalculationsDefinition,
  AdjustingCalculationsResponse,
  AdjustingCalculationsConfig
> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x6c4e1a7d);
    const scenarioKind = config.scenarioKind ?? pick(['deferral', 'accrual', 'depreciation'] as const, rng);
    const presentation = config.presentation ?? 'calculation';
    const scenarioConfig = buildScenarioConfig(seed, scenarioKind);
    const scenario = generateAdjustmentScenario(seed, scenarioConfig);

    return presentation === 'journal-entry'
      ? buildJournalEntryDefinition(seed, config, scenario)
      : buildCalculationDefinition(seed, config, scenario);
  },

  solve(definition) {
    if (definition.presentation === 'journal-entry') {
      return Object.fromEntries(definition.entryLines.map((line) => [line.id, { ...line }]));
    }

    return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId]));
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      if (part.kind === 'numeric') {
        const scoreResult = scoreNumericPart(Number(part.targetId), studentResponse[part.id], part.details.tolerance);
        return {
          partId: part.id,
          rawAnswer: studentResponse[part.id],
          normalizedAnswer: scoreResult.normalizedAnswer,
          isCorrect: scoreResult.isCorrect,
          score: scoreResult.score,
          maxScore: 1,
          misconceptionTags: scoreResult.isCorrect ? [] : ['calculation-error', `${part.details.scenarioKind}-adjustment-error`],
        };
      }

      const expectedLine = part.canonicalAnswer as AdjustingCalculationsJournalLine;
      const scoreResult = scoreJournalLine(expectedLine, studentResponse[part.id], part.details.tolerance);
      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: scoreResult.normalizedAnswer,
        isCorrect: scoreResult.isCorrect,
        score: scoreResult.score,
        maxScore: 1,
        misconceptionTags: scoreResult.isCorrect ? [] : [`adjusting-calculations:${part.details.scenarioKind}:${part.details.side ?? 'line'}`],
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'All adjusting-calculation entries are correct.'
        : 'Recheck the adjustment amount and the journal entry lines.',
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
