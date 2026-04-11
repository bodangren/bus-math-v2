import { v } from "convex/values";

export const spreadsheetCellValidator = v.object({
  value: v.union(v.string(), v.number()),
  readOnly: v.optional(v.boolean()),
  className: v.optional(v.string()),
});

export const spreadsheetDataValidator = v.array(v.array(spreadsheetCellValidator));

export const cellFeedbackValidator = v.object({
  cell: v.string(),
  isCorrect: v.boolean(),
  message: v.optional(v.string()),
  expectedValue: v.optional(v.union(v.string(), v.number())),
  actualValue: v.optional(v.union(v.string(), v.number())),
});

export const validationResultValidator = v.object({
  isComplete: v.boolean(),
  totalCells: v.number(),
  correctCells: v.number(),
  feedback: v.array(cellFeedbackValidator),
  timestamp: v.string(),
});
