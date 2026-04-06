import { buildPracticeSubmissionEnvelope, normalizePracticeValue, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';
import { practiceAccounts } from '@/lib/practice/engine/accounts';
import { buildTransactionEvent, type TransactionBuildOptions, type TransactionEvent } from '@/lib/practice/engine/transactions';
import {
  buildEffectDescription,
  buildReasonMessage,
  describeTransactionFocus,
  formatDirectionLabel,
  getReasonTag,
  transactionReasonColumns,
} from './transaction-analysis-utils';

export interface TransactionMatrixRow {
  id: string;
  label: string;
  description: string;
  hint?: string;
  selectionMode?: 'single';
}

export interface TransactionMatrixColumn {
  id: string;
  label: string;
  description?: string;
}

export interface TransactionMatrixPart extends ProblemPartDefinition {
  id: string;
  kind: 'selection' | 'numeric';
  label: string;
  description?: string;
  targetId: string;
  details: {
    stage: 'cash' | 'offset' | 'income-statement' | 'equity' | 'distractor';
    accountId?: string;
    accountLabel?: string;
    expectedColumnId: string;
    amount?: number;
    reasonLabel?: string;
    explanation: string;
  };
}

export interface TransactionMatrixDefinition extends ProblemDefinition {
  event: TransactionEvent;
  rows: TransactionMatrixRow[];
  columns: TransactionMatrixColumn[];
  parts: TransactionMatrixPart[];
  matrixRows: TransactionMatrixRow[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type TransactionMatrixResponse = Record<string, string | number>;

export interface TransactionMatrixConfig extends TransactionBuildOptions {
  mode?: ProblemDefinition['mode'];
}

export interface TransactionMatrixReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

const MATRIX_COLUMNS: TransactionMatrixColumn[] = [
  { id: 'affected', label: 'Affected?', description: 'This row is part of the transaction' },
  { id: 'direction', label: 'Direction', description: 'The account increases or decreases' },
  { id: 'amount-basis', label: 'Amount basis', description: 'The dollar amount comes from this row' },
  { id: 'equity-reason', label: 'Equity reason', description: 'This row explains the owner-claim effect' },
  { id: 'not-affected', label: 'Not affected', description: 'This row is not part of the transaction' },
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

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickDistractorAccounts(event: TransactionEvent, seed: number): Array<{ id: string; label: string }> {
  const involvedIds = new Set(event.effects.map((e) => e.accountId));
  const candidates = practiceAccounts.filter((a) => !involvedIds.has(a.id) && a.retailApplicable);
  const rng = mulberry32(seed ^ 0x3a7c9e1f);
  const shuffled = shuffleArray(candidates, rng);
  return shuffled.slice(0, 2).map((a) => ({ id: a.id, label: a.label }));
}

function buildRows(event: TransactionEvent, seed: number) {
  const cashEffect = event.effects.find((effect) => effect.accountId === 'cash') ?? event.effects[0];
  const offsetEffect = event.effects.find((effect) => effect.accountId !== 'cash') ?? event.effects[1] ?? event.effects[0];
  const equityDirection = event.equityEffect === 'increases' ? 'increase' : event.equityEffect === 'decreases' ? 'decrease' : 'no-effect';

  const effectRows: TransactionMatrixRow[] = [
    {
      id: 'cash',
      label: 'Cash',
      description: `Cash ${cashEffect?.direction === 'increase' ? 'comes in' : cashEffect?.direction === 'decrease' ? 'goes out' : 'does not change'} because ${buildReasonMessage(event).toLowerCase()}.`,
      hint: `Transaction clue: ${event.narrative}`,
    },
    {
      id: 'offset-account',
      label: offsetEffect?.label ?? 'Offset account',
      description: buildEffectDescription(event, offsetEffect?.label ?? 'Offset account', offsetEffect?.direction === 'increase' ? 'increase' : 'decrease'),
      hint: `${offsetEffect?.accountType ?? 'offset'} account`,
    },
    {
      id: 'income-statement',
      label: 'Revenue or Expense',
      description: `The income statement side follows ${buildReasonMessage(event).toLowerCase()}.`,
      hint: 'Tie the amount to the account effect.',
    },
    {
      id: 'equity',
      label: "Owner's Equity effect",
      description: `Owner's equity ${formatDirectionLabel(equityDirection).toLowerCase()} when ${buildReasonMessage(event).toLowerCase()}.`,
      hint: 'Pick the reasoning stage that explains the owner-claim change.',
    },
  ];

  const distractors = pickDistractorAccounts(event, seed);
  const distractorRows: TransactionMatrixRow[] = distractors.map((account, index) => ({
    id: `distractor-${index + 1}`,
    label: account.label,
    description: `${account.label} is not involved in this transaction.`,
    hint: 'Determine whether this account is affected.',
  }));

  const rng = mulberry32(seed ^ 0x7b2d4e6a);
  return shuffleArray([...effectRows, ...distractorRows], rng);
}

function buildParts(event: TransactionEvent, seed: number): TransactionMatrixPart[] {
  const reason = transactionReasonColumns.find((entry) => entry.id === getReasonTag(event).slice('reason:'.length)) ?? transactionReasonColumns[1];
  const offsetEffect = event.effects[1] ?? event.effects[0];
  const distractors = pickDistractorAccounts(event, seed);

  const realParts: TransactionMatrixPart[] = [
    {
      id: 'cash',
      kind: 'selection',
      label: 'Cash',
      description: 'Start with the cash clue.',
      prompt: 'Choose the reasoning stage for cash.',
      expectedAnswerShape: 'stage-id',
      canonicalAnswer: 'affected',
      explanation: `Cash is affected by ${event.narrative}`,
      misconceptionTags: ['cash-stage-error'],
      standardCode: 'ACC-M7-TX-MATRIX',
      artifactTarget: 'affected',
      targetId: 'affected',
      details: {
        stage: 'cash',
        accountId: event.effects[0]?.accountId,
        accountLabel: event.effects[0]?.label,
        expectedColumnId: 'affected',
        amount: event.amount,
        reasonLabel: reason.label,
        explanation: `Cash is affected by ${event.narrative}`,
      },
    },
    {
      id: 'offset-account',
      kind: 'selection',
      label: offsetEffect?.label ?? 'Offset account',
      description: 'Analyze the offsetting side.',
      prompt: 'Choose the reasoning stage for the offset account.',
      expectedAnswerShape: 'stage-id',
      canonicalAnswer: 'direction',
      explanation: buildEffectDescription(event, offsetEffect?.label ?? 'Offset account', offsetEffect?.direction === 'increase' ? 'increase' : 'decrease'),
      misconceptionTags: ['offset-stage-error'],
      standardCode: 'ACC-M7-TX-MATRIX',
      artifactTarget: 'direction',
      targetId: 'direction',
      details: {
        stage: 'offset',
        accountId: offsetEffect?.accountId,
        accountLabel: offsetEffect?.label,
        expectedColumnId: 'direction',
        amount: event.amount,
        reasonLabel: reason.label,
        explanation: buildEffectDescription(event, offsetEffect?.label ?? 'Offset account', offsetEffect?.direction === 'increase' ? 'increase' : 'decrease'),
      },
    },
    {
      id: 'income-statement',
      kind: 'selection',
      label: 'Revenue or Expense',
      description: 'Tie the amount to the income statement effect.',
      prompt: 'Choose the reasoning stage for the income-statement side.',
      expectedAnswerShape: 'stage-id',
      canonicalAnswer: 'amount-basis',
      explanation: `Use ${event.amount.toLocaleString('en-US')} as the amount basis for ${event.effects[1]?.label ?? 'the offset account'}.`,
      misconceptionTags: ['amount-stage-error'],
      standardCode: 'ACC-M7-TX-MATRIX',
      artifactTarget: 'amount-basis',
      targetId: 'amount-basis',
      details: {
        stage: 'income-statement',
        accountId: event.effects[1]?.accountId,
        accountLabel: event.effects[1]?.label,
        expectedColumnId: 'amount-basis',
        amount: event.amount,
        reasonLabel: reason.label,
        explanation: `Use ${event.amount.toLocaleString('en-US')} as the amount basis for ${event.effects[1]?.label ?? 'the offset account'}.`,
      },
    },
    {
      id: 'equity',
      kind: 'selection',
      label: "Owner's Equity effect",
      description: 'Explain the owner-claim effect last.',
      prompt: 'Choose the reasoning stage for equity.',
      expectedAnswerShape: 'stage-id',
      canonicalAnswer: 'equity-reason',
      explanation: event.equityReason,
      misconceptionTags: ['equity-stage-error'],
      standardCode: 'ACC-M7-TX-MATRIX',
      artifactTarget: 'equity-reason',
      targetId: 'equity-reason',
      details: {
        stage: 'equity',
        accountId: undefined,
        accountLabel: "Owner's Equity",
        expectedColumnId: 'equity-reason',
        amount: event.amount,
        reasonLabel: reason.label,
        explanation: event.equityReason,
      },
    },
  ];

  const distractorParts: TransactionMatrixPart[] = distractors.map((account, index) => ({
    id: `distractor-${index + 1}`,
    kind: 'selection' as const,
    label: account.label,
    description: 'Determine whether this account is part of the transaction.',
    prompt: `Choose the reasoning stage for ${account.label}.`,
    expectedAnswerShape: 'stage-id',
    canonicalAnswer: 'not-affected',
    explanation: `${account.label} is not involved in this transaction.`,
    misconceptionTags: ['distractor-stage-error'],
    standardCode: 'ACC-M7-TX-MATRIX',
    artifactTarget: 'not-affected',
    targetId: 'not-affected',
    details: {
      stage: 'distractor' as const,
      accountId: account.id,
      accountLabel: account.label,
      expectedColumnId: 'not-affected',
      explanation: `${account.label} is not involved in this transaction.`,
    },
  }));

  return [...realParts, ...distractorParts];
}

function buildResponse(definition: TransactionMatrixDefinition): TransactionMatrixResponse {
  return Object.fromEntries(definition.parts.map((part) => [part.id, part.targetId])) as TransactionMatrixResponse;
}

function buildPartFeedback(
  part: TransactionMatrixPart,
  studentResponse: TransactionMatrixResponse,
  gradeResultPart: GradeResult['parts'][number],
): TransactionMatrixReviewFeedback {
  const selectedValue = studentResponse[part.id];
  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel: typeof selectedValue === 'string' ? selectedValue.replace(/-/g, ' ') : 'Not selected',
    expectedLabel: part.targetId.replace(/-/g, ' '),
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? `${part.label} sits in the ${part.targetId.replace(/-/g, ' ')} stage.`
      : `${part.label} belongs in the ${part.targetId.replace(/-/g, ' ')} stage because ${part.details.explanation}`,
  };
}

export function buildTransactionMatrixReviewFeedback(
  definition: TransactionMatrixDefinition,
  studentResponse: TransactionMatrixResponse,
  gradeResult: GradeResult,
): Record<string, TransactionMatrixReviewFeedback> {
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

export const transactionMatrixFamily: ProblemFamily<
  TransactionMatrixDefinition,
  TransactionMatrixResponse,
  TransactionMatrixConfig
> = {
  generate(seed, config = {}) {
    const event = buildTransactionEvent(config.archetypeId ?? 'purchase-asset', {
      ...config,
      seed,
      context: config.context ?? 'merchandise',
      settlement: config.settlement ?? 'on-account',
    });
    const rows = buildRows(event, seed);
    const parts = buildParts(event, seed);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'transaction-matrix',
      mode: config.mode ?? 'guided_practice',
      activityId: `transaction-matrix-${event.archetypeId}-${seed}`,
      prompt: {
        title: 'Transaction reasoning matrix',
        stem: 'Work left to right through the reasoning stages and identify the owner-claim story behind the transaction.',
      },
      event,
      rows,
      columns: MATRIX_COLUMNS,
      matrixRows: rows,
      parts,
      workedExample: {
        transaction: event.narrative,
        sourceDocumentClue: event.tags.join(', '),
        firstDecision: rows[0]?.id,
      },
      scaffolding: {
        showTransactionSummary: true,
        showReasonStrip: true,
        stageColumns: MATRIX_COLUMNS.map((column) => column.id),
      },
      grading: {
        strategy: 'exact',
        partialCredit: false,
        rubric: {
          archetypeId: event.archetypeId,
        },
      },
      analyticsConfig: {
        generator: 'transaction-matrix-family',
        seed,
        archetypeId: event.archetypeId,
        context: event.context,
        settlement: event.settlement,
        amount: event.amount,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const rawAnswer = studentResponse[part.id];
      const normalizedAnswer = normalizePracticeValue(rawAnswer);
      const expectedAnswer = normalizePracticeValue(part.targetId);
      const isCorrect = normalizedAnswer === expectedAnswer;

      const tags: string[] = [];
      if (!isCorrect) {
        const contextTag = `transaction-matrix:${part.id}`;
        tags.push(contextTag);
      }

      return {
        partId: part.id,
        rawAnswer,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: tags,
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} reasoning stages correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'transaction-matrix-analysis',
      family: definition.familyKey,
      event: definition.event,
      rows: definition.rows,
      columns: definition.columns,
      entries: definition.parts.map((part) => {
        const selectedValue = studentResponse[part.id];
        const partResult = gradeResult.parts.find((entry) => entry.partId === part.id);

        return {
          id: part.id,
          label: part.label,
          description: part.description,
          kind: part.kind,
          selectedValue,
          expectedValue: part.targetId,
          isCorrect: partResult?.isCorrect ?? false,
          misconceptionTags: partResult?.misconceptionTags ?? [],
        };
      }),
      summary: describeTransactionFocus(definition.event),
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
        archetypeId: definition.event.archetypeId,
        context: definition.event.context,
      },
    });
  },
};
