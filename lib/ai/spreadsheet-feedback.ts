import type { SpreadsheetData } from '@/components/activities/spreadsheet';
import type { ValidationResult, TargetCell } from '@/lib/activities/spreadsheet-validation';
import { resolveOpenRouterProviderFromEnv } from '@/lib/ai/providers';
import { z } from 'zod';

const AiFeedbackResponseSchema = z.object({
  preliminaryScore: z.number(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export interface AiFeedback {
  preliminaryScore: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  rawAiResponse: string;
}

export interface GenerateAiFeedbackOptions {
  spreadsheetData: SpreadsheetData;
  validationResult: ValidationResult;
  targetCells: TargetCell[];
  activityName?: string;
}

function formatTargetCells(targetCells: TargetCell[]): string {
  return targetCells.map(cell => {
    let line = `- ${cell.cell}: Expected ${cell.expectedValue}`;
    if (cell.expectedFormula) {
      line += ` (Formula: ${cell.expectedFormula})`;
    }
    return line;
  }).join('\n');
}

function formatValidationResult(validationResult: ValidationResult): string {
  const correctCells = validationResult.feedback.filter(f => f.isCorrect).length;
  const totalCells = validationResult.totalCells;
  const cellDetails = validationResult.feedback.map(f => {
    if (f.isCorrect) {
      return `- ${f.cell}: Correct`;
    }
    return `- ${f.cell}: Incorrect (Expected "${f.expectedValue}", Got "${f.actualValue}")`;
  }).join('\n');

  return `Correct: ${correctCells}/${totalCells}\n\nCell Details:\n${cellDetails}`;
}

function buildFeedbackPrompt(options: GenerateAiFeedbackOptions): string {
  const { validationResult, targetCells, activityName } = options;

  return `You are a helpful business math teaching assistant. You will analyze a student's spreadsheet submission and provide targeted, constructive feedback.

## Activity
${activityName || 'Business Math Spreadsheet Activity'}

## Target Cells (Expected Values)
${formatTargetCells(targetCells)}

## Validation Result
${formatValidationResult(validationResult)}

## Instructions
1. Calculate a preliminary score on a 40-point scale, aligned with the percentage of correct cells.
2. Identify 2-3 specific strengths (what the student did well).
3. Identify 2-3 specific improvement areas (what the student should fix, referencing actual cell errors).
4. Provide 2-3 clear next steps for revision.
5. Always clearly label this as AI preliminary feedback, not final teacher grading.
6. Reference specific cells and values in your feedback.
7. Keep feedback concise and actionable.

## Response Format (JSON only, no other text)
{
  "preliminaryScore": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "nextSteps": ["string", "string"]
}

Respond only with the JSON object, no other text.`;
}

export async function generateAiFeedback(options: GenerateAiFeedbackOptions): Promise<AiFeedback> {
  const provider = resolveOpenRouterProviderFromEnv();

  if (!provider) {
    const correctRatio = options.validationResult.correctCells / Math.max(1, options.validationResult.totalCells);
    const preliminaryScore = Math.round(correctRatio * 40);

    return {
      preliminaryScore,
      strengths: ['Completed the spreadsheet submission'],
      improvements: ['Review your work for possible errors'],
      nextSteps: ['Ask your teacher for feedback'],
      rawAiResponse: 'AI provider not configured; using deterministic feedback only',
    };
  }

  const prompt = buildFeedbackPrompt(options);
  const rawResponse = await provider(prompt);

  try {
    const parsed = JSON.parse(rawResponse);
    const validated = AiFeedbackResponseSchema.safeParse(parsed);

    if (!validated.success) {
      const correctRatio = options.validationResult.correctCells / Math.max(1, options.validationResult.totalCells);
      const preliminaryScore = Math.round(correctRatio * 40);

      return {
        preliminaryScore,
        strengths: ['Completed the spreadsheet submission'],
        improvements: ['Review your work for possible errors'],
        nextSteps: ['Ask your teacher for feedback'],
        rawAiResponse: rawResponse,
      };
    }

    const clampedScore = Math.round(Math.max(0, Math.min(40, validated.data.preliminaryScore)));

    return {
      preliminaryScore: clampedScore,
      strengths: validated.data.strengths.slice(0, 3),
      improvements: validated.data.improvements.slice(0, 3),
      nextSteps: validated.data.nextSteps.slice(0, 3),
      rawAiResponse: rawResponse,
    };
  } catch {
    const correctRatio = options.validationResult.correctCells / Math.max(1, options.validationResult.totalCells);
    const preliminaryScore = Math.round(correctRatio * 40);

    return {
      preliminaryScore,
      strengths: ['Completed the spreadsheet submission'],
      improvements: ['Review your work for possible errors'],
      nextSteps: ['Ask your teacher for feedback'],
      rawAiResponse: rawResponse,
    };
  }
}
