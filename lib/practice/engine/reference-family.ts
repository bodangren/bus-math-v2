import { buildPracticeSubmissionEnvelopeFromGrade, type GradeResult, type ProblemDefinition, type ProblemFamily } from './types';
import { generateMiniLedger, type MiniLedger, type MiniLedgerConfig } from './mini-ledger';
import { normalizePracticeValue } from '@/lib/practice/contract';

export interface AccountingEquationDefinition extends ProblemDefinition {
  miniLedger: MiniLedger;
  answer: number;
}

export interface AccountingEquationResponse {
  ownerEquity: number;
}

export type AccountingEquationConfig = MiniLedgerConfig & {
  mode?: ProblemDefinition['mode'];
};

function buildParts(answer: number, response: AccountingEquationResponse): GradeResult['parts'] {
  const isCorrect = Number(response.ownerEquity) === answer;
  return [
    {
      partId: 'ownerEquity',
      rawAnswer: response.ownerEquity,
      normalizedAnswer: normalizePracticeValue(response.ownerEquity),
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      misconceptionTags: isCorrect ? [] : ['equation-imbalance'],
    },
  ];
}

export const referenceAccountingEquationFamily: ProblemFamily<
  AccountingEquationDefinition,
  AccountingEquationResponse,
  AccountingEquationConfig
> = {
  generate(seed, config = {}) {
    const miniLedger = generateMiniLedger(seed, config);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'accounting-equation',
      mode: config.mode ?? 'assessment',
      activityId: `accounting-equation-${seed}`,
      prompt: {
        title: 'Balance the accounting equation',
        stem: `Use the mini-ledger snapshot to determine owner equity for a ${miniLedger.companyType} company.`,
      },
      parts: [
        {
          id: 'ownerEquity',
          kind: 'numeric',
          prompt: 'What is owner equity?',
          expectedAnswerShape: 'number',
          canonicalAnswer: miniLedger.totals.endingCapital,
          explanation: 'Owner equity is the residual claim after liabilities are deducted from assets.',
          misconceptionTags: ['equation-imbalance', 'liabilities-omitted'],
          standardCode: 'ACC-1.1',
        },
      ],
      scaffolding: {
        showEquation: true,
      },
      grading: {
        strategy: 'numeric',
        partialCredit: false,
      },
      analyticsConfig: {
        generator: 'mini-ledger',
        seed,
        companyType: miniLedger.companyType,
      },
      miniLedger,
      answer: miniLedger.totals.endingCapital,
    };
  },

  solve(definition) {
    return {
      ownerEquity: definition.answer,
    };
  },

  grade(definition, studentResponse) {
    const isCorrect = Number(studentResponse.ownerEquity) === definition.answer;
    const parts = buildParts(definition.answer, studentResponse);
    return {
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      parts,
      feedback: isCorrect ? 'Correct owner equity.' : 'Recheck liabilities and the retained earnings line in the ledger.',
    };
  },

  toEnvelope(definition, studentResponse, gradeResult) {
    return buildPracticeSubmissionEnvelopeFromGrade(
      {
        activityId: definition.activityId,
        mode: definition.mode,
      },
      {
        ownerEquity: studentResponse.ownerEquity,
      },
      gradeResult,
    );
  },
};
