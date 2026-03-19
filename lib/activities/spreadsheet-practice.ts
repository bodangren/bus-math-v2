import { buildPracticeSubmissionEnvelope, normalizePracticeValue, type PracticeSubmissionPart } from '@/lib/practice/contract';
import { getCellValue, type TargetCell, type ValidationResult } from '@/lib/activities/spreadsheet-validation';
import type { SpreadsheetData } from '@/components/activities/spreadsheet/SpreadsheetWrapper';

export type SpreadsheetPracticeMode = 'assessment' | 'guided_practice' | 'independent_practice';

export interface SpreadsheetEvaluatorEnvelopeInput {
  activityId: string;
  templateId: string;
  instructions: string;
  targetCells: TargetCell[];
  spreadsheetData: SpreadsheetData;
  validationResult: ValidationResult;
  attemptNumber?: number;
  submittedAt?: string | Date;
  mode?: SpreadsheetPracticeMode;
}

export function buildSpreadsheetEvaluatorSubmission(input: SpreadsheetEvaluatorEnvelopeInput) {
  const answers = Object.fromEntries(
    input.targetCells.map((target) => [target.cell, getCellValue(input.spreadsheetData, target.cell)]),
  );

  const feedbackByCell = new Map(
    input.validationResult.feedback.map((entry) => [entry.cell, entry] as const),
  );

  const parts: PracticeSubmissionPart[] = input.targetCells.map((target) => {
    const rawAnswer = getCellValue(input.spreadsheetData, target.cell);
    const feedback = feedbackByCell.get(target.cell);
    const isCorrect = feedback?.isCorrect ?? false;

    return {
      partId: target.cell,
      rawAnswer,
      normalizedAnswer: normalizePracticeValue(rawAnswer),
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
    };
  });

  return buildPracticeSubmissionEnvelope({
    activityId: input.activityId,
    mode: input.mode ?? 'assessment',
    status: 'submitted',
    attemptNumber: input.attemptNumber ?? 1,
    submittedAt: input.submittedAt ?? new Date(),
    answers,
    parts,
    artifact: {
      kind: 'spreadsheet_evaluator',
      templateId: input.templateId,
      instructions: input.instructions,
      targetCells: input.targetCells,
      spreadsheetData: input.spreadsheetData,
      validation: input.validationResult,
    },
    analytics: {
      totalCells: input.validationResult.totalCells,
      correctCells: input.validationResult.correctCells,
      isComplete: input.validationResult.isComplete,
    },
  });
}
