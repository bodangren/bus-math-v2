import { z } from 'zod';

const spreadsheetCellSchema = z.object({
  value: z.union([z.string(), z.number()]),
  readOnly: z.boolean().default(false),
  className: z.string().optional(),
});

const spreadsheetDataSchema = z.array(z.array(spreadsheetCellSchema));

const spreadsheetTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  data: spreadsheetDataSchema,
});

const spreadsheetActivitySchema = z.object({
  title: z.string().default('Spreadsheet Exercise'),
  description: z.string().default('Complete the spreadsheet exercise using the provided template.'),
  template: z.enum([
    't-account',
    'trial-balance',
    'income-statement',
    'statistical-analysis',
    'payroll',
    'break-even',
    'balance-sheet',
    'transaction-log',
    'custom',
  ]),
  customTemplate: spreadsheetTemplateSchema.optional(),
  initialData: spreadsheetDataSchema.optional(),
  allowFormulaEntry: z.boolean().default(true),
  showColumnLabels: z.boolean().default(true),
  showRowLabels: z.boolean().default(true),
  readOnly: z.boolean().default(false),
  validateFormulas: z.boolean().default(true),
});

export const spreadsheetActivityPropsSchemas = {
  spreadsheet: spreadsheetActivitySchema,
  'spreadsheet-evaluator': z.object({
    templateId: z.string(),
    instructions: z.string(),
    targetCells: z
      .array(
        z.object({
          cell: z.string().regex(/^[A-Z]+[0-9]+$/),
          expectedValue: z.union([z.string(), z.number()]),
          expectedFormula: z.string().optional(),
        }),
      )
      .min(1),
    initialData: z.array(z.array(z.any())).optional(),
  }),
} as const;
