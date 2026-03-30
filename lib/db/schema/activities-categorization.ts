import { z } from 'zod';

const percentageCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  formula: z.string(),
  applications: z.array(z.string()).optional(),
});

const percentageScenarioSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  description: z.string(),
  calculationTypeId: z.string(),
  dataPoints: z.string(),
  businessContext: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  formula: z.string().optional(),
});

const inventoryLotSchema = z.object({
  id: z.string(),
  label: z.string(),
  purchaseDate: z.string(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
  notes: z.string().optional(),
});

const inventoryFlowModeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  targetOrder: z.array(z.string()).min(1),
});

const inventoryScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  context: z.string().optional(),
  salesQuantity: z.number().int().positive(),
  lots: z.array(inventoryLotSchema).min(1),
  flowModes: z.array(inventoryFlowModeSchema).min(1),
});

const cashFlowPeriodSchema = z.object({
  id: z.string(),
  label: z.string(),
  order: z.number().int(),
  description: z.string().optional(),
  highlightThreshold: z.number().optional(),
});

const cashFlowItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  direction: z.enum(['inflow', 'outflow']),
  periodId: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  hint: z.string().optional(),
});

export const categorizationActivityPropsSchemas = {
  'percentage-calculation-sorting': z.object({
    title: z.string(),
    description: z.string(),
    calculationTypes: z.array(percentageCategorySchema).min(1),
    scenarios: z.array(percentageScenarioSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
  'inventory-flow-diagram': z.object({
    title: z.string(),
    description: z.string(),
    scenarios: z.array(inventoryScenarioSchema).min(1),
  }),
  'cash-flow-timeline': z.object({
    title: z.string(),
    description: z.string(),
    periods: z.array(cashFlowPeriodSchema).min(1),
    cashFlowItems: z.array(cashFlowItemSchema).min(1),
    startingCash: z.number().default(0),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
} as const;
