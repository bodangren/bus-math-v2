import {
  buildPracticeSubmissionEnvelope,
  normalizePracticeValue,
  type PracticeSubmissionEnvelope,
} from '@/lib/practice/contract';
import { isContra, practiceAccounts, type PracticeAccount } from '@/lib/practice/engine/accounts';
import { misconceptionTags } from '@/lib/practice/misconception-taxonomy';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';

export type NormalBalanceSide = 'debit' | 'credit';
export type NormalBalanceCompanyScope = 'service' | 'retail';

export interface NormalBalancePart extends ProblemPartDefinition {
  id: string;
  kind: 'selection';
  label: string;
  description?: string;
  targetId: NormalBalanceSide;
  details: {
    accountType: PracticeAccount['accountType'];
    normalBalance: NormalBalanceSide;
    isContraAccount: boolean;
    contraOf?: string;
    retailApplicable: boolean;
    subcategory: string;
    commonConfusionPairs: string[];
    companyScope: NormalBalanceCompanyScope;
  };
}

export interface NormalBalanceDefinition extends ProblemDefinition {
  companyScope: NormalBalanceCompanyScope;
  parts: NormalBalancePart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type NormalBalanceResponse = Record<string, NormalBalanceSide>;

export interface NormalBalanceConfig {
  mode?: ProblemDefinition['mode'];
  accountCount?: number;
  includeContraAccounts?: boolean;
  companyScope?: NormalBalanceCompanyScope;
}

interface CandidateAccount {
  account: PracticeAccount;
  priority: number;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function shuffle<T>(items: T[], rng: () => number) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function buildCandidates(
  companyScope: NormalBalanceCompanyScope,
  includeContraAccounts: boolean,
  rng: () => number,
) {
  return practiceAccounts
    .filter((account) => companyScope === 'service' || account.retailApplicable)
    .filter((account) => includeContraAccounts || !isContra(account))
    .map<CandidateAccount>((account) => {
      const confusionWeight = (account.commonConfusionPairs?.length ?? 0) * 0.25;
      const contraWeight = isContra(account) ? 3 : 0;
      const retailWeight = account.retailApplicable ? 0.1 : 0;

      return {
        account,
        priority: contraWeight + confusionWeight + retailWeight + rng() * 0.2,
      };
    });
}

function selectBalancedAccounts(
  candidates: CandidateAccount[],
  accountCount: number,
  rng: () => number,
) {
  const debitCandidates = candidates
    .filter((candidate) => candidate.account.normalBalance === 'debit')
    .sort((left, right) => right.priority - left.priority || left.account.label.localeCompare(right.account.label));
  const creditCandidates = candidates
    .filter((candidate) => candidate.account.normalBalance === 'credit')
    .sort((left, right) => right.priority - left.priority || left.account.label.localeCompare(right.account.label));

  const totalCandidates = debitCandidates.length + creditCandidates.length;
  const desiredDebitCount = clamp(
    Math.round((accountCount * debitCandidates.length) / Math.max(totalCandidates, 1)),
    debitCandidates.length === 0 ? 0 : 1,
    debitCandidates.length,
  );
  const desiredCreditCount = accountCount - desiredDebitCount;

  const selected = [
    ...debitCandidates.slice(0, desiredDebitCount),
    ...creditCandidates.slice(0, Math.max(0, desiredCreditCount)),
  ];

  if (selected.length >= accountCount) {
    return shuffle(selected.slice(0, accountCount), rng);
  }

  const remaining = [...debitCandidates.slice(desiredDebitCount), ...creditCandidates.slice(Math.max(0, desiredCreditCount))].sort(
    (left, right) => right.priority - left.priority || left.account.label.localeCompare(right.account.label),
  );

  const seen = new Set(selected.map((candidate) => candidate.account.id));
  for (const candidate of remaining) {
    if (selected.length >= accountCount) {
      break;
    }

    if (seen.has(candidate.account.id)) {
      continue;
    }

    selected.push(candidate);
    seen.add(candidate.account.id);
  }

  return shuffle(selected.slice(0, accountCount), rng);
}

function buildParts(selected: CandidateAccount[], companyScope: NormalBalanceCompanyScope): NormalBalancePart[] {
  return selected.map((candidate) => ({
    id: candidate.account.id,
    kind: 'selection',
    label: candidate.account.label,
    description: `${candidate.account.accountType} account with ${candidate.account.normalBalance} normal balance`,
    prompt: `Identify the normal balance for ${candidate.account.label}.`,
    expectedAnswerShape: 'debit-or-credit',
    canonicalAnswer: candidate.account.normalBalance,
    explanation: candidate.account.contraOf
      ? `${candidate.account.label} is a contra account, so its normal balance is the opposite side of ${candidate.account.contraOf}.`
      : `${candidate.account.label} follows the ${candidate.account.normalBalance} normal balance for a ${candidate.account.accountType} account.`,
    misconceptionTags: candidate.account.contraOf
      ? [`contra-of:${candidate.account.contraOf}`, 'contra-account-same-as-parent']
      : ['normal-balance-error'],
    hintIds: candidate.account.commonConfusionPairs,
    standardCode: candidate.account.subcategory,
    artifactTarget: candidate.account.normalBalance,
    targetId: candidate.account.normalBalance,
    details: {
      accountType: candidate.account.accountType,
      normalBalance: candidate.account.normalBalance,
      isContraAccount: Boolean(candidate.account.contraOf),
      contraOf: candidate.account.contraOf,
      retailApplicable: candidate.account.retailApplicable,
      subcategory: candidate.account.subcategory,
      commonConfusionPairs: candidate.account.commonConfusionPairs ?? [],
      companyScope,
    },
  }));
}

function buildNormalBalanceResponse(definition: NormalBalanceDefinition): NormalBalanceResponse {
  return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId]));
}

function getContraParentBalance(part: NormalBalancePart) {
  if (!part.details.contraOf) {
    return null;
  }

  return practiceAccounts.find((account) => account.id === part.details.contraOf)?.normalBalance ?? null;
}

function explainNormalBalance(part: NormalBalancePart) {
  if (part.details.isContraAccount && part.details.contraOf) {
    return `${part.label} is a contra account, so it uses the opposite side from ${part.details.contraOf}.`;
  }

  switch (part.details.accountType) {
    case 'asset':
      return 'Assets increase on the debit side.';
    case 'liability':
      return 'Liabilities increase on the credit side.';
    case 'equity':
      return 'Equity increases on the credit side.';
    case 'revenue':
      return 'Revenue increases equity, so it uses the credit side.';
    case 'expense':
      return 'Expenses increase on the debit side.';
    default:
      return `This account uses the ${part.targetId} side.`;
  }
}

function buildPartFeedback(part: NormalBalancePart, studentResponse: NormalBalanceResponse, gradeResult: GradeResult['parts'][number]) {
  const selectedBalance = normalizePracticeValue(studentResponse[part.id]) as NormalBalanceSide;
  const expectedBalance = part.targetId;
  const contraParentBalance = getContraParentBalance(part);
  const isCorrect = gradeResult.isCorrect;

  return {
    status: isCorrect ? 'correct' : 'incorrect',
    scoreLabel: `${gradeResult.score}/${gradeResult.maxScore}`,
    selectedBalanceLabel: selectedBalance ? selectedBalance.toUpperCase() : 'Not selected',
    expectedBalanceLabel: expectedBalance.toUpperCase(),
    misconceptionTags: gradeResult.misconceptionTags,
    message: isCorrect
      ? `Correct normal balance. ${explainNormalBalance(part)}`
      : part.details.isContraAccount && contraParentBalance && selectedBalance === contraParentBalance
        ? `This contra account should not use the same side as ${part.details.contraOf}. ${explainNormalBalance(part)}`
        : `Expected ${expectedBalance.toUpperCase()}. ${explainNormalBalance(part)}`,
  };
}

export function buildNormalBalanceReviewFeedback(
  definition: NormalBalanceDefinition,
  studentResponse: NormalBalanceResponse,
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
            scoreLabel: `${partResult.score}/${partResult.maxScore}`,
            selectedBalanceLabel: 'Not selected',
            expectedBalanceLabel: 'UNKNOWN',
            misconceptionTags: partResult.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      return [part.id, buildPartFeedback(part, studentResponse, partResult)] as const;
    }),
  );
}

export const normalBalanceFamily: ProblemFamily<
  NormalBalanceDefinition,
  NormalBalanceResponse,
  NormalBalanceConfig
> = {
  generate(seed, config = {}) {
    const companyScope = config.companyScope ?? 'service';
    const includeContraAccounts = config.includeContraAccounts ?? true;
    const rng = mulberry32(seed);
    const candidates = buildCandidates(companyScope, includeContraAccounts, rng);
    const accountCount = clamp(config.accountCount ?? Math.max(8, Math.min(12, candidates.length)), 4, candidates.length);
    const selected = selectBalancedAccounts(candidates, accountCount, rng);
    const parts = buildParts(selected, companyScope);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'normal-balance',
      mode: config.mode ?? 'assessment',
      activityId: `normal-balance-${companyScope}-${seed}`,
      prompt: {
        title: 'Identify account normal balances',
        stem: 'Choose debit or credit for each account.',
      },
      companyScope,
      parts,
      workedExample:
        parts.length > 0
          ? {
              itemId: parts[0].id,
              accountLabel: parts[0].label,
              expectedBalance: parts[0].targetId,
              explanation: parts[0].explanation,
            }
          : undefined,
      scaffolding: {
        showBalanceLegend: true,
        includeContraAccounts,
        companyScope,
        mnemonic: {
          debit: 'DEA: Dividends, Expenses, Assets',
          credit: 'LER: Liabilities, Equity, Revenue',
          hint: 'Debit increases what you own (DEA); Credit increases what you owe or own (LER)',
        },
      },
      grading: {
        strategy: 'exact',
        partialCredit: false,
        rubric: {
          includeContraAccounts,
          companyScope,
        },
      },
      analyticsConfig: {
        generator: 'normal-balance-family',
        seed,
        accountCount: parts.length,
        companyScope,
        includeContraAccounts,
      },
    };
  },

  solve(definition) {
    return buildNormalBalanceResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const rawAnswer = studentResponse[part.id];
      const normalizedAnswer = normalizePracticeValue(rawAnswer) as NormalBalanceSide;
      const isCorrect = normalizedAnswer === part.targetId;
      const contraParentBalance = getContraParentBalance(part);
      const isContraAccountError = part.details.isContraAccount && contraParentBalance === normalizedAnswer;

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
              ...misconceptionTags('wrong-normal-balance'),
              ...(isContraAccountError ? ['contra-account-same-as-parent'] : []),
              ...(part.details.contraOf ? [`contra-of:${part.details.contraOf}`] : []),
            ],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} normal balances correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const columns = [
      { id: 'debit', label: 'Debit', description: 'Accounts with debit normal balances' },
      { id: 'credit', label: 'Credit', description: 'Accounts with credit normal balances' },
    ];

    const artifact = {
      kind: 'normal-balance-grid',
      family: definition.familyKey,
      companyScope: definition.companyScope,
      columns,
      rows: definition.parts.map((part) => {
        const selectedBalance = normalizePracticeValue(studentResponse[part.id]) as NormalBalanceSide;
        const partResult = gradeResult.parts.find((entry) => entry.partId === part.id);

        return {
          id: part.id,
          label: part.label,
          description: part.description,
          accountType: part.details.accountType,
          normalBalance: part.details.normalBalance,
          selectedBalance,
          expectedBalance: part.targetId,
          isContraAccount: part.details.isContraAccount,
          contraOf: part.details.contraOf,
          retailApplicable: part.details.retailApplicable,
          subcategory: part.details.subcategory,
          commonConfusionPairs: part.details.commonConfusionPairs,
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
        rawAnswer: part.rawAnswer ?? studentResponse[part.partId],
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
        companyScope: definition.companyScope,
        accountCount: definition.parts.length,
      },
    });
  },
};
