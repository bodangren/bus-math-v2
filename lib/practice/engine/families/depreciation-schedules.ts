import { normalizePracticeValue } from '@/lib/practice/contract';
import {
  buildPracticeSubmissionEnvelopeFromGrade,
  type GradeResult,
  type ProblemDefinition,
  type ProblemFamily,
  type ProblemPartDefinition,
} from '@/lib/practice/engine/types';

export type DepreciationMethod = 'straight-line' | 'double-declining' | 'units-of-production';

export interface DepreciationAsset {
  name: string;
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  totalUnits?: number;
  unitsYear1?: number;
}

export interface DepreciationSchedulesPart extends ProblemPartDefinition {
  id: string;
  kind: 'numeric';
  label: string;
  targetValue: number;
  tolerance: number;
  details: {
    method: DepreciationMethod;
    explanation: string;
  };
}

export interface DepreciationSchedulesDefinition extends ProblemDefinition {
  method: DepreciationMethod;
  asset: DepreciationAsset;
  parts: DepreciationSchedulesPart[];
  scaffolding: {
    guidance: string;
    formulaHint: string;
  };
}

export type DepreciationSchedulesResponse = Record<string, number | undefined>;

export interface DepreciationSchedulesConfig {
  mode?: ProblemDefinition['mode'];
  method?: DepreciationMethod;
  tolerance?: number;
}

export interface DepreciationSchedulesReviewFeedback {
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

const ASSET_NAMES = ['delivery truck', 'office equipment', 'manufacturing machine', 'warehouse forklift', 'computer system'] as const;

function buildAsset(seed: number, method: DepreciationMethod): DepreciationAsset {
  const rng = mulberry32(seed ^ 0x4a5b6c7d);
  const cost = pick([10000, 15000, 20000, 25000, 30000, 40000, 50000], rng);
  const salvageRatio = pick([0.05, 0.10, 0.15, 0.20], rng);
  const salvageValue = Math.round(cost * salvageRatio);
  const usefulLifeYears = pick([3, 4, 5, 7, 8, 10], rng);
  const totalUnits = method === 'units-of-production' ? pick([50000, 80000, 100000, 120000, 150000], rng) : undefined;
  const unitsYear1 = totalUnits ? pick([Math.round(totalUnits * 0.15), Math.round(totalUnits * 0.20), Math.round(totalUnits * 0.25)], rng) : undefined;

  return {
    name: pick(ASSET_NAMES, rng),
    cost,
    salvageValue,
    usefulLifeYears,
    totalUnits,
    unitsYear1,
  };
}

function buildStraightLineParts(asset: DepreciationAsset, tolerance: number): DepreciationSchedulesPart[] {
  const depreciableBase = asset.cost - asset.salvageValue;
  const annualDepreciation = Math.round(depreciableBase / (asset.usefulLifeYears || 1));
  const bookValueYear1 = asset.cost - annualDepreciation;

  return [
    {
      id: 'depreciable-base',
      kind: 'numeric',
      label: 'Depreciable Base',
      prompt: 'What is the depreciable base (cost minus salvage)?',
      expectedAnswerShape: 'number',
      canonicalAnswer: depreciableBase,
      explanation: `$${formatAmount(asset.cost)} − $${formatAmount(asset.salvageValue)} = $${formatAmount(depreciableBase)}`,
      artifactTarget: String(depreciableBase),
      targetValue: depreciableBase,
      tolerance,
      details: { method: 'straight-line', explanation: 'Cost minus salvage value.' },
    },
    {
      id: 'year-1-depreciation',
      kind: 'numeric',
      label: 'Year 1 Depreciation',
      prompt: 'What is the annual depreciation expense?',
      expectedAnswerShape: 'number',
      canonicalAnswer: annualDepreciation,
      explanation: `$${formatAmount(depreciableBase)} ÷ ${asset.usefulLifeYears} = $${formatAmount(annualDepreciation)}`,
      misconceptionTags: ['depreciation-schedules:straight-line'],
      artifactTarget: String(annualDepreciation),
      targetValue: annualDepreciation,
      tolerance,
      details: { method: 'straight-line', explanation: 'Depreciable base divided by useful life.' },
    },
    {
      id: 'book-value-year-1',
      kind: 'numeric',
      label: 'Book Value After Year 1',
      prompt: 'What is the book value at the end of year 1?',
      expectedAnswerShape: 'number',
      canonicalAnswer: bookValueYear1,
      explanation: `$${formatAmount(asset.cost)} − $${formatAmount(annualDepreciation)} = $${formatAmount(bookValueYear1)}`,
      artifactTarget: String(bookValueYear1),
      targetValue: bookValueYear1,
      tolerance,
      details: { method: 'straight-line', explanation: 'Cost minus accumulated depreciation.' },
    },
  ];
}

function buildDDBParts(asset: DepreciationAsset, tolerance: number): DepreciationSchedulesPart[] {
  const slRate = 1 / (asset.usefulLifeYears || 1);
  const ddbRate = slRate * 2;
  const year1Dep = Math.round(asset.cost * ddbRate);
  const bookValueYear1 = asset.cost - year1Dep;
  const year2Dep = Math.round(bookValueYear1 * ddbRate);

  return [
    {
      id: 'year-1-depreciation',
      kind: 'numeric',
      label: 'Year 1 Depreciation',
      prompt: 'What is year 1 depreciation using DDB?',
      expectedAnswerShape: 'number',
      canonicalAnswer: year1Dep,
      explanation: `$${formatAmount(asset.cost)} × ${(ddbRate * 100).toFixed(1)}% = $${formatAmount(year1Dep)}`,
      misconceptionTags: ['depreciation-schedules:ddb-year1'],
      artifactTarget: String(year1Dep),
      targetValue: year1Dep,
      tolerance,
      details: { method: 'double-declining', explanation: 'Cost times double the straight-line rate.' },
    },
    {
      id: 'book-value-year-1',
      kind: 'numeric',
      label: 'Book Value After Year 1',
      prompt: 'What is the book value at the end of year 1?',
      expectedAnswerShape: 'number',
      canonicalAnswer: bookValueYear1,
      explanation: `$${formatAmount(asset.cost)} − $${formatAmount(year1Dep)} = $${formatAmount(bookValueYear1)}`,
      artifactTarget: String(bookValueYear1),
      targetValue: bookValueYear1,
      tolerance,
      details: { method: 'double-declining', explanation: 'Beginning book value minus year 1 depreciation.' },
    },
    {
      id: 'year-2-depreciation',
      kind: 'numeric',
      label: 'Year 2 Depreciation',
      prompt: 'What is year 2 depreciation using DDB?',
      expectedAnswerShape: 'number',
      canonicalAnswer: year2Dep,
      explanation: `$${formatAmount(bookValueYear1)} × ${(ddbRate * 100).toFixed(1)}% = $${formatAmount(year2Dep)}`,
      misconceptionTags: ['depreciation-schedules:ddb-year2'],
      artifactTarget: String(year2Dep),
      targetValue: year2Dep,
      tolerance,
      details: { method: 'double-declining', explanation: 'Year 1 ending book value times the DDB rate.' },
    },
  ];
}

function buildUOPParts(asset: DepreciationAsset, tolerance: number): DepreciationSchedulesPart[] {
  const depreciableBase = asset.cost - asset.salvageValue;
  const ratePerUnit = depreciableBase / (asset.totalUnits || 1);
  const ratePerUnitRounded = Math.round(ratePerUnit * 100) / 100;
  const year1Dep = Math.round(ratePerUnitRounded * (asset.unitsYear1 ?? 0));

  return [
    {
      id: 'depreciable-base',
      kind: 'numeric',
      label: 'Depreciable Base',
      prompt: 'What is the depreciable base?',
      expectedAnswerShape: 'number',
      canonicalAnswer: depreciableBase,
      explanation: `$${formatAmount(asset.cost)} − $${formatAmount(asset.salvageValue)} = $${formatAmount(depreciableBase)}`,
      artifactTarget: String(depreciableBase),
      targetValue: depreciableBase,
      tolerance,
      details: { method: 'units-of-production', explanation: 'Cost minus salvage value.' },
    },
    {
      id: 'rate-per-unit',
      kind: 'numeric',
      label: 'Depreciation per Unit',
      prompt: 'What is the depreciation rate per unit?',
      expectedAnswerShape: 'number',
      canonicalAnswer: ratePerUnitRounded,
      explanation: `$${formatAmount(depreciableBase)} ÷ ${formatAmount(asset.totalUnits ?? 0)} = $${ratePerUnitRounded.toFixed(2)}`,
      artifactTarget: String(ratePerUnitRounded),
      targetValue: ratePerUnitRounded,
      tolerance: tolerance || 0.01,
      details: { method: 'units-of-production', explanation: 'Depreciable base divided by total estimated units.' },
    },
    {
      id: 'year-1-depreciation',
      kind: 'numeric',
      label: 'Year 1 Depreciation',
      prompt: `What is year 1 depreciation for ${formatAmount(asset.unitsYear1 ?? 0)} units produced?`,
      expectedAnswerShape: 'number',
      canonicalAnswer: year1Dep,
      explanation: `$${ratePerUnitRounded.toFixed(2)} × ${formatAmount(asset.unitsYear1 ?? 0)} = $${formatAmount(year1Dep)}`,
      misconceptionTags: ['depreciation-schedules:uop-year1'],
      artifactTarget: String(year1Dep),
      targetValue: year1Dep,
      tolerance,
      details: { method: 'units-of-production', explanation: 'Rate per unit times units produced in year 1.' },
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

function buildChainText(definition: DepreciationSchedulesDefinition, part: DepreciationSchedulesPart) {
  const asset = definition.asset;
  const depreciableBase = asset.cost - asset.salvageValue;
  const annualDepreciation = Math.round(depreciableBase / (asset.usefulLifeYears || 1));
  const slRate = 1 / (asset.usefulLifeYears || 1);
  const ddbRate = slRate * 2;
  const year1Ddb = Math.round(asset.cost * ddbRate);
  const bookValueYear1 = asset.cost - year1Ddb;
  const ratePerUnit = depreciableBase / (asset.totalUnits || 1);
  const ratePerUnitRounded = Math.round(ratePerUnit * 100) / 100;
  const year1Units = Math.round(ratePerUnitRounded * (asset.unitsYear1 ?? 0));

  if (part.id === 'depreciable-base') {
    return `$${formatAmount(asset.cost)} − $${formatAmount(asset.salvageValue)} = $${formatAmount(depreciableBase)}`;
  }

  if (part.id === 'year-1-depreciation') {
    if (definition.method === 'straight-line') {
      return `$${formatAmount(depreciableBase)} ÷ ${asset.usefulLifeYears} = $${formatAmount(annualDepreciation)}`;
    }

    if (definition.method === 'double-declining') {
      return `$${formatAmount(asset.cost)} × ${(ddbRate * 100).toFixed(1)}% = $${formatAmount(year1Ddb)}`;
    }

    return `$${ratePerUnitRounded.toFixed(2)} × ${formatAmount(asset.unitsYear1 ?? 0)} = $${formatAmount(year1Units)}`;
  }

  if (part.id === 'book-value-year-1') {
    if (definition.method === 'double-declining') {
      return `$${formatAmount(asset.cost)} − $${formatAmount(year1Ddb)} = $${formatAmount(bookValueYear1)}`;
    }

    return `$${formatAmount(asset.cost)} − $${formatAmount(annualDepreciation)} = $${formatAmount(asset.cost - annualDepreciation)}`;
  }

  if (part.id === 'rate-per-unit') {
    return `$${formatAmount(depreciableBase)} ÷ ${formatAmount(asset.totalUnits ?? 0)} = $${ratePerUnitRounded.toFixed(2)}`;
  }

  return `$${formatAmount(asset.cost)} − $${formatAmount(asset.salvageValue)} ÷ ${asset.usefulLifeYears} = $${formatAmount(part.targetValue)}`;
}

const GUIDANCE: Record<DepreciationMethod, string> = {
  'straight-line': 'Compute the depreciable base, then divide by the useful life.',
  'double-declining': 'Apply double the straight-line rate to the beginning book value each year.',
  'units-of-production': 'Find the rate per unit, then multiply by actual units produced.',
};

const FORMULA_HINTS: Record<DepreciationMethod, string> = {
  'straight-line': 'Annual Dep = (Cost − Salvage) ÷ Life',
  'double-declining': 'DDB = Book Value × (2 ÷ Life)',
  'units-of-production': 'Dep = (Cost − Salvage) ÷ Total Units × Units Produced',
};

export function buildDepreciationSchedulesReviewFeedback(
  definition: DepreciationSchedulesDefinition,
  studentResponse: DepreciationSchedulesResponse,
  gradeResult: GradeResult,
): Record<string, DepreciationSchedulesReviewFeedback> {
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
        message: partResult.isCorrect
          ? `${part.label} is correct. ${buildChainText(definition, part)}.`
          : `${part.label} should be ${formatAmount(part.targetValue)}. ${buildChainText(definition, part)}.`,
      },
    ] as const;
  }),
);
}

export const depreciationSchedulesFamily: ProblemFamily<DepreciationSchedulesDefinition, DepreciationSchedulesResponse, DepreciationSchedulesConfig> = {
  generate(seed, config = {}) {
    const rng = mulberry32(seed ^ 0x2d3e4f50);
    const method = config.method ?? pick(['straight-line', 'double-declining', 'units-of-production'] as const, rng);
    const asset = buildAsset(seed, method);
    const tolerance = config.tolerance ?? 0;

    const parts =
      method === 'straight-line'
        ? buildStraightLineParts(asset, tolerance)
        : method === 'double-declining'
          ? buildDDBParts(asset, tolerance)
          : buildUOPParts(asset, tolerance);

    const uopStem = method === 'units-of-production'
      ? ` It is expected to produce ${formatAmount(asset.totalUnits ?? 0)} units over its life. In year 1, it produced ${formatAmount(asset.unitsYear1 ?? 0)} units.`
      : '';

    return {
      contractVersion: 'practice.v1',
      familyKey: 'depreciation-schedules',
      mode: config.mode ?? 'guided_practice',
      activityId: `depreciation-schedules-${method}-${seed}`,
      prompt: {
        title: method === 'straight-line' ? 'Straight-Line Depreciation' : method === 'double-declining' ? 'Double-Declining Balance' : 'Units-of-Production',
        stem: `A ${asset.name} was purchased for $${formatAmount(asset.cost)} with a salvage value of $${formatAmount(asset.salvageValue)} and a useful life of ${asset.usefulLifeYears} years.${uopStem}`,
      },
      method,
      asset,
      parts,
      scaffolding: {
        guidance: GUIDANCE[method],
        formulaHint: FORMULA_HINTS[method],
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'depreciation-schedules-family',
        seed,
        method,
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
        misconceptionTags: result.isCorrect ? [] : [`depreciation-schedules:${part.id}`],
      };
    });

    return {
      score: parts.reduce((sum, p) => sum + p.score, 0),
      maxScore: parts.length,
      parts,
      feedback: parts.every((p) => p.isCorrect) ? 'All depreciation computations are correct.' : 'Recheck the depreciation calculations.',
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
