import { buildPracticeSubmissionEnvelope, normalizePracticeValue, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';
import { buildTransactionEvent, type TransactionBuildOptions, type TransactionEffect, type TransactionEvent } from '@/lib/practice/engine/transactions';
import {
  buildAccountEffectSummary,
  buildEffectDescription,
  describeTransactionFocus,
  formatDirectionLabel,
  getReasonTag,
  transactionDirectionColumns,
  transactionReasonColumns,
  type TransactionDirection,
  type TransactionReasonId,
} from './transaction-analysis-utils';

export interface TransactionEffectsRow {
  id: string;
  label: string;
  description: string;
  hint?: string;
  selectionMode?: 'single';
}

export interface TransactionEffectsColumn {
  id: TransactionDirection;
  label: string;
  description?: string;
}

export interface TransactionEffectsPart extends ProblemPartDefinition {
  id: string;
  kind: 'selection' | 'numeric';
  label: string;
  description?: string;
  targetId: string | number;
  details: {
    kind: 'effect' | 'summary' | 'amount' | 'reason';
    accountId?: string;
    accountLabel?: string;
    accountType?: TransactionEffect['accountType'];
    expectedDirection?: TransactionDirection;
    expectedAmount?: number;
    reason?: TransactionReasonId;
    reasonLabel?: string;
    explanation: string;
  };
}

export interface TransactionEffectsDefinition extends ProblemDefinition {
  event: TransactionEvent;
  rows: TransactionEffectsRow[];
  columns: TransactionEffectsColumn[];
  parts: TransactionEffectsPart[];
  matrixRows: TransactionEffectsRow[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type TransactionEffectsResponse = Record<string, string | number>;

export interface TransactionEffectsConfig extends TransactionBuildOptions {
  mode?: ProblemDefinition['mode'];
}

export interface TransactionEffectsReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

function buildEffectRows(event: TransactionEvent) {
  const effectRows: TransactionEffectsRow[] = event.effects.map((effect) => ({
    id: effect.accountId,
    label: effect.label,
    description: buildEffectDescription(event, effect.label, effect.direction === 'increase' ? 'increase' : 'decrease'),
    hint: `${effect.accountType} account • ${effect.normalBalance} normal balance`,
  }));

  const summaryRows: TransactionEffectsRow[] = [
    {
      id: 'assets',
      label: 'Assets',
      description: `${formatDirectionLabel(buildAccountEffectSummary(event, 'asset'))} across the asset accounts.`,
    },
    {
      id: 'liabilities',
      label: 'Liabilities',
      description: `${formatDirectionLabel(buildAccountEffectSummary(event, 'liability'))} across the liability accounts.`,
    },
    {
      id: 'equity',
      label: "Owner's Equity",
      description: `Net equity effect: ${formatDirectionLabel(event.equityEffect === 'increases' ? 'increase' : event.equityEffect === 'decreases' ? 'decrease' : 'no-effect')}.`,
    },
  ];

  return [...effectRows, ...summaryRows];
}

function buildParts(event: TransactionEvent): TransactionEffectsPart[] {
  const reason = transactionReasonColumns.find((entry) => entry.id === getReasonTag(event).slice('reason:'.length)) ?? transactionReasonColumns[1];

  const effectParts: TransactionEffectsPart[] = event.effects.map((effect) => ({
    id: effect.accountId,
    kind: 'selection' as const,
    label: effect.label,
    description: `${effect.accountType} account`,
    prompt: `Select the direction for ${effect.label}.`,
    expectedAnswerShape: 'direction-id',
    canonicalAnswer: effect.direction,
    explanation: buildEffectDescription(event, effect.label, effect.direction),
    misconceptionTags: [`${effect.accountId}-direction-error`],
    standardCode: 'ACC-M7-TX-EFFECT',
    artifactTarget: effect.direction,
    targetId: effect.direction,
    details: {
      kind: 'effect',
      accountId: effect.accountId,
      accountLabel: effect.label,
      accountType: effect.accountType,
      expectedDirection: effect.direction,
      reason: reason.id,
      reasonLabel: reason.label,
      explanation: buildEffectDescription(event, effect.label, effect.direction),
    },
  }));

  const summaryParts: TransactionEffectsPart[] = [
    {
      id: 'assets',
      kind: 'selection',
      label: 'Assets',
      description: 'Net asset impact',
      prompt: 'Choose the asset-category effect.',
      expectedAnswerShape: 'direction-id',
      canonicalAnswer: buildAccountEffectSummary(event, 'asset'),
      explanation: `Asset accounts move ${formatDirectionLabel(buildAccountEffectSummary(event, 'asset')).toLowerCase()}.`,
      misconceptionTags: ['asset-summary-error'],
      standardCode: 'ACC-M7-TX-SUMMARY',
      artifactTarget: buildAccountEffectSummary(event, 'asset'),
      targetId: buildAccountEffectSummary(event, 'asset'),
      details: {
        kind: 'summary',
        expectedDirection: buildAccountEffectSummary(event, 'asset'),
        reason: reason.id,
        reasonLabel: reason.label,
        explanation: `Asset accounts move ${formatDirectionLabel(buildAccountEffectSummary(event, 'asset')).toLowerCase()}.`,
      },
    },
    {
      id: 'liabilities',
      kind: 'selection',
      label: 'Liabilities',
      description: 'Net liability impact',
      prompt: 'Choose the liability-category effect.',
      expectedAnswerShape: 'direction-id',
      canonicalAnswer: buildAccountEffectSummary(event, 'liability'),
      explanation: `Liability accounts move ${formatDirectionLabel(buildAccountEffectSummary(event, 'liability')).toLowerCase()}.`,
      misconceptionTags: ['liability-summary-error'],
      standardCode: 'ACC-M7-TX-SUMMARY',
      artifactTarget: buildAccountEffectSummary(event, 'liability'),
      targetId: buildAccountEffectSummary(event, 'liability'),
      details: {
        kind: 'summary',
        expectedDirection: buildAccountEffectSummary(event, 'liability'),
        reason: reason.id,
        reasonLabel: reason.label,
        explanation: `Liability accounts move ${formatDirectionLabel(buildAccountEffectSummary(event, 'liability')).toLowerCase()}.`,
      },
    },
    {
      id: 'equity',
      kind: 'selection',
      label: "Owner's Equity",
      description: 'Net owner-claim impact',
      prompt: "Choose the owner's equity effect.",
      expectedAnswerShape: 'direction-id',
      canonicalAnswer: event.equityEffect === 'increases' ? 'increase' : event.equityEffect === 'decreases' ? 'decrease' : 'no-effect',
      explanation: event.equityReason,
      misconceptionTags: [`equity-${event.equityEffect}`],
      standardCode: 'ACC-M7-TX-SUMMARY',
      artifactTarget: event.equityEffect === 'increases' ? 'increase' : event.equityEffect === 'decreases' ? 'decrease' : 'no-effect',
      targetId: event.equityEffect === 'increases' ? 'increase' : event.equityEffect === 'decreases' ? 'decrease' : 'no-effect',
      details: {
        kind: 'summary',
        expectedDirection: event.equityEffect === 'increases' ? 'increase' : event.equityEffect === 'decreases' ? 'decrease' : 'no-effect',
        reason: reason.id,
        reasonLabel: reason.label,
        explanation: event.equityReason,
      },
    },
    {
      id: 'amount',
      kind: 'numeric',
      label: 'Amount',
      description: 'Transaction amount',
      prompt: 'Enter the transaction amount.',
      expectedAnswerShape: 'number',
      canonicalAnswer: event.amount,
      explanation: `The transaction amount is $${event.amount.toLocaleString('en-US')}.`,
      misconceptionTags: ['amount-error'],
      standardCode: 'ACC-M7-TX-AMOUNT',
      artifactTarget: event.amount.toString(),
      targetId: event.amount,
      details: {
        kind: 'amount',
        expectedAmount: event.amount,
        reason: reason.id,
        reasonLabel: reason.label,
        explanation: `The transaction amount is $${event.amount.toLocaleString('en-US')}.`,
      },
    },
    {
      id: 'equity-reason',
      kind: 'selection',
      label: 'Why equity changes',
      description: 'The economic story behind the equity effect',
      prompt: 'Choose the reason equity changes.',
      expectedAnswerShape: 'reason-id',
      canonicalAnswer: reason.id,
      explanation: reason.description,
      misconceptionTags: [`reason-${reason.id}`],
      standardCode: 'ACC-M7-TX-REASON',
      artifactTarget: reason.id,
      targetId: reason.id,
      details: {
        kind: 'reason',
        reason: reason.id,
        reasonLabel: reason.label,
        explanation: reason.description,
      },
    },
  ];

  return [...effectParts, ...summaryParts];
}

function buildResponse(definition: TransactionEffectsDefinition): TransactionEffectsResponse {
  const response: TransactionEffectsResponse = {};
  for (const effect of definition.event.effects) {
    response[effect.accountId] = effect.direction;
  }

  response.assets = buildAccountEffectSummary(definition.event, 'asset');
  response.liabilities = buildAccountEffectSummary(definition.event, 'liability');
  response.equity = definition.event.equityEffect === 'increases' ? 'increase' : definition.event.equityEffect === 'decreases' ? 'decrease' : 'no-effect';
  response.amount = definition.event.amount;
  response['equity-reason'] = getReasonTag(definition.event).slice('reason:'.length);

  return response;
}

function buildPartFeedback(
  part: TransactionEffectsPart,
  studentResponse: TransactionEffectsResponse,
  gradeResultPart: GradeResult['parts'][number],
): TransactionEffectsReviewFeedback {
  const selectedValue = studentResponse[part.id];
  const selectedLabel =
    part.kind === 'numeric'
      ? `$${Number(selectedValue ?? 0).toLocaleString('en-US')}`
      : typeof selectedValue === 'string'
        ? selectedValue === 'no-effect'
          ? 'No effect'
          : selectedValue.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase())
        : 'Not selected';
  const expectedLabel =
    part.kind === 'numeric'
      ? `$${Number(part.targetId).toLocaleString('en-US')}`
      : typeof part.targetId === 'number'
        ? `$${part.targetId.toLocaleString('en-US')}`
        : part.targetId === 'no-effect'
          ? 'No effect'
          : part.targetId[0].toUpperCase() + part.targetId.slice(1);

  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: gradeResultPart.isCorrect
      ? part.details.kind === 'reason'
        ? `${part.details.reasonLabel} explains the equity change.`
        : part.details.kind === 'amount'
          ? `Correct amount: $${Number(part.targetId).toLocaleString('en-US')}.`
          : `Correct ${part.label.toLowerCase()}.`
      : part.details.kind === 'reason'
        ? `You treated this transaction as ${selectedLabel.toLowerCase()}, but it is ${part.details.reasonLabel?.toLowerCase()} because ${part.details.explanation}.`
        : part.details.kind === 'amount'
          ? `The amount is $${Number(part.targetId).toLocaleString('en-US')}.`
          : `${part.label} should be ${expectedLabel.toLowerCase()}. ${part.details.explanation}`,
  };
}

export function buildTransactionEffectsReviewFeedback(
  definition: TransactionEffectsDefinition,
  studentResponse: TransactionEffectsResponse,
  gradeResult: GradeResult,
): Record<string, TransactionEffectsReviewFeedback> {
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

export const transactionEffectsFamily: ProblemFamily<
  TransactionEffectsDefinition,
  TransactionEffectsResponse,
  TransactionEffectsConfig
> = {
  generate(seed, config = {}) {
    const event = buildTransactionEvent(config.archetypeId ?? 'earn-revenue', {
      ...config,
      seed,
      context: config.context ?? 'service',
      settlement: config.settlement ?? 'cash',
    });
    const rows = buildEffectRows(event);
    const parts = buildParts(event);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'transaction-effects',
      mode: config.mode ?? 'guided_practice',
      activityId: `transaction-effects-${event.archetypeId}-${seed}`,
      prompt: {
        title: 'Transaction effects on accounts',
        stem: 'Use the transaction narrative to identify how the major accounts change and why equity changes.',
      },
      event,
      rows,
      columns: [...transactionDirectionColumns],
      matrixRows: rows,
      parts,
      workedExample: {
        transaction: event.narrative,
        amount: event.amount,
        equityReason: event.equityReason,
        exampleAccountId: event.effects[0]?.accountId,
        exampleDirection: event.effects[0]?.direction,
      },
      scaffolding: {
        showTransactionSummary: true,
        showAmountStrip: true,
        showReasonStrip: true,
      },
      grading: {
        strategy: 'exact',
        partialCredit: false,
        rubric: {
          archetypeId: event.archetypeId,
        },
      },
      analyticsConfig: {
        generator: 'transaction-effects-family',
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
      const expectedAnswer =
        part.kind === 'numeric'
          ? normalizePracticeValue(part.targetId)
          : normalizePracticeValue(part.targetId);
      const isCorrect = normalizedAnswer === expectedAnswer;

      return {
        partId: part.id,
        rawAnswer,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect ? [] : [`transaction-effects:${part.id}`],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} transaction-analysis outputs correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'transaction-effects-analysis',
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
