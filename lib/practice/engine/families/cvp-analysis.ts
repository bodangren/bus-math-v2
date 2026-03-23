import { normalizePracticeValue } from '@/lib/practice/contract';
import {
  buildPracticeSubmissionEnvelopeFromGrade,
  type GradeResult,
  type ProblemDefinition,
  type ProblemFamily,
  type ProblemPartDefinition,
} from '@/lib/practice/engine/types';

export type CvpVariant = 'break-even-units' | 'break-even-dollars' | 'contribution-margin-ratio' | 'target-profit-units';

export interface CvpScenario {
  companyName: string;
  productName: string;
  sellingPricePerUnit: number;
  variableCostPerUnit: number;
  fixedCosts: number;
  targetProfit?: number;
}

export interface CvpAnalysisPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric';
  label: string;
  targetValue: number;
  tolerance: number;
  details: {
    variant: CvpVariant;
    explanation: string;
    formula: string;
  };
}

export interface CvpAnalysisDefinition extends ProblemDefinition {
  variant: CvpVariant;
  scenario: CvpScenario;
  parts: CvpAnalysisPart[];
  scaffolding: {
    guidance: string;
    formulaHint: string;
  };
}

export type CvpAnalysisResponse = Record<string, number | undefined>;

export interface CvpAnalysisConfig {
  mode?: ProblemDefinition['mode'];
  variant?: CvpVariant;
  tolerance?: number;
}

export interface CvpAnalysisReviewFeedback {
  status: 'correct' | 'incorrect';
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

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

const COMPANY_NAMES = ['Riverside Crafts', 'Summit Products', 'Lakewood Manufacturing', 'Prairie Goods', 'Valley Enterprises'] as const;
const PRODUCT_NAMES = ['widgets', 'units', 'assemblies', 'kits', 'packages'] as const;

function buildScenario(seed: number): CvpScenario {
  const rng = mulberry32(seed ^ 0x7a3b1c2d);
  const sellingPrice = pick([20, 25, 30, 40, 50, 60, 75, 100], rng);
  const vcRatio = pick([0.4, 0.45, 0.5, 0.55, 0.6, 0.65], rng);
  const variableCost = Math.round(sellingPrice * vcRatio);
  const fixedCosts = pick([5000, 8000, 10000, 12000, 15000, 18000, 20000, 24000], rng);
  const targetProfit = pick([2000, 3000, 5000, 6000, 8000, 10000], rng);

  return {
    companyName: pick(COMPANY_NAMES, rng),
    productName: pick(PRODUCT_NAMES, rng),
    sellingPricePerUnit: sellingPrice,
    variableCostPerUnit: variableCost,
    fixedCosts,
    targetProfit,
  };
}

function computeValues(scenario: CvpScenario) {
  const contributionMarginPerUnit = scenario.sellingPricePerUnit - scenario.variableCostPerUnit;
  const contributionMarginRatio = contributionMarginPerUnit / scenario.sellingPricePerUnit;
  const breakEvenUnits = Math.ceil(scenario.fixedCosts / contributionMarginPerUnit);
  const breakEvenDollars = Math.ceil(scenario.fixedCosts / contributionMarginRatio);
  const targetProfitUnits = scenario.targetProfit
    ? Math.ceil((scenario.fixedCosts + scenario.targetProfit) / contributionMarginPerUnit)
    : 0;

  return {
    contributionMarginPerUnit,
    contributionMarginRatio: Math.round(contributionMarginRatio * 10000) / 10000,
    breakEvenUnits,
    breakEvenDollars,
    targetProfitUnits,
  };
}

function buildParts(variant: CvpVariant, scenario: CvpScenario, values: ReturnType<typeof computeValues>, tolerance: number): CvpAnalysisPart[] {
  const base = {
    kind: 'numeric' as const,
    expectedAnswerShape: 'number',
    standardCode: `ACC-M8-R-CVP`,
  };

  switch (variant) {
    case 'break-even-units':
      return [
        {
          ...base,
          id: 'contribution-margin',
          label: 'Contribution Margin per Unit',
          prompt: 'What is the contribution margin per unit?',
          canonicalAnswer: values.contributionMarginPerUnit,
          explanation: `$${formatAmount(scenario.sellingPricePerUnit)} − $${formatAmount(scenario.variableCostPerUnit)} = $${formatAmount(values.contributionMarginPerUnit)}`,
          artifactTarget: String(values.contributionMarginPerUnit),
          targetValue: values.contributionMarginPerUnit,
          tolerance,
          details: {
            variant,
            explanation: 'Selling price minus variable cost per unit.',
            formula: 'SP − VC',
          },
        },
        {
          ...base,
          id: 'break-even-units',
          label: 'Break-Even Point (units)',
          prompt: 'How many units must be sold to break even?',
          canonicalAnswer: values.breakEvenUnits,
          explanation: `$${formatAmount(scenario.fixedCosts)} ÷ $${formatAmount(values.contributionMarginPerUnit)} = ${formatAmount(values.breakEvenUnits)} units`,
          misconceptionTags: ['cvp-analysis:break-even-units'],
          artifactTarget: String(values.breakEvenUnits),
          targetValue: values.breakEvenUnits,
          tolerance,
          details: {
            variant,
            explanation: 'Fixed costs divided by contribution margin per unit.',
            formula: 'FC ÷ CM per unit',
          },
        },
      ];

    case 'break-even-dollars':
      return [
        {
          ...base,
          id: 'cm-ratio',
          label: 'Contribution Margin Ratio',
          prompt: 'What is the contribution margin ratio (as a decimal)?',
          canonicalAnswer: values.contributionMarginRatio,
          explanation: `$${formatAmount(values.contributionMarginPerUnit)} ÷ $${formatAmount(scenario.sellingPricePerUnit)} = ${values.contributionMarginRatio}`,
          artifactTarget: String(values.contributionMarginRatio),
          targetValue: values.contributionMarginRatio,
          tolerance: tolerance || 0.01,
          details: {
            variant,
            explanation: 'Contribution margin per unit divided by selling price.',
            formula: 'CM ÷ SP',
          },
        },
        {
          ...base,
          id: 'break-even-dollars',
          label: 'Break-Even Point (dollars)',
          prompt: 'What is the break-even point in sales dollars?',
          canonicalAnswer: values.breakEvenDollars,
          explanation: `$${formatAmount(scenario.fixedCosts)} ÷ ${values.contributionMarginRatio} = $${formatAmount(values.breakEvenDollars)}`,
          misconceptionTags: ['cvp-analysis:break-even-dollars'],
          artifactTarget: String(values.breakEvenDollars),
          targetValue: values.breakEvenDollars,
          tolerance,
          details: {
            variant,
            explanation: 'Fixed costs divided by contribution margin ratio.',
            formula: 'FC ÷ CM ratio',
          },
        },
      ];

    case 'contribution-margin-ratio':
      return [
        {
          ...base,
          id: 'contribution-margin',
          label: 'Contribution Margin per Unit',
          prompt: 'What is the contribution margin per unit?',
          canonicalAnswer: values.contributionMarginPerUnit,
          explanation: `$${formatAmount(scenario.sellingPricePerUnit)} − $${formatAmount(scenario.variableCostPerUnit)} = $${formatAmount(values.contributionMarginPerUnit)}`,
          artifactTarget: String(values.contributionMarginPerUnit),
          targetValue: values.contributionMarginPerUnit,
          tolerance,
          details: {
            variant,
            explanation: 'Selling price minus variable cost per unit.',
            formula: 'SP − VC',
          },
        },
        {
          ...base,
          id: 'cm-ratio',
          label: 'Contribution Margin Ratio',
          prompt: 'What is the contribution margin ratio (as a decimal)?',
          canonicalAnswer: values.contributionMarginRatio,
          explanation: `$${formatAmount(values.contributionMarginPerUnit)} ÷ $${formatAmount(scenario.sellingPricePerUnit)} = ${values.contributionMarginRatio}`,
          misconceptionTags: ['cvp-analysis:cm-ratio'],
          artifactTarget: String(values.contributionMarginRatio),
          targetValue: values.contributionMarginRatio,
          tolerance: tolerance || 0.01,
          details: {
            variant,
            explanation: 'Contribution margin per unit divided by selling price.',
            formula: 'CM ÷ SP',
          },
        },
      ];

    case 'target-profit-units':
      return [
        {
          ...base,
          id: 'contribution-margin',
          label: 'Contribution Margin per Unit',
          prompt: 'What is the contribution margin per unit?',
          canonicalAnswer: values.contributionMarginPerUnit,
          explanation: `$${formatAmount(scenario.sellingPricePerUnit)} − $${formatAmount(scenario.variableCostPerUnit)} = $${formatAmount(values.contributionMarginPerUnit)}`,
          artifactTarget: String(values.contributionMarginPerUnit),
          targetValue: values.contributionMarginPerUnit,
          tolerance,
          details: {
            variant,
            explanation: 'Selling price minus variable cost per unit.',
            formula: 'SP − VC',
          },
        },
        {
          ...base,
          id: 'target-profit-units',
          label: 'Units for Target Profit',
          prompt: `How many units must be sold to earn a target profit of $${formatAmount(scenario.targetProfit ?? 0)}?`,
          canonicalAnswer: values.targetProfitUnits,
          explanation: `($${formatAmount(scenario.fixedCosts)} + $${formatAmount(scenario.targetProfit ?? 0)}) ÷ $${formatAmount(values.contributionMarginPerUnit)} = ${formatAmount(values.targetProfitUnits)} units`,
          misconceptionTags: ['cvp-analysis:target-profit'],
          artifactTarget: String(values.targetProfitUnits),
          targetValue: values.targetProfitUnits,
          tolerance,
          details: {
            variant,
            explanation: 'Fixed costs plus target profit, divided by contribution margin per unit.',
            formula: '(FC + TP) ÷ CM per unit',
          },
        },
      ];
  }
}

const VARIANT_LABELS: Record<CvpVariant, string> = {
  'break-even-units': 'Break-even in units',
  'break-even-dollars': 'Break-even in dollars',
  'contribution-margin-ratio': 'Contribution margin ratio',
  'target-profit-units': 'Target profit in units',
};

const GUIDANCE: Record<CvpVariant, string> = {
  'break-even-units': 'First find the contribution margin per unit, then divide fixed costs by it.',
  'break-even-dollars': 'Find the contribution margin ratio, then divide fixed costs by it.',
  'contribution-margin-ratio': 'Compute the contribution margin per unit, then express it as a ratio of the selling price.',
  'target-profit-units': 'Add the target profit to fixed costs, then divide by the contribution margin per unit.',
};

const FORMULA_HINTS: Record<CvpVariant, string> = {
  'break-even-units': 'BEP (units) = Fixed Costs ÷ CM per unit',
  'break-even-dollars': 'BEP ($) = Fixed Costs ÷ CM ratio',
  'contribution-margin-ratio': 'CM ratio = CM per unit ÷ Selling Price',
  'target-profit-units': 'Target units = (FC + Target Profit) ÷ CM per unit',
};

function scoreNumericPart(expected: number, actual: unknown, tolerance: number) {
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) {
    return { isCorrect: false, score: 0, normalizedAnswer: normalizePracticeValue(actual) };
  }
  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return { isCorrect, score: isCorrect ? 1 : 0, normalizedAnswer: normalizePracticeValue(parsed) };
}

export function buildCvpAnalysisReviewFeedback(
  definition: CvpAnalysisDefinition,
  studentResponse: CvpAnalysisResponse,
  gradeResult: GradeResult,
): Record<string, CvpAnalysisReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((partResult) => {
      const part = definition.parts.find((p) => p.id === partResult.partId);
      if (!part) {
        return [partResult.partId, { status: 'incorrect' as const, message: 'Review data unavailable.' }] as const;
      }
      return [
        part.id,
        {
          status: partResult.isCorrect ? ('correct' as const) : ('incorrect' as const),
          selectedLabel: studentResponse[part.id] === undefined ? 'Not entered' : formatAmount(Number(studentResponse[part.id])),
          expectedLabel: formatAmount(part.targetValue),
          misconceptionTags: partResult.misconceptionTags,
          message: partResult.isCorrect ? `${part.label} is correct.` : `${part.label} should be ${formatAmount(part.targetValue)}. ${part.details.explanation}`,
        },
      ] as const;
    }),
  );
}

export const cvpAnalysisFamily: ProblemFamily<CvpAnalysisDefinition, CvpAnalysisResponse, CvpAnalysisConfig> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x1a2b3c4d);
    const variant = config.variant ?? pick(['break-even-units', 'break-even-dollars', 'contribution-margin-ratio', 'target-profit-units'] as const, rng);
    const scenario = buildScenario(seed);
    const values = computeValues(scenario);
    const tolerance = config.tolerance ?? 0;
    const parts = buildParts(variant, scenario, values, tolerance);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'cvp-analysis',
      mode: config.mode ?? 'guided_practice',
      activityId: `cvp-analysis-${variant}-${seed}`,
      prompt: {
        title: `CVP Analysis: ${VARIANT_LABELS[variant]}`,
        stem: `${scenario.companyName} sells ${scenario.productName} at $${formatAmount(scenario.sellingPricePerUnit)} per unit. Variable costs are $${formatAmount(scenario.variableCostPerUnit)} per unit. Fixed costs total $${formatAmount(scenario.fixedCosts)}.${variant === 'target-profit-units' ? ` The company wants to earn a target profit of $${formatAmount(scenario.targetProfit ?? 0)}.` : ''}`,
      },
      variant,
      scenario,
      parts,
      scaffolding: {
        guidance: GUIDANCE[variant],
        formulaHint: FORMULA_HINTS[variant],
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'cvp-analysis-family',
        seed,
        variant,
      },
    };
  },

  solve(definition) {
    return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetValue]));
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const result = scoreNumericPart(part.targetValue, studentResponse[part.id], part.tolerance);
      return {
        partId: part.id,
        rawAnswer: studentResponse[part.id],
        normalizedAnswer: result.normalizedAnswer,
        isCorrect: result.isCorrect,
        score: result.score,
        maxScore: 1,
        misconceptionTags: result.isCorrect ? [] : [`cvp-analysis:${part.id}`],
      };
    });

    return {
      score: parts.reduce((sum, p) => sum + p.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((p) => p.isCorrect) ? 'All CVP computations are correct.' : 'Recheck the cost-volume-profit relationships.',
    };
  },

  toEnvelope(definition, studentResponse, gradeResult) {
    return buildPracticeSubmissionEnvelopeFromGrade(
      { activityId: definition.activityId, mode: definition.mode },
      studentResponse,
      gradeResult,
    );
  },
};
