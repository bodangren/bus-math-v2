import { z } from 'zod';

const matchingItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  matchId: z.string(),
  category: z.string().optional(),
  hint: z.string().optional(),
  description: z.string().optional(),
});

const accountCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  whyItMatters: z.string().optional(),
});

const accountItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  realWorldExample: z.string().optional(),
  hint: z.string().optional(),
});

const impactLevelSchema = z.enum(['low', 'medium', 'high']);

const budgetCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  profitImpact: z.string().optional(),
  strategyNote: z.string().optional(),
});

const budgetExpenseSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  categoryId: z.string(),
  cafeContext: z.string().optional(),
  amount: z.number().nonnegative(),
  impact: impactLevelSchema.default('medium'),
});

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

const ratioDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  businessMeaning: z.string().optional(),
  goodRange: z.string().optional(),
  whyItMatters: z.string().optional(),
  formulaSummary: z.string(),
});

const ratioFormulaZoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  formula: z.string(),
  category: z.string(),
  emoji: z.string().optional(),
  expectedRatioId: z.string(),
});

const breakEvenCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  behavior: z.enum(['fixed', 'variable']),
  whyItMatters: z.string().optional(),
});

const breakEvenCostItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number().nonnegative(),
  unit: z.string().default('per unit'),
  categoryId: z.string(),
  description: z.string().optional(),
  realWorldExample: z.string().optional(),
});

const salesAssumptionSchema = z.object({
  pricePerUnit: z.number().positive(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  step: z.number().positive().optional(),
  unitLabel: z.string().default('units'),
  targetUnits: z.number().int().positive().optional(),
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

const financialStatementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  focus: z.string().optional(),
  icon: z.string().optional(),
  howItHelps: z.string().optional(),
});

const financialStatementItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  statementId: z.string(),
  category: z.string(),
  hint: z.string().optional(),
});

const trialBalanceSideSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  type: z.enum(['debit', 'credit']),
  badgeLabel: z.string().optional(),
});

const trialBalanceAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nonnegative(),
  sideId: z.string(),
  category: z.string(),
  context: z.string().optional(),
});

export const categorizationActivityPropsSchemas = {
  'drag-and-drop': z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(matchingItemSchema).min(2),
    leftColumnTitle: z.string().default('Items'),
    rightColumnTitle: z.string().default('Matches'),
    showHints: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
  'account-categorization': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(accountCategorySchema).min(1),
    accounts: z.array(accountItemSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
  'budget-category-sort': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(budgetCategorySchema).min(1),
    expenses: z.array(budgetExpenseSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
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
  'ratio-matching': z.object({
    title: z.string(),
    description: z.string(),
    ratios: z.array(ratioDefinitionSchema).min(1),
    formulaZones: z.array(ratioFormulaZoneSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
  'break-even-components': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(breakEvenCategorySchema).min(1),
    costItems: z.array(breakEvenCostItemSchema).min(1),
    salesAssumptions: salesAssumptionSchema,
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
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
  'financial-statement-matching': z.object({
    title: z.string(),
    description: z.string(),
    statements: z.array(financialStatementSchema).min(1),
    lineItems: z.array(financialStatementItemSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
  }),
  'trial-balance-sorting': z.object({
    title: z.string(),
    description: z.string(),
    sides: z.array(trialBalanceSideSchema).min(2),
    accounts: z.array(trialBalanceAccountSchema).min(1),
    showCategoryBadges: z.boolean().default(true),
    shuffleItems: z.boolean().default(true),
  }),
} as const;
