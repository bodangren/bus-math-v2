import { buildPracticeSubmissionEnvelope, normalizePracticeValue, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';

export type AdjustmentEffect = 'overstated' | 'understated' | 'no-effect';
export type AdjustmentStatementElement = 'revenue' | 'expense' | 'net-income' | 'assets' | 'liabilities' | 'equity';
export type AdjustmentScenarioKind =
  | 'accrual-revenue'
  | 'accrual-expense'
  | 'deferral-revenue'
  | 'deferral-expense'
  | 'depreciation';

export interface AdjustmentEffectsColumn {
  id: AdjustmentEffect;
  label: string;
  description?: string;
}

export interface AdjustmentEffectsRow {
  id: AdjustmentStatementElement;
  label: string;
  description: string;
}

export interface AdjustmentEffectsPart extends ProblemPartDefinition {
  id: AdjustmentStatementElement;
  kind: 'selection';
  label: string;
  description: string;
  targetId: AdjustmentEffect;
  details: {
    statementElement: AdjustmentStatementElement;
    effect: AdjustmentEffect;
    scenarioKind: AdjustmentScenarioKind;
    scenarioLabel: string;
    missedAdjustment: string;
    periodEndAssumption: string;
    explanation: string;
    commonMisconceptionTags: string[];
  };
}

export interface AdjustmentEffectsScenario {
  kind: AdjustmentScenarioKind;
  label: string;
  scenario: string;
  missedAdjustment: string;
  periodEndAssumption: string;
  amount: number;
}

export interface AdjustmentEffectsDefinition extends ProblemDefinition {
  scenario: AdjustmentEffectsScenario;
  rows: AdjustmentEffectsRow[];
  columns: AdjustmentEffectsColumn[];
  parts: AdjustmentEffectsPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type AdjustmentEffectsResponse = Record<AdjustmentStatementElement, AdjustmentEffect>;

export interface AdjustmentEffectsConfig {
  mode?: ProblemDefinition['mode'];
  scenarioKind?: AdjustmentScenarioKind;
}

export interface AdjustmentEffectsReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

interface ScenarioTemplate {
  kind: AdjustmentScenarioKind;
  label: string;
  scenario: (amount: number) => string;
  missedAdjustment: (amount: number) => string;
  explanations: Record<AdjustmentStatementElement, string>;
  misconceptions: Record<AdjustmentStatementElement, string[]>;
  effects: AdjustmentEffectsResponse;
}

const ROWS: AdjustmentEffectsRow[] = [
  { id: 'revenue', label: 'Revenue', description: 'Earned income for the period' },
  { id: 'expense', label: 'Expense', description: 'Costs recognized this period' },
  { id: 'net-income', label: 'Net income', description: 'Revenue minus expense' },
  { id: 'assets', label: 'Assets', description: 'Resources owned' },
  { id: 'liabilities', label: 'Liabilities', description: 'Amounts owed' },
  { id: 'equity', label: "Owner's equity", description: 'Owner claim after period results' },
];

const COLUMNS: AdjustmentEffectsColumn[] = [
  { id: 'overstated', label: 'Overstated', description: 'Reported too high' },
  { id: 'understated', label: 'Understated', description: 'Reported too low' },
  { id: 'no-effect', label: 'No effect', description: 'No change to the statement element' },
];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    kind: 'accrual-revenue',
    label: 'Accrued revenue not recorded',
    scenario: (amount) => `The business earned $${amount.toLocaleString('en-US')} of service revenue at period end, but the accrued revenue entry was skipped.`,
    missedAdjustment: (amount) => `Record the earned revenue and the related receivable for $${amount.toLocaleString('en-US')}.`,
    effects: {
      revenue: 'understated',
      expense: 'no-effect',
      'net-income': 'understated',
      assets: 'understated',
      liabilities: 'no-effect',
      equity: 'understated',
    },
    explanations: {
      revenue: 'The earned revenue never entered the books, so revenue stays understated.',
      expense: 'No expense adjustment was omitted in this scenario, so expense has no effect.',
      'net-income': 'Net income is understated because the missing revenue never reached the income statement.',
      assets: 'The receivable was never recorded, so assets stay understated.',
      liabilities: 'No liability is created by this scenario, so liabilities have no effect.',
      equity: "Equity is understated because net income flows through to the owner's claim.",
    },
    misconceptions: {
      revenue: ['omitted-accrual-revenue', 'revenue-not-recorded'],
      expense: ['no-adjustment-for-expense'],
      'net-income': ['net-income-follows-revenue'],
      assets: ['receivable-not-recorded'],
      liabilities: ['no-liability-created'],
      equity: ['equity-follows-net-income'],
    },
  },
  {
    kind: 'accrual-expense',
    label: 'Accrued expense not recorded',
    scenario: (amount) => `The business incurred $${amount.toLocaleString('en-US')} of wages expense at period end, but the accrued expense entry was skipped.`,
    missedAdjustment: (amount) => `Record the expense and the related payable for $${amount.toLocaleString('en-US')}.`,
    effects: {
      revenue: 'no-effect',
      expense: 'understated',
      'net-income': 'overstated',
      assets: 'no-effect',
      liabilities: 'understated',
      equity: 'overstated',
    },
    explanations: {
      revenue: 'No revenue was affected, so revenue has no effect.',
      expense: 'The expense never reached the books, so expense is understated.',
      'net-income': 'Net income is overstated because the missing expense was never subtracted.',
      assets: 'This scenario does not change an asset balance, so assets have no effect.',
      liabilities: 'The payable was never recorded, so liabilities are understated.',
      equity: "Equity is overstated because missing expense keeps net income too high.",
    },
    misconceptions: {
      revenue: ['no-revenue-effect'],
      expense: ['omitted-expense-accrual'],
      'net-income': ['net-income-too-high'],
      assets: ['no-asset-effect'],
      liabilities: ['payable-not-recorded'],
      equity: ['equity-follows-net-income'],
    },
  },
  {
    kind: 'deferral-revenue',
    label: 'Deferred revenue not recognized',
    scenario: (amount) => `A customer advance of $${amount.toLocaleString('en-US')} had been earned by period end, but the revenue recognition entry was skipped.`,
    missedAdjustment: (amount) => `Move $${amount.toLocaleString('en-US')} from unearned revenue to earned revenue.`,
    effects: {
      revenue: 'understated',
      expense: 'no-effect',
      'net-income': 'understated',
      assets: 'no-effect',
      liabilities: 'overstated',
      equity: 'understated',
    },
    explanations: {
      revenue: 'The earned revenue was not recognized, so revenue is understated.',
      expense: 'Expenses were not part of this missing adjustment, so expense has no effect.',
      'net-income': 'Net income is understated because earned revenue never reached the income statement.',
      assets: 'The cash was already recorded, so assets have no effect.',
      liabilities: 'Unearned revenue stays too high, so liabilities are overstated.',
      equity: "Equity is understated because the missing revenue never flowed through net income.",
    },
    misconceptions: {
      revenue: ['deferred-revenue-not-recognized'],
      expense: ['no-expense-effect'],
      'net-income': ['net-income-follows-revenue'],
      assets: ['cash-already-recorded'],
      liabilities: ['unearned-revenue-not-cleared'],
      equity: ['equity-follows-net-income'],
    },
  },
  {
    kind: 'deferral-expense',
    label: 'Deferred expense not recognized',
    scenario: (amount) => `A prepaid expense of $${amount.toLocaleString('en-US')} expired during the period, but the expense recognition entry was skipped.`,
    missedAdjustment: (amount) => `Move $${amount.toLocaleString('en-US')} from prepaid expense to expense.`,
    effects: {
      revenue: 'no-effect',
      expense: 'understated',
      'net-income': 'overstated',
      assets: 'overstated',
      liabilities: 'no-effect',
      equity: 'overstated',
    },
    explanations: {
      revenue: 'Revenue is not part of this omitted expense recognition, so it has no effect.',
      expense: 'The expired cost never reached the books, so expense is understated.',
      'net-income': 'Net income is overstated because the missing expense was never subtracted.',
      assets: 'The prepaid asset was not reduced, so assets are overstated.',
      liabilities: 'This scenario does not change a payable, so liabilities have no effect.',
      equity: "Equity is overstated because net income is too high when expense is missing.",
    },
    misconceptions: {
      revenue: ['no-revenue-effect'],
      expense: ['deferred-expense-not-recognized'],
      'net-income': ['net-income-too-high'],
      assets: ['prepaid-asset-not-reduced'],
      liabilities: ['no-liability-effect'],
      equity: ['equity-follows-net-income'],
    },
  },
  {
    kind: 'depreciation',
    label: 'Depreciation not recorded',
    scenario: (amount) => `Depreciation expense of $${amount.toLocaleString('en-US')} on equipment was omitted at period end.`,
    missedAdjustment: (amount) => `Record depreciation expense and accumulated depreciation for $${amount.toLocaleString('en-US')}.`,
    effects: {
      revenue: 'no-effect',
      expense: 'understated',
      'net-income': 'overstated',
      assets: 'overstated',
      liabilities: 'no-effect',
      equity: 'overstated',
    },
    explanations: {
      revenue: 'Depreciation does not affect revenue, so revenue has no effect.',
      expense: 'The depreciation expense was never recorded, so expense is understated.',
      'net-income': 'Net income is overstated because the missing expense never reduced profit.',
      assets: 'The asset carrying value stays too high, so assets are overstated.',
      liabilities: 'No liability changes in this scenario, so liabilities have no effect.',
      equity: "Equity is overstated because omitted depreciation keeps net income too high.",
    },
    misconceptions: {
      revenue: ['no-revenue-effect'],
      expense: ['depreciation-expense-not-recorded'],
      'net-income': ['net-income-too-high'],
      assets: ['accumulated-depreciation-not-recorded'],
      liabilities: ['no-liability-effect'],
      equity: ['equity-follows-net-income'],
    },
  },
];

function getTemplate(kind: AdjustmentScenarioKind) {
  const template = SCENARIO_TEMPLATES.find((entry) => entry.kind === kind);
  if (!template) {
    throw new Error(`Unknown adjustment scenario kind: ${kind}`);
  }

  return template;
}

function pickScenarioKind(seed: number, requestedKind?: AdjustmentScenarioKind) {
  if (requestedKind) {
    return requestedKind;
  }

  const rng = mulberry32(seed);
  return SCENARIO_TEMPLATES[Math.floor(rng() * SCENARIO_TEMPLATES.length)]?.kind ?? SCENARIO_TEMPLATES[0].kind;
}

function buildScenario(seed: number, kind: AdjustmentScenarioKind): AdjustmentEffectsScenario {
  const template = getTemplate(kind);
  const rng = mulberry32(seed ^ 0x5f3759df);
  const amountOptions = [1200, 1800, 2400, 3600, 4800];
  const amount = amountOptions[clamp(Math.floor(rng() * amountOptions.length), 0, amountOptions.length - 1)];

  return {
    kind,
    label: template.label,
    scenario: template.scenario(amount),
    missedAdjustment: template.missedAdjustment(amount),
    periodEndAssumption: 'Assume the books are unadjusted at the reporting date.',
    amount,
  };
}

function buildParts(scenario: AdjustmentEffectsScenario): AdjustmentEffectsPart[] {
  const template = getTemplate(scenario.kind);

  return ROWS.map((row) => ({
    id: row.id,
    kind: 'selection',
    label: row.label,
    description: row.description,
    prompt: `Choose the effect for ${row.label}.`,
    expectedAnswerShape: 'effect-id',
    canonicalAnswer: template.effects[row.id],
    explanation: template.explanations[row.id],
    misconceptionTags: template.misconceptions[row.id],
    standardCode: `ACC-M7-${row.id}`,
    artifactTarget: template.effects[row.id],
    targetId: template.effects[row.id],
    details: {
      statementElement: row.id,
      effect: template.effects[row.id],
      scenarioKind: scenario.kind,
      scenarioLabel: scenario.label,
      missedAdjustment: scenario.missedAdjustment,
      periodEndAssumption: scenario.periodEndAssumption,
      explanation: template.explanations[row.id],
      commonMisconceptionTags: template.misconceptions[row.id],
    },
  }));
}

function buildEffectsResponse(definition: AdjustmentEffectsDefinition): AdjustmentEffectsResponse {
  return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId])) as AdjustmentEffectsResponse;
}

function buildEffectLabel(effect: AdjustmentEffect) {
  return effect === 'no-effect' ? 'No effect' : effect[0].toUpperCase() + effect.slice(1);
}

function buildPartFeedback(
  part: AdjustmentEffectsPart,
  studentResponse: AdjustmentEffectsResponse,
  gradeResultPart: GradeResult['parts'][number],
): AdjustmentEffectsReviewFeedback {
  const selectedEffect = normalizePracticeValue(studentResponse[part.id]) as AdjustmentEffect;
  const selectedLabel = selectedEffect ? buildEffectLabel(selectedEffect) : 'Not selected';
  const expectedLabel = buildEffectLabel(part.targetId);

  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `Correct. ${part.details.explanation}`
      : `${part.label} should be ${expectedLabel.toLowerCase()}. ${part.details.explanation}`,
  };
}

export function buildAdjustmentEffectsReviewFeedback(
  definition: AdjustmentEffectsDefinition,
  studentResponse: AdjustmentEffectsResponse,
  gradeResult: GradeResult,
): Record<string, AdjustmentEffectsReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((gradeResultPart) => {
      const part = definition.parts.find((entry) => entry.id === gradeResultPart.partId);
      if (!part) {
        return [
          gradeResultPart.partId,
          {
            status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
            scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
            selectedLabel: 'Not selected',
            expectedLabel: 'Unknown',
            misconceptionTags: gradeResultPart.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      return [part.id, buildPartFeedback(part, studentResponse, gradeResultPart)] as const;
    }),
  );
}

export const adjustmentEffectsFamily: ProblemFamily<
  AdjustmentEffectsDefinition,
  AdjustmentEffectsResponse,
  AdjustmentEffectsConfig
> = {
  generate(seed, config = {}) {
    const scenarioKind = pickScenarioKind(seed, config.scenarioKind);
    const scenario = buildScenario(seed, scenarioKind);
    const parts = buildParts(scenario);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'adjustment-effects',
      mode: config.mode ?? 'guided_practice',
      activityId: `adjustment-effects-${scenario.kind}-${seed}`,
      prompt: {
        title: 'Effects of Missing Adjustments',
        stem: 'For each statement element, choose whether the missing adjustment leaves it overstated, understated, or with no effect.',
      },
      scenario,
      rows: ROWS,
      columns: COLUMNS,
      parts,
      workedExample: {
        scenarioKind: scenario.kind,
        scenarioLabel: scenario.label,
        exampleRowId: parts[0]?.id,
        exampleEffect: parts[0]?.targetId,
      },
      scaffolding: {
        showScenarioPreamble: true,
        showEffectLegend: true,
        scenarioKind: scenario.kind,
      },
      grading: {
        strategy: 'exact',
        partialCredit: false,
        rubric: {
          scenarioKind: scenario.kind,
        },
      },
      analyticsConfig: {
        generator: 'adjustment-effects-family',
        seed,
        scenarioKind: scenario.kind,
        amount: scenario.amount,
      },
    };
  },

  solve(definition) {
    return buildEffectsResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const rawAnswer = studentResponse[part.id];
      const normalizedAnswer = normalizePracticeValue(rawAnswer) as AdjustmentEffect;
      const isCorrect = normalizedAnswer === part.targetId;

      return {
        partId: part.id,
        rawAnswer,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect
          ? []
          : [
              'missing-adjustment-error',
              `scenario:${definition.scenario.kind}`,
              ...part.details.commonMisconceptionTags,
            ],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} statement effects correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'adjustment-effects-grid',
      family: definition.familyKey,
      scenario: definition.scenario,
      columns: definition.columns,
      rows: definition.rows,
      entries: definition.parts.map((part) => {
        const selectedEffect = normalizePracticeValue(studentResponse[part.id]) as AdjustmentEffect;
        const selectedLabel = selectedEffect ? buildEffectLabel(selectedEffect) : 'Not selected';
        const expectedLabel = buildEffectLabel(part.targetId);
        const partResult = gradeResult.parts.find((entry) => entry.partId === part.id);

        return {
          id: part.id,
          label: part.label,
          description: part.description,
          selectedEffect,
          selectedLabel,
          expectedEffect: part.targetId,
          expectedLabel,
          scenarioKind: definition.scenario.kind,
          scenarioLabel: definition.scenario.label,
          missedAdjustment: definition.scenario.missedAdjustment,
          periodEndAssumption: definition.scenario.periodEndAssumption,
          explanation: part.details.explanation,
          isCorrect: partResult?.isCorrect ?? false,
          misconceptionTags: partResult?.misconceptionTags ?? [],
        };
      }),
    };

    return buildPracticeSubmissionEnvelope({
      activityId: definition.activityId,
      mode: definition.mode,
      status: 'submitted',
      attemptNumber: 1,
      answers: studentResponse,
      parts: gradeResult.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer ?? studentResponse[part.partId as AdjustmentStatementElement],
        normalizedAnswer: part.normalizedAnswer,
        isCorrect: part.isCorrect,
        score: part.score,
        maxScore: part.maxScore,
        misconceptionTags: part.misconceptionTags,
      })),
      artifact,
      analytics: {
        score: gradeResult.score,
        maxScore: gradeResult.maxScore,
        scenarioKind: definition.scenario.kind,
        amount: definition.scenario.amount,
      },
    });
  },
};
