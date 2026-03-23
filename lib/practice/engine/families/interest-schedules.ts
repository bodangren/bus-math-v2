import { normalizePracticeValue } from '@/lib/practice/contract';
import {
  buildPracticeSubmissionEnvelopeFromGrade,
  type GradeResult,
  type ProblemDefinition,
  type ProblemFamily,
  type ProblemPartDefinition,
} from '@/lib/practice/engine/types';

export type InterestVariant = 'simple-interest' | 'compound-interest' | 'loan-amortization';

export interface InterestScenario {
  principal: number;
  annualRate: number;
  periods: number;
  compoundingPerYear?: number;
  loanPayment?: number;
}

export interface InterestSchedulesPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric';
  label: string;
  targetValue: number;
  tolerance: number;
  details: {
    variant: InterestVariant;
    explanation: string;
    formula: string;
  };
}

export interface InterestSchedulesDefinition extends ProblemDefinition {
  variant: InterestVariant;
  scenario: InterestScenario;
  parts: InterestSchedulesPart[];
  scaffolding: {
    guidance: string;
    formulaHint: string;
  };
}

export type InterestSchedulesResponse = Record<string, number | undefined>;

export interface InterestSchedulesConfig {
  mode?: ProblemDefinition['mode'];
  variant?: InterestVariant;
  tolerance?: number;
}

export interface InterestSchedulesReviewFeedback {
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
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function buildScenario(seed: number, variant: InterestVariant): InterestScenario {
  const rng = mulberry32(seed ^ 0x5e4d3c2b);
  const principal = pick([1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000], rng);
  const annualRate = pick([0.03, 0.04, 0.05, 0.06, 0.08, 0.10], rng);
  const periods = variant === 'loan-amortization' ? pick([3, 4, 5], rng) : pick([2, 3, 4, 5], rng);
  const compoundingPerYear = variant === 'compound-interest' ? pick([1, 2, 4, 12], rng) : 1;

  let loanPayment: number | undefined;
  if (variant === 'loan-amortization') {
    const r = annualRate;
    const n = periods;
    loanPayment = round2((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  return { principal, annualRate, periods, compoundingPerYear, loanPayment };
}

function buildSimpleInterestParts(scenario: InterestScenario, tolerance: number): InterestSchedulesPart[] {
  const interest = round2(scenario.principal * scenario.annualRate * scenario.periods);
  const totalAmount = round2(scenario.principal + interest);

  return [
    {
      id: 'interest',
      kind: 'numeric',
      label: 'Total Interest',
      prompt: 'What is the total simple interest earned?',
      expectedAnswerShape: 'number',
      canonicalAnswer: interest,
      explanation: `$${formatAmount(scenario.principal)} × ${scenario.annualRate} × ${scenario.periods} = $${formatAmount(interest)}`,
      artifactTarget: String(interest),
      targetValue: interest,
      tolerance,
      details: {
        variant: 'simple-interest',
        explanation: 'Principal × Rate × Time.',
        formula: 'I = P × r × t',
      },
    },
    {
      id: 'total-amount',
      kind: 'numeric',
      label: 'Total Amount',
      prompt: 'What is the total amount (principal + interest)?',
      expectedAnswerShape: 'number',
      canonicalAnswer: totalAmount,
      explanation: `$${formatAmount(scenario.principal)} + $${formatAmount(interest)} = $${formatAmount(totalAmount)}`,
      misconceptionTags: ['interest-schedules:simple-total'],
      artifactTarget: String(totalAmount),
      targetValue: totalAmount,
      tolerance,
      details: {
        variant: 'simple-interest',
        explanation: 'Add principal and total interest.',
        formula: 'A = P + I',
      },
    },
  ];
}

function buildCompoundInterestParts(scenario: InterestScenario, tolerance: number): InterestSchedulesPart[] {
  const n = scenario.compoundingPerYear ?? 1;
  const totalPeriods = n * scenario.periods;
  const periodRate = scenario.annualRate / n;
  const totalAmount = round2(scenario.principal * Math.pow(1 + periodRate, totalPeriods));
  const totalInterest = round2(totalAmount - scenario.principal);

  return [
    {
      id: 'total-amount',
      kind: 'numeric',
      label: 'Future Value',
      prompt: 'What is the future value of the investment?',
      expectedAnswerShape: 'number',
      canonicalAnswer: totalAmount,
      explanation: `$${formatAmount(scenario.principal)} × (1 + ${periodRate})^${totalPeriods} = $${formatAmount(totalAmount)}`,
      artifactTarget: String(totalAmount),
      targetValue: totalAmount,
      tolerance,
      details: {
        variant: 'compound-interest',
        explanation: 'Principal times (1 + period rate) raised to the number of compounding periods.',
        formula: 'FV = P × (1 + r/n)^(n×t)',
      },
    },
    {
      id: 'total-interest',
      kind: 'numeric',
      label: 'Total Interest Earned',
      prompt: 'How much interest was earned in total?',
      expectedAnswerShape: 'number',
      canonicalAnswer: totalInterest,
      explanation: `$${formatAmount(totalAmount)} − $${formatAmount(scenario.principal)} = $${formatAmount(totalInterest)}`,
      misconceptionTags: ['interest-schedules:compound-interest'],
      artifactTarget: String(totalInterest),
      targetValue: totalInterest,
      tolerance,
      details: {
        variant: 'compound-interest',
        explanation: 'Future value minus principal.',
        formula: 'Interest = FV − P',
      },
    },
  ];
}

function buildAmortizationParts(scenario: InterestScenario, tolerance: number): InterestSchedulesPart[] {
  const payment = scenario.loanPayment!;
  const firstInterest = round2(scenario.principal * scenario.annualRate);
  const firstPrincipal = round2(payment - firstInterest);
  const totalPayments = round2(payment * scenario.periods);
  const totalInterest = round2(totalPayments - scenario.principal);

  return [
    {
      id: 'annual-payment',
      kind: 'numeric',
      label: 'Annual Payment',
      prompt: 'What is the annual loan payment?',
      expectedAnswerShape: 'number',
      canonicalAnswer: payment,
      explanation: `PMT = $${formatAmount(scenario.principal)} × (${scenario.annualRate} × (1+${scenario.annualRate})^${scenario.periods}) / ((1+${scenario.annualRate})^${scenario.periods} − 1) = $${formatAmount(payment)}`,
      artifactTarget: String(payment),
      targetValue: payment,
      tolerance,
      details: {
        variant: 'loan-amortization',
        explanation: 'Use the annuity payment formula.',
        formula: 'PMT = P × r(1+r)^n / ((1+r)^n − 1)',
      },
    },
    {
      id: 'first-year-interest',
      kind: 'numeric',
      label: 'Year 1 Interest',
      prompt: 'How much interest is paid in the first year?',
      expectedAnswerShape: 'number',
      canonicalAnswer: firstInterest,
      explanation: `$${formatAmount(scenario.principal)} × ${scenario.annualRate} = $${formatAmount(firstInterest)}`,
      artifactTarget: String(firstInterest),
      targetValue: firstInterest,
      tolerance,
      details: {
        variant: 'loan-amortization',
        explanation: 'Beginning balance times the annual rate.',
        formula: 'Interest = Balance × r',
      },
    },
    {
      id: 'first-year-principal',
      kind: 'numeric',
      label: 'Year 1 Principal',
      prompt: 'How much principal is repaid in the first year?',
      expectedAnswerShape: 'number',
      canonicalAnswer: firstPrincipal,
      explanation: `$${formatAmount(payment)} − $${formatAmount(firstInterest)} = $${formatAmount(firstPrincipal)}`,
      misconceptionTags: ['interest-schedules:amortization-principal'],
      artifactTarget: String(firstPrincipal),
      targetValue: firstPrincipal,
      tolerance,
      details: {
        variant: 'loan-amortization',
        explanation: 'Payment minus the interest portion.',
        formula: 'Principal = PMT − Interest',
      },
    },
    {
      id: 'total-interest',
      kind: 'numeric',
      label: 'Total Interest Paid',
      prompt: 'What is the total interest paid over the life of the loan?',
      expectedAnswerShape: 'number',
      canonicalAnswer: totalInterest,
      explanation: `$${formatAmount(totalPayments)} − $${formatAmount(scenario.principal)} = $${formatAmount(totalInterest)}`,
      misconceptionTags: ['interest-schedules:total-interest'],
      artifactTarget: String(totalInterest),
      targetValue: totalInterest,
      tolerance,
      details: {
        variant: 'loan-amortization',
        explanation: 'Total payments minus original principal.',
        formula: 'Total Interest = (PMT × n) − P',
      },
    },
  ];
}

function scoreNumericPart(expected: number, actual: unknown, tolerance: number) {
  const parsed = Number(actual);
  if (!Number.isFinite(parsed)) {
    return { isCorrect: false, score: 0, normalizedAnswer: normalizePracticeValue(actual) };
  }
  const isCorrect = Math.abs(parsed - expected) <= tolerance;
  return { isCorrect, score: isCorrect ? 1 : 0, normalizedAnswer: normalizePracticeValue(parsed) };
}

const GUIDANCE: Record<InterestVariant, string> = {
  'simple-interest': 'Apply the simple interest formula: I = P × r × t.',
  'compound-interest': 'Apply the compound interest formula: FV = P × (1 + r/n)^(n×t).',
  'loan-amortization': 'Start with the annuity payment formula, then build the amortization schedule.',
};

const FORMULA_HINTS: Record<InterestVariant, string> = {
  'simple-interest': 'I = P × r × t; A = P + I',
  'compound-interest': 'FV = P × (1 + r/n)^(n×t)',
  'loan-amortization': 'PMT = P × r(1+r)^n / ((1+r)^n − 1)',
};

export function buildInterestSchedulesReviewFeedback(
  definition: InterestSchedulesDefinition,
  studentResponse: InterestSchedulesResponse,
  gradeResult: GradeResult,
): Record<string, InterestSchedulesReviewFeedback> {
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

export const interestSchedulesFamily: ProblemFamily<InterestSchedulesDefinition, InterestSchedulesResponse, InterestSchedulesConfig> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x8f9e7d6c);
    const variant = config.variant ?? pick(['simple-interest', 'compound-interest', 'loan-amortization'] as const, rng);
    const scenario = buildScenario(seed, variant);
    const tolerance = config.tolerance ?? 0;

    const parts =
      variant === 'simple-interest'
        ? buildSimpleInterestParts(scenario, tolerance)
        : variant === 'compound-interest'
          ? buildCompoundInterestParts(scenario, tolerance)
          : buildAmortizationParts(scenario, tolerance);

    const compoundingLabel = variant === 'compound-interest' && scenario.compoundingPerYear !== 1
      ? ` Interest compounds ${scenario.compoundingPerYear === 12 ? 'monthly' : scenario.compoundingPerYear === 4 ? 'quarterly' : scenario.compoundingPerYear === 2 ? 'semi-annually' : 'annually'}.`
      : '';

    return {
      contractVersion: 'practice.v1',
      familyKey: 'interest-schedules',
      mode: config.mode ?? 'guided_practice',
      activityId: `interest-schedules-${variant}-${seed}`,
      prompt: {
        title: variant === 'simple-interest' ? 'Simple Interest' : variant === 'compound-interest' ? 'Compound Interest' : 'Loan Amortization',
        stem: `A ${variant === 'loan-amortization' ? 'loan' : 'note'} of $${formatAmount(scenario.principal)} has an annual interest rate of ${(scenario.annualRate * 100).toFixed(0)}% for ${scenario.periods} years.${compoundingLabel}`,
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
        generator: 'interest-schedules-family',
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
        misconceptionTags: result.isCorrect ? [] : [`interest-schedules:${part.id}`],
      };
    });

    return {
      score: parts.reduce((sum, p) => sum + p.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((p) => p.isCorrect) ? 'All interest computations are correct.' : 'Recheck the interest calculations.',
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
