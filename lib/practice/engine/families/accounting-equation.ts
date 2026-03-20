import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily, type ProblemPartDefinition } from '@/lib/practice/engine/types';
import { normalizePracticeValue } from '@/lib/practice/contract';
import { generateMiniLedger, type MiniLedger, type MiniLedgerCompanyType, type MiniLedgerConfig } from '@/lib/practice/engine/mini-ledger';

export type AccountingEquationTermId = 'assets' | 'liabilities' | 'equity';

export interface AccountingEquationFact {
  id: AccountingEquationTermId;
  label: string;
  value: number;
}

export interface AccountingEquationTerm {
  id: AccountingEquationTermId;
  label: string;
  value: number;
  hidden: boolean;
  editable: boolean;
}

export interface AccountingEquationPart extends ProblemPartDefinition {
  id: AccountingEquationTermId;
  kind: 'numeric';
  label: string;
  description: string;
  targetId: number;
  details: {
    termId: AccountingEquationTermId;
    companyType: MiniLedgerCompanyType;
    visibleFacts: AccountingEquationFact[];
    formula: string;
    tolerance: number;
    explanation: string;
  };
}

export interface AccountingEquationDefinition extends ProblemDefinition {
  miniLedger: MiniLedger;
  equation: {
    assets: number;
    liabilities: number;
    equity: number;
    hiddenTermId: AccountingEquationTermId;
  };
  facts: AccountingEquationFact[];
  terms: Record<AccountingEquationTermId, AccountingEquationTerm>;
  parts: AccountingEquationPart[];
  scaffolding: {
    formula: string;
    hiddenTermId: AccountingEquationTermId;
    helperText: string;
  };
  workedExample?: Record<string, unknown>;
}

export type AccountingEquationResponse = Partial<Record<AccountingEquationTermId, number>>;

export interface AccountingEquationConfig extends MiniLedgerConfig {
  mode?: ProblemDefinition['mode'];
  hiddenTermId?: AccountingEquationTermId;
  tolerance?: number;
}

export interface AccountingEquationReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

const ACCOUNTING_EQUATION_TERMS: Array<{ id: AccountingEquationTermId; label: string }> = [
  { id: 'assets', label: 'Assets' },
  { id: 'liabilities', label: 'Liabilities' },
  { id: 'equity', label: "Owner's Equity" },
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

function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function buildEquationValues(miniLedger: MiniLedger) {
  return {
    assets: miniLedger.totals.netAssets,
    liabilities: miniLedger.totals.liabilities,
    equity: miniLedger.totals.endingCapital,
  };
}

function buildHiddenTerm(seed: number, requested?: AccountingEquationTermId) {
  if (requested) {
    return requested;
  }

  const rng = mulberry32(seed ^ 0x2d4f1a2b);
  return pick(
    ACCOUNTING_EQUATION_TERMS.map((entry) => entry.id),
    rng,
  );
}

function buildVisibleFacts(hiddenTermId: AccountingEquationTermId, values: Record<AccountingEquationTermId, number>) {
  return ACCOUNTING_EQUATION_TERMS.filter((term) => term.id !== hiddenTermId).map((term) => ({
    id: term.id,
    label: term.label,
    value: values[term.id],
  }));
}

function buildParts(
  hiddenTermId: AccountingEquationTermId,
  values: Record<AccountingEquationTermId, number>,
  companyType: MiniLedgerCompanyType,
  tolerance: number,
): AccountingEquationPart[] {
  const visibleFacts = buildVisibleFacts(hiddenTermId, values);
  const partLabel = ACCOUNTING_EQUATION_TERMS.find((term) => term.id === hiddenTermId)?.label ?? hiddenTermId;

  return [
    {
      id: hiddenTermId,
      kind: 'numeric',
      label: partLabel,
      description: `Complete the accounting equation for ${partLabel.toLowerCase()}.`,
      prompt: `What is ${partLabel.toLowerCase()}?`,
      expectedAnswerShape: 'number',
      canonicalAnswer: values[hiddenTermId],
      explanation:
        hiddenTermId === 'assets'
          ? 'Assets equal liabilities plus equity.'
          : hiddenTermId === 'liabilities'
            ? 'Liabilities equal assets minus equity.'
            : "Equity is the residual claim after liabilities are deducted from assets.",
      misconceptionTags: ['equation-imbalance', `${hiddenTermId}-mismatch`],
      standardCode: 'ACC-M7-B-ECON',
      artifactTarget: String(values[hiddenTermId]),
      targetId: values[hiddenTermId],
      details: {
        termId: hiddenTermId,
        companyType,
        visibleFacts,
        formula: "Assets = Liabilities + Owner's Equity",
        tolerance,
        explanation:
          hiddenTermId === 'assets'
            ? 'Use liabilities and equity to find total assets.'
            : hiddenTermId === 'liabilities'
              ? 'Use assets and equity to isolate liabilities.'
              : 'Use assets and liabilities to isolate owner equity.',
      },
    },
  ];
}

function buildResponse(definition: AccountingEquationDefinition): AccountingEquationResponse {
  return {
    assets: definition.equation.assets,
    liabilities: definition.equation.liabilities,
    equity: definition.equation.equity,
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

function buildPartFeedback(
  part: AccountingEquationPart,
  studentResponse: AccountingEquationResponse,
  gradeResultPart: GradeResult['parts'][number],
): AccountingEquationReviewFeedback {
  const selectedValue = studentResponse[part.id];
  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    selectedLabel: selectedValue === undefined ? 'Not entered' : String(selectedValue),
    expectedLabel: String(part.targetId),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `${part.label} is correct.`
      : `${part.label} should be ${part.targetId.toLocaleString('en-US')}.`,
  };
}

export function buildAccountingEquationReviewFeedback(
  definition: AccountingEquationDefinition,
  studentResponse: AccountingEquationResponse,
  gradeResult: GradeResult,
) {
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

      return [part.id, buildPartFeedback(part, studentResponse, partResult)] as const;
    }),
  ) as Partial<Record<AccountingEquationTermId, AccountingEquationReviewFeedback>>;
}

export const accountingEquationFamily: ProblemFamily<
  AccountingEquationDefinition,
  AccountingEquationResponse,
  AccountingEquationConfig
> = {
  generate(seed, config = {}) {
    const miniLedger = generateMiniLedger(seed, {
      ...config,
      capitalMode: 'ending',
    });
    const values = buildEquationValues(miniLedger);
    const hiddenTermId = buildHiddenTerm(seed, config.hiddenTermId);
    const tolerance = config.tolerance ?? 0;
    const parts = buildParts(hiddenTermId, values, miniLedger.companyType, tolerance);
    const visibleFacts = buildVisibleFacts(hiddenTermId, values);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'accounting-equation',
      mode: config.mode ?? 'assessment',
      activityId: `accounting-equation-${seed}-${hiddenTermId}`,
      prompt: {
        title: 'Complete the accounting equation',
        stem: `Use the mini-ledger snapshot to solve for ${parts[0]?.label.toLowerCase() ?? hiddenTermId}.`,
      },
      miniLedger,
      equation: {
        ...values,
        hiddenTermId,
      },
      facts: visibleFacts,
      terms: {
        assets: {
          id: 'assets',
          label: 'Assets',
          value: values.assets,
          hidden: hiddenTermId === 'assets',
          editable: hiddenTermId === 'assets',
        },
        liabilities: {
          id: 'liabilities',
          label: 'Liabilities',
          value: values.liabilities,
          hidden: hiddenTermId === 'liabilities',
          editable: hiddenTermId === 'liabilities',
        },
        equity: {
          id: 'equity',
          label: "Owner's Equity",
          value: values.equity,
          hidden: hiddenTermId === 'equity',
          editable: hiddenTermId === 'equity',
        },
      },
      parts,
      scaffolding: {
        formula: "Assets = Liabilities + Owner's Equity",
        hiddenTermId,
        helperText:
          hiddenTermId === 'assets'
            ? 'Use liabilities plus equity to find total assets.'
            : hiddenTermId === 'liabilities'
              ? 'Use assets minus equity to find liabilities.'
              : 'Use assets minus liabilities to find owner equity.',
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'mini-ledger',
        seed,
        companyType: miniLedger.companyType,
        hiddenTermId,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const tolerance = definition.parts[0]?.details.tolerance ?? 0;
    const part = definition.parts[0];
    const scoreResult = scoreNumericPart(part.targetId, studentResponse[part.id], tolerance);
    const partResult: GradeResult['parts'][number] = {
      partId: part.id,
      rawAnswer: studentResponse[part.id],
      normalizedAnswer: scoreResult.normalizedAnswer,
      isCorrect: scoreResult.isCorrect,
      score: scoreResult.score,
      maxScore: 1,
      misconceptionTags: scoreResult.isCorrect ? [] : ['equation-imbalance', `${part.id}-mismatch`],
    };

    return {
      score: partResult.score,
      maxScore: 1,
      parts: [partResult],
      feedback: partResult.isCorrect ? 'Correct equation balance.' : 'Recheck the accounting equation and the mini-ledger totals.',
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
