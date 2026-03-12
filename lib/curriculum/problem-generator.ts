import {
  type CellValueExpectation,
  type SpreadsheetProblemTemplate,
  parseProblemTemplate,
} from './problem-template';
import { evaluateFormula } from './formula-evaluator';

type SeededRng = () => number;

export type GeneratedProblemInstance = {
  parameters: Record<string, number>;
  questionText: string;
  correctAnswer: number;
  cellExpectations?: Array<CellValueExpectation & { expectedValue: number | string }>;
};

let fallbackCounter = 0;

function createRng(seed: number): SeededRng {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let temp = state;
    temp = Math.imul(temp ^ (temp >>> 15), temp | 1);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveSeed(seed?: number): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.trunc(seed);
  }

  fallbackCounter += 1;
  return Date.now() + fallbackCounter;
}

function sampleParameterValue(
  min: number,
  max: number,
  step: number,
  rng: SeededRng,
): number {
  const totalSteps = Math.floor((max - min) / step);
  const offset = Math.floor(rng() * (totalSteps + 1));
  return min + offset * step;
}

function replaceTemplatePlaceholders(
  questionTemplate: string,
  parameters: Record<string, number>,
): string {
  return questionTemplate.replace(/{{\s*(\w+)\s*}}/g, (_, parameterName: string) => {
    if (!(parameterName in parameters)) {
      throw new Error(`Unknown placeholder parameter: ${parameterName}`);
    }

    return String(parameters[parameterName]);
  });
}

function withComputedCellExpectations(
  template: SpreadsheetProblemTemplate,
  parameters: Record<string, number>,
): Array<CellValueExpectation & { expectedValue: number | string }> {
  return template.cellExpectations.map((expectation) => {
    const expectedValue = evaluateFormula(expectation.expectedFormula, parameters);
    return {
      ...expectation,
      expectedValue,
    };
  });
}

export function generateProblemInstance(
  templateInput: unknown,
  seed?: number,
): GeneratedProblemInstance {
  const template = parseProblemTemplate(templateInput);
  const rng = createRng(resolveSeed(seed));

  const parameters: Record<string, number> = {};
  for (const [name, def] of Object.entries(template.parameters)) {
    parameters[name] = sampleParameterValue(def.min, def.max, def.step, rng);
  }

  const correctAnswer = evaluateFormula(template.answerFormula, parameters);
  const questionText = replaceTemplatePlaceholders(template.questionTemplate, parameters);

  const spreadsheetTemplate = templateInput as SpreadsheetProblemTemplate;
  const hasCellExpectations = Array.isArray(spreadsheetTemplate.cellExpectations);

  return {
    parameters,
    questionText,
    correctAnswer,
    ...(hasCellExpectations
      ? {
          cellExpectations: withComputedCellExpectations(spreadsheetTemplate, parameters),
        }
      : {}),
  };
}
