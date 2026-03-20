import {
  buildPracticeSubmissionEnvelopeFromGrade,
  type GradeResult,
  type ProblemDefinition,
  type ProblemFamily,
  type ProblemPartDefinition,
} from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateMerchandisingTimeline, type MerchandisingTimelineDefinition } from '@/lib/practice/engine/merchandising';
import { generateMiniLedger, type MiniLedger } from '@/lib/practice/engine/mini-ledger';

export type MerchandisingComputationPresentation = 'numeric' | 'statement';

export interface MerchandisingComputationQuestionRow {
  id: string;
  label: string;
  note?: string;
  targetId: number;
  value?: number;
  placeholder?: string;
  details: {
    metric: MerchandisingComputationMetric;
    presentation: MerchandisingComputationPresentation;
    explanation: string;
    tolerance: number;
  };
}

export type MerchandisingComputationMetric = 'net-sales' | 'gross-profit' | 'net-income';

export interface MerchandisingComputationSectionRow {
  id: string;
  label: string;
  kind: 'editable' | 'prefilled' | 'subtotal';
  value?: number;
  placeholder?: string;
  note?: string;
  sumOf?: string[];
}

export interface MerchandisingComputationSection {
  id: string;
  label: string;
  description?: string;
  rows: MerchandisingComputationSectionRow[];
}

export interface MerchandisingComputationPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric';
  label: string;
  targetId: number;
  details: {
    metric: MerchandisingComputationMetric;
    presentation: MerchandisingComputationPresentation;
    explanation: string;
    tolerance: number;
  };
}

export interface MerchandisingComputationDefinition extends ProblemDefinition {
  timeline: MerchandisingTimelineDefinition;
  miniLedger: MiniLedger;
  presentation: MerchandisingComputationPresentation;
  questionRows: MerchandisingComputationQuestionRow[];
  sections: MerchandisingComputationSection[];
  rows: MerchandisingComputationSectionRow[];
  parts: MerchandisingComputationPart[];
  scaffolding: {
    factsLabel: string;
    guidance: string;
    statementLabel: string;
    variantLabel: string;
  };
  workedExample?: Record<string, unknown>;
}

export type MerchandisingComputationResponse = Record<string, number | undefined>;

export interface MerchandisingComputationConfig {
  mode?: ProblemDefinition['mode'];
  presentation?: MerchandisingComputationPresentation;
  tolerance?: number;
}

export interface MerchandisingComputationReviewFeedback {
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
    const r = Math.imul(t ^ (t >>> 15), 1 | t);
    const s = r ^ (r + Math.imul(r ^ (r >>> 7), 61 | r));
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
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

function buildTimeline(seed: number) {
  const rng = mulberry32(seed ^ 0x4d5a2311);
  return generateMerchandisingTimeline(seed, {
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
}

function buildMiniLedger(seed: number) {
  return generateMiniLedger(seed, {
    companyType: 'retail',
    includeContraAccounts: true,
    capitalMode: 'ending',
  });
}

function computeStatementValues(timeline: MerchandisingTimelineDefinition, ledger: MiniLedger) {
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

  return {
    salesReturns,
    salesDiscounts,
    netSales,
    costOfGoodsSold,
    grossProfit,
    operatingExpenses,
    netIncome,
  };
}

function createStatementRow(
  id: string,
  label: string,
  kind: MerchandisingComputationSectionRow['kind'],
  value: number | undefined,
  note?: string,
  sumOf?: string[],
): MerchandisingComputationSectionRow {
  return {
    id,
    label,
    kind,
    value,
    placeholder: kind === 'editable' ? '0' : undefined,
    note,
    sumOf,
  };
}

function buildSections(timeline: MerchandisingTimelineDefinition, ledger: MiniLedger, values: ReturnType<typeof computeStatementValues>) {
  const grossSalesRow = createStatementRow('gross-sales', 'Gross Sales', 'prefilled', timeline.saleAmount, 'Use the original selling price.');
  const salesReturnsRow = createStatementRow('sales-returns', 'Sales Returns and Allowances', 'prefilled', values.salesReturns, 'Returns reduce sales revenue.');
  const salesDiscountsRow = createStatementRow('sales-discounts', 'Sales Discounts', 'prefilled', values.salesDiscounts, 'Discounts reduce sales revenue when applicable.');
  const netSalesRow = createStatementRow('net-sales', 'Net Sales', 'editable', undefined, 'Subtract returns and discounts from gross sales.', [
    grossSalesRow.id,
    salesReturnsRow.id,
    salesDiscountsRow.id,
  ]);
  const costOfGoodsSoldRow = createStatementRow('cogs', 'Cost of Goods Sold', 'prefilled', values.costOfGoodsSold, 'Retail cost of the merchandise sold.');
  const grossProfitRow = createStatementRow('gross-profit', 'Gross Profit', 'editable', undefined, 'Subtract cost of goods sold from net sales.', [
    netSalesRow.id,
    costOfGoodsSoldRow.id,
  ]);
  const operatingExpensesRow = createStatementRow('operating-expenses', 'Operating Expenses', 'prefilled', values.operatingExpenses, 'Use the period expense total.');
  const netIncomeRow = createStatementRow('net-income', 'Net Income', 'editable', undefined, 'Subtract operating expenses from gross profit.', [
    grossProfitRow.id,
    operatingExpensesRow.id,
  ]);

  const sections: MerchandisingComputationSection[] = [
    {
      id: 'sales',
      label: 'Sales',
      description: 'Combine gross sales, returns, and discounts to find net sales.',
      rows: [grossSalesRow, salesReturnsRow, salesDiscountsRow, netSalesRow],
    },
    {
      id: 'profit',
      label: 'Merchandise Cost',
      description: 'Use the sales lines and cost of goods sold to find gross profit.',
      rows: [costOfGoodsSoldRow, grossProfitRow],
    },
    {
      id: 'expenses',
      label: 'Operating Expenses',
      description: 'Use the period expense total to complete the statement.',
      rows: [operatingExpensesRow, netIncomeRow],
    },
  ];

  return {
    sections,
    rows: sections.flatMap((section) => section.rows),
    parts: [netSalesRow, grossProfitRow, netIncomeRow],
  };
}

function buildQuestionRows(parts: MerchandisingComputationPart[]): MerchandisingComputationQuestionRow[] {
  return parts.map((part) => ({
    id: part.id,
    label: part.label,
    note:
      part.details.metric === 'net-sales'
        ? 'Use returns and discounts.'
        : part.details.metric === 'gross-profit'
          ? 'Use net sales and cost of goods sold.'
          : 'Use gross profit and operating expenses.',
    targetId: part.targetId,
    details: part.details,
  }));
}

function buildParts(values: ReturnType<typeof computeStatementValues>, presentation: MerchandisingComputationPresentation, tolerance: number): MerchandisingComputationPart[] {
  return [
    {
      id: 'net-sales',
      kind: 'numeric',
      label: 'Net Sales',
      prompt: 'What is net sales?',
      expectedAnswerShape: 'number',
      canonicalAnswer: values.netSales,
      explanation: 'Subtract sales returns and sales discounts from gross sales.',
      misconceptionTags: ['merchandising-computation', 'net-sales-error'],
      standardCode: 'ACC-M7-O-RETAIL',
      artifactTarget: String(values.netSales),
      targetId: values.netSales,
      details: {
        metric: 'net-sales',
        presentation,
        explanation: 'Subtract sales returns and discounts from gross sales.',
        tolerance,
      },
    },
    {
      id: 'gross-profit',
      kind: 'numeric',
      label: 'Gross Profit',
      prompt: 'What is gross profit?',
      expectedAnswerShape: 'number',
      canonicalAnswer: values.grossProfit,
      explanation: 'Subtract cost of goods sold from net sales.',
      misconceptionTags: ['merchandising-computation', 'gross-profit-error'],
      standardCode: 'ACC-M7-O-RETAIL',
      artifactTarget: String(values.grossProfit),
      targetId: values.grossProfit,
      details: {
        metric: 'gross-profit',
        presentation,
        explanation: 'Use net sales and cost of goods sold to find gross profit.',
        tolerance,
      },
    },
    {
      id: 'net-income',
      kind: 'numeric',
      label: 'Net Income',
      prompt: 'What is net income?',
      expectedAnswerShape: 'number',
      canonicalAnswer: values.netIncome,
      explanation: 'Subtract operating expenses from gross profit.',
      misconceptionTags: ['merchandising-computation', 'net-income-error'],
      standardCode: 'ACC-M7-O-RETAIL',
      artifactTarget: String(values.netIncome),
      targetId: values.netIncome,
      details: {
        metric: 'net-income',
        presentation,
        explanation: 'Use gross profit and operating expenses to find net income.',
        tolerance,
      },
    },
  ];
}

function buildReviewFeedback(
  part: MerchandisingComputationPart,
  studentResponse: MerchandisingComputationResponse,
  gradeResultPart: GradeResult['parts'][number],
): MerchandisingComputationReviewFeedback {
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

export function buildMerchandisingComputationReviewFeedback(
  definition: MerchandisingComputationDefinition,
  studentResponse: MerchandisingComputationResponse,
  gradeResult: GradeResult,
): Record<string, MerchandisingComputationReviewFeedback> {
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

function buildStatementDefinition(
  seed: number,
  config: MerchandisingComputationConfig,
  timeline: MerchandisingTimelineDefinition,
  ledger: MiniLedger,
  values: ReturnType<typeof computeStatementValues>,
) {
  const presentation = config.presentation ?? 'numeric';
  const statementBody = buildSections(timeline, ledger, values);
  const parts = buildParts(values, presentation, config.tolerance ?? 0);

  return {
    contractVersion: 'practice.v1',
    familyKey: 'merchandising-computation',
    mode: config.mode ?? 'guided_practice',
    activityId: `merchandising-computation-${presentation}-${seed}`,
    prompt: {
      title:
        presentation === 'numeric'
          ? 'Compute the merchandising amounts'
          : 'Complete the merchandising income statement',
      stem:
        presentation === 'numeric'
          ? 'Use the merchandising facts to compute the key amounts.'
          : 'Use the merchandising facts and statement structure to compute the key totals.',
    },
    timeline,
    miniLedger: ledger,
    presentation,
    questionRows: buildQuestionRows(parts),
    sections: statementBody.sections,
    rows: statementBody.rows,
    parts,
    scaffolding: {
      factsLabel: 'Merchandising facts',
      guidance:
        presentation === 'numeric'
          ? 'Read the merchandising timeline before entering the numeric answers.'
          : 'Read the timeline and then complete the retail income statement.',
      statementLabel: 'Retail income statement',
      variantLabel: presentation,
    },
    grading: {
      strategy: 'numeric',
      partialCredit: false,
    },
    analyticsConfig: {
      generator: 'merchandising-computation-family',
      seed,
      presentation,
    },
  } satisfies MerchandisingComputationDefinition;
}

export const merchandisingComputationFamily: ProblemFamily<
  MerchandisingComputationDefinition,
  MerchandisingComputationResponse,
  MerchandisingComputationConfig
> = {
  generate(seed, config = {}) {
    const timeline = buildTimeline(seed);
    const ledger = buildMiniLedger(seed);
    const values = computeStatementValues(timeline, ledger);
    return buildStatementDefinition(seed, config, timeline, ledger, values);
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
        misconceptionTags: scoreResult.isCorrect ? [] : [`merchandising-computation:${part.details.metric}`],
      };
    });

    return {
      score: parts.reduce((sum, part) => sum + part.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((part) => part.isCorrect)
        ? 'All merchandising amounts are correct.'
        : 'Recheck the sales, profit, and income relationships.',
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
