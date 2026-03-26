import { buildPracticeSubmissionEnvelope, normalizePracticeValue, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';
import {
  formatTrialBalanceBalanceAnswer,
  formatTrialBalanceDifference,
  formatTrialBalanceLargerColumn,
  generateTrialBalanceErrorScenarios,
  type TrialBalanceBalanceAnswer,
  type TrialBalanceErrorGenerationConfig,
  type TrialBalanceErrorScenario,
  type TrialBalanceLargerColumn,
} from '../errors';

export interface TrialBalanceErrorRow {
  id: string;
  label: string;
  description: string;
  hint?: string;
}

export interface TrialBalanceErrorColumn {
  id: 'balanced' | 'difference' | 'larger-column';
  label: string;
  description?: string;
}

export interface TrialBalanceErrorPart extends ProblemPartDefinition {
  id: string;
  kind: 'selection' | 'numeric';
  label: string;
  description: string;
  targetId: string | number;
  details: {
    scenarioId: string;
    rowId: string;
    answerKind: 'balanced' | 'difference' | 'larger-column';
    explanation: string;
    errorType: TrialBalanceErrorScenario['archetypeId'];
    expectedBalanced: TrialBalanceBalanceAnswer;
    expectedDifference: number;
    expectedLargerColumn: TrialBalanceLargerColumn;
    misconceptionTags: string[];
  };
}

export interface TrialBalanceErrorDefinition extends ProblemDefinition {
  scenarios: TrialBalanceErrorScenario[];
  rows: TrialBalanceErrorRow[];
  columns: TrialBalanceErrorColumn[];
  parts: TrialBalanceErrorPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type TrialBalanceErrorResponse = Record<string, string | number>;

export interface TrialBalanceErrorConfig extends TrialBalanceErrorGenerationConfig {
  mode?: ProblemDefinition['mode'];
}

export interface TrialBalanceErrorReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

export interface TrialBalanceErrorScenarioReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

function formatPartLabel(answerKind: TrialBalanceErrorPart['details']['answerKind']) {
  switch (answerKind) {
    case 'balanced':
      return 'Balanced?';
    case 'difference':
      return 'Difference';
    default:
      return 'Larger column';
  }
}

function formatSelectionValue(value: string | number | undefined) {
  if (typeof value === 'number') {
    return formatTrialBalanceDifference(value);
  }

  if (typeof value !== 'string') {
    return 'Not selected';
  }

  if (value === 'still-balances') {
    return 'Still balances';
  }

  if (value === 'out-of-balance') {
    return 'Out of balance';
  }

  if (value === 'neither') {
    return 'Neither';
  }

  return value
    .split('-')
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(' ');
}

function explainScenario(scenario: TrialBalanceErrorScenario) {
  if (scenario.archetypeId === 'transposition') {
    return `${scenario.narrative} The digit swap follows 10a + b vs 10b + a, so the difference is 9|a - b|.`;
  }

  return scenario.narrative;
}

function buildScenarioParts(scenario: TrialBalanceErrorScenario): TrialBalanceErrorPart[] {
  return [
    {
      id: `${scenario.rowId}:balanced`,
      kind: 'selection',
      label: `${scenario.rowLabel} balanced?`,
      description: scenario.whatHappened,
      prompt: `Will ${scenario.rowLabel} still balance?`,
      expectedAnswerShape: 'selection',
      canonicalAnswer: scenario.expectedBalanced,
      explanation: scenario.whatToDecideFirst,
      misconceptionTags: scenario.misconceptionTags,
      standardCode: 'ACC-M7-TB-G',
      artifactTarget: 'balanced',
      targetId: scenario.expectedBalanced,
      details: {
        scenarioId: scenario.id,
        rowId: scenario.rowId,
        answerKind: 'balanced',
        explanation: scenario.narrative,
        errorType: scenario.archetypeId,
        expectedBalanced: scenario.expectedBalanced,
        expectedDifference: scenario.expectedDifference,
        expectedLargerColumn: scenario.expectedLargerColumn,
        misconceptionTags: scenario.misconceptionTags,
      },
    },
    {
      id: `${scenario.rowId}:difference`,
      kind: 'numeric',
      label: `${scenario.rowLabel} difference`,
      description: scenario.whatHappened,
      prompt: `What is the difference for ${scenario.rowLabel}?`,
      expectedAnswerShape: 'numeric',
      canonicalAnswer: scenario.expectedDifference,
      explanation: scenario.narrative,
      misconceptionTags: scenario.misconceptionTags,
      standardCode: 'ACC-M7-TB-G',
      artifactTarget: 'difference',
      targetId: scenario.expectedDifference,
      details: {
        scenarioId: scenario.id,
        rowId: scenario.rowId,
        answerKind: 'difference',
        explanation: scenario.narrative,
        errorType: scenario.archetypeId,
        expectedBalanced: scenario.expectedBalanced,
        expectedDifference: scenario.expectedDifference,
        expectedLargerColumn: scenario.expectedLargerColumn,
        misconceptionTags: scenario.misconceptionTags,
      },
    },
    {
      id: `${scenario.rowId}:larger-column`,
      kind: 'selection',
      label: `${scenario.rowLabel} larger column`,
      description: scenario.whatHappened,
      prompt: `Which column is larger for ${scenario.rowLabel}?`,
      expectedAnswerShape: 'selection',
      canonicalAnswer: scenario.expectedLargerColumn,
      explanation: scenario.narrative,
      misconceptionTags: scenario.misconceptionTags,
      standardCode: 'ACC-M7-TB-G',
      artifactTarget: 'larger-column',
      targetId: scenario.expectedLargerColumn,
      details: {
        scenarioId: scenario.id,
        rowId: scenario.rowId,
        answerKind: 'larger-column',
        explanation: scenario.narrative,
        errorType: scenario.archetypeId,
        expectedBalanced: scenario.expectedBalanced,
        expectedDifference: scenario.expectedDifference,
        expectedLargerColumn: scenario.expectedLargerColumn,
        misconceptionTags: scenario.misconceptionTags,
      },
    },
  ];
}

function buildResponse(definition: TrialBalanceErrorDefinition): TrialBalanceErrorResponse {
  return Object.fromEntries(
    definition.scenarios.flatMap((scenario) => [
      [`${scenario.rowId}:balanced`, scenario.expectedBalanced],
      [`${scenario.rowId}:difference`, scenario.expectedDifference],
      [`${scenario.rowId}:larger-column`, scenario.expectedLargerColumn],
    ]),
  ) as TrialBalanceErrorResponse;
}

function getScenarioMisconceptionTags(scenario: TrialBalanceErrorScenario, answerKind: TrialBalanceErrorPart['details']['answerKind']) {
  const baseTags = new Set(scenario.misconceptionTags);

  if (answerKind === 'balanced' && scenario.archetypeId === 'both-sides-wrong') {
    baseTags.add('both-sides-wrong-balances');
  }

  if (answerKind === 'difference' && scenario.archetypeId === 'transposition') {
    baseTags.add('transposition-vs-slide');
  }

  if (answerKind === 'larger-column' && scenario.archetypeId === 'omission') {
    baseTags.add('omission-always-debit-heavy');
  }

  return Array.from(baseTags);
}

function buildPartFeedback(
  part: TrialBalanceErrorPart,
  scenario: TrialBalanceErrorScenario,
  studentResponse: TrialBalanceErrorResponse,
  gradeResultPart: GradeResult['parts'][number],
): TrialBalanceErrorReviewFeedback {
  const selectedValue = studentResponse[part.id];
  const selectedLabel = formatSelectionValue(selectedValue);
  const expectedLabel =
    part.details.answerKind === 'balanced'
      ? formatTrialBalanceBalanceAnswer(part.targetId as TrialBalanceBalanceAnswer)
      : part.details.answerKind === 'difference'
        ? formatTrialBalanceDifference(Number(part.targetId))
        : formatTrialBalanceLargerColumn(part.targetId as TrialBalanceLargerColumn);

  const answerKind = part.details.answerKind;
  const message = gradeResultPart.isCorrect
    ? answerKind === 'balanced'
      ? scenario.balance.balanced
        ? `${scenario.rowLabel} still balances.`
        : `${scenario.rowLabel} is out of balance by ${formatTrialBalanceDifference(scenario.expectedDifference)}.`
      : answerKind === 'difference'
        ? `The difference is ${formatTrialBalanceDifference(scenario.expectedDifference)}.`
        : `${formatTrialBalanceLargerColumn(scenario.expectedLargerColumn)} is larger.`
    : answerKind === 'balanced'
      ? `This scenario ${scenario.balance.balanced ? 'still balances' : 'is out of balance'} because ${explainScenario(scenario).toLowerCase()}.`
      : answerKind === 'difference'
        ? `The difference is ${formatTrialBalanceDifference(scenario.expectedDifference)} because ${explainScenario(scenario).toLowerCase()}.`
        : `${formatTrialBalanceLargerColumn(scenario.expectedLargerColumn)} is larger because ${explainScenario(scenario).toLowerCase()}.`;

  return {
    status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.isCorrect ? [] : getScenarioMisconceptionTags(scenario, answerKind),
    message,
  };
}

export function buildTrialBalanceErrorReviewFeedback(
  definition: TrialBalanceErrorDefinition,
  studentResponse: TrialBalanceErrorResponse,
  gradeResult: GradeResult,
): Record<string, TrialBalanceErrorReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((gradeResultPart) => {
      const part = definition.parts.find((entry) => entry.id === gradeResultPart.partId);
      const rowId = gradeResultPart.partId.split(':')[0];
      const scenario = definition.scenarios.find((entry) => entry.rowId === rowId);

      if (!part || !scenario) {
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

      return [part.id, buildPartFeedback(part, scenario, studentResponse, gradeResultPart)] as const;
    }),
  );
}

export function buildTrialBalanceErrorScenarioReviewFeedback(
  definition: TrialBalanceErrorDefinition,
  studentResponse: TrialBalanceErrorResponse,
  gradeResult: GradeResult,
): Record<string, TrialBalanceErrorScenarioReviewFeedback> {
  return Object.fromEntries(
    definition.scenarios.map((scenario) => {
      const partIds = [`${scenario.rowId}:balanced`, `${scenario.rowId}:difference`, `${scenario.rowId}:larger-column`];
      const parts = partIds
        .map((partId) => gradeResult.parts.find((part) => part.partId === partId))
        .filter((part): part is NonNullable<typeof part> => !!part);
      const selectedSummary = partIds
        .map((partId) => {
          const part = definition.parts.find((entry) => entry.id === partId);
          const selected = studentResponse[partId];
          if (!part) {
            return null;
          }

          return `${formatPartLabel(part.details.answerKind)}: ${formatSelectionValue(selected)}`;
        })
        .filter((entry): entry is string => !!entry)
        .join(' · ');
      const expectedSummary = partIds
        .map((partId) => {
          const part = definition.parts.find((entry) => entry.id === partId);
          if (!part) {
            return null;
          }

          const expected =
            part.details.answerKind === 'balanced'
              ? formatTrialBalanceBalanceAnswer(part.targetId as TrialBalanceBalanceAnswer)
              : part.details.answerKind === 'difference'
                ? formatTrialBalanceDifference(Number(part.targetId))
                : formatTrialBalanceLargerColumn(part.targetId as TrialBalanceLargerColumn);
          return `${formatPartLabel(part.details.answerKind)}: ${expected}`;
        })
        .filter((entry): entry is string => !!entry)
        .join(' · ');
      const score = parts.reduce((sum, part) => sum + part.score, 0);
      const maxScore = parts.reduce((sum, part) => sum + part.maxScore, 0);
      const misconceptionTags = Array.from(new Set(parts.flatMap((part) => part.misconceptionTags)));
      const firstIncorrectPart = partIds
        .map((partId) => gradeResult.parts.find((part) => part.partId === partId))
        .find((part) => part && !part.isCorrect);
      const firstIncorrectDefinition = firstIncorrectPart
        ? definition.parts.find((part) => part.id === firstIncorrectPart.partId)
        : undefined;
      const selectedScenario = definition.scenarios.find((entry) => entry.rowId === scenario.rowId) ?? scenario;

      return [
        scenario.rowId,
        {
          status: score === maxScore ? 'correct' : score === 0 ? 'incorrect' : 'partial',
          scoreLabel: `${score}/${maxScore}`,
          selectedLabel: selectedSummary,
          expectedLabel: expectedSummary,
          misconceptionTags,
          message: firstIncorrectDefinition
            ? `${firstIncorrectDefinition.label}: ${selectedScenario.narrative}`
            : `${scenario.rowLabel} is correct.`,
        },
      ] as const;
    }),
  );
}

export const trialBalanceErrorFamily: ProblemFamily<
  TrialBalanceErrorDefinition,
  TrialBalanceErrorResponse,
  TrialBalanceErrorConfig
> = {
  generate(seed, config = {}) {
    const scenarios = generateTrialBalanceErrorScenarios(seed, {
      scenarioCount: config.scenarioCount,
      amountRange: config.amountRange,
      includeBalancedScenarios: config.includeBalancedScenarios,
      errorTypeWeights: config.errorTypeWeights,
    });
    const rows = scenarios.map((scenario) => ({
      id: scenario.rowId,
      label: scenario.rowLabel,
      description: scenario.narrative,
      hint: scenario.whatToDecideFirst,
    }));
    const columns: TrialBalanceErrorColumn[] = [
      { id: 'balanced', label: 'Balanced?', description: 'Will the trial balance still balance?' },
      { id: 'difference', label: 'Difference', description: 'Difference amount in dollars' },
      { id: 'larger-column', label: 'Larger column', description: 'Which column is larger?' },
    ];
    const parts = scenarios.flatMap((scenario) => buildScenarioParts(scenario));

    return {
      contractVersion: 'practice.v1',
      familyKey: 'trial-balance-errors',
      mode: config.mode ?? 'guided_practice',
      activityId: `trial-balance-errors-${seed}`,
      prompt: {
        title: 'Trial Balance Error Analysis',
        stem: 'For each scenario, decide whether the trial balance still balances, the amount of the difference, and which column is larger.',
      },
      scenarios,
      rows,
      columns,
      parts,
      workedExample:
        scenarios[0]
          ? {
              scenarioId: scenarios[0].id,
              rowId: scenarios[0].rowId,
              narrative: scenarios[0].narrative,
              balanced: scenarios[0].expectedBalanced,
              difference: scenarios[0].expectedDifference,
              largerColumn: scenarios[0].expectedLargerColumn,
            }
          : undefined,
      scaffolding: {
        showScenarioBrief: true,
        showDecisionSequence: true,
        includeBalancedScenarios: config.includeBalancedScenarios ?? true,
        scenarioCount: scenarios.length,
      },
      grading: {
        strategy: 'rubric',
        partialCredit: true,
        rubric: {
          balanced: 1,
          difference: 1,
          largerColumn: 1,
        },
      },
      analyticsConfig: {
        generator: 'trial-balance-error-family',
        seed,
        scenarioCount: scenarios.length,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part) => {
      const rawAnswer = studentResponse[part.id];
      let normalizedAnswer: string;
      let isCorrect = false;

      if (part.kind === 'numeric') {
        const numericAnswer = typeof rawAnswer === 'number' ? rawAnswer : Number(String(rawAnswer).replace(/[^0-9.-]/g, ''));
        normalizedAnswer = Number.isFinite(numericAnswer) ? String(numericAnswer) : '';
        isCorrect = Number.isFinite(numericAnswer) && numericAnswer === Number(part.targetId);
      } else {
        normalizedAnswer = normalizePracticeValue(rawAnswer);
        isCorrect = normalizedAnswer === normalizePracticeValue(part.targetId);
      }

      return {
        partId: part.id,
        rawAnswer,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect ? [] : getScenarioMisconceptionTags(
          definition.scenarios.find((scenario) => scenario.rowId === part.details.rowId) ?? definition.scenarios[0],
          part.details.answerKind,
        ),
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} trial balance decisions correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'trial-balance-error-analysis',
      family: definition.familyKey,
      scenarios: definition.scenarios.map((scenario) => {
        const scenarioParts = gradeResult.parts.filter((part) => part.partId.startsWith(`${scenario.rowId}:`));
        return {
          id: scenario.id,
          rowId: scenario.rowId,
          rowLabel: scenario.rowLabel,
          archetypeId: scenario.archetypeId,
          archetypeLabel: scenario.archetypeLabel,
          narrative: scenario.narrative,
          correctEntry: scenario.correctEntry,
          errorSide: scenario.errorSide,
          correctAmount: scenario.correctAmount,
          erroneousAmount: scenario.erroneousAmount,
          balance: scenario.balance,
          expectedBalanced: scenario.expectedBalanced,
          expectedDifference: scenario.expectedDifference,
          expectedLargerColumn: scenario.expectedLargerColumn,
          selectedAnswers: {
            balanced: studentResponse[`${scenario.rowId}:balanced`],
            difference: studentResponse[`${scenario.rowId}:difference`],
            largerColumn: studentResponse[`${scenario.rowId}:larger-column`],
          },
          isCorrect: scenarioParts.every((part) => part.isCorrect),
          misconceptionTags: Array.from(new Set(scenarioParts.flatMap((part) => part.misconceptionTags))),
        };
      }),
      summary: {
        score: gradeResult.score,
        maxScore: gradeResult.maxScore,
        balancedCount: definition.scenarios.filter((scenario) => scenario.balance.balanced).length,
      },
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
        scenarioCount: definition.scenarios.length,
        balancedCount: definition.scenarios.filter((scenario) => scenario.balance.balanced).length,
      },
      teacherSummary: gradeResult.feedback,
    });
  },
};
