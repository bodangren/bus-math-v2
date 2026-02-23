import { z } from 'zod';

const parameterDefSchema = z
  .object({
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
  })
  .refine((parameter) => parameter.max >= parameter.min, {
    message: 'max must be greater than or equal to min',
  });

export const problemTemplateSchema = z.object({
  parameters: z.record(z.string(), parameterDefSchema).refine(
    (parameters) => Object.keys(parameters).length > 0,
    'parameters must include at least one variable',
  ),
  answerFormula: z.string().min(1),
  questionTemplate: z.string().min(1),
  tolerance: z.number().nonnegative().default(1),
});

export const cellValueExpectationSchema = z.object({
  cellRef: z.string().regex(/^[A-Z]+[0-9]+$/, 'cellRef must be A1-style cell reference'),
  expectedFormula: z.string().min(1),
  tolerance: z.number().nonnegative().default(1),
  expectedValue: z.union([z.number(), z.string()]).optional(),
});

export const spreadsheetProblemTemplateSchema = problemTemplateSchema.extend({
  cellExpectations: z.array(cellValueExpectationSchema).min(1),
});

export type ParameterDef = z.infer<typeof parameterDefSchema>;
export type ProblemTemplate = z.infer<typeof problemTemplateSchema>;
export type CellValueExpectation = z.infer<typeof cellValueExpectationSchema>;
export type SpreadsheetProblemTemplate = z.infer<typeof spreadsheetProblemTemplateSchema>;

export function parseProblemTemplate(input: unknown): ProblemTemplate {
  return problemTemplateSchema.parse(input);
}

export function parseSpreadsheetProblemTemplate(input: unknown): SpreadsheetProblemTemplate {
  return spreadsheetProblemTemplateSchema.parse(input);
}
