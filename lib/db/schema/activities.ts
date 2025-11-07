import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

const matchingItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  matchId: z.string(),
  category: z.string().optional(),
  hint: z.string().optional(),
  description: z.string().optional()
});

const accountCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  whyItMatters: z.string().optional()
});

const accountItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  realWorldExample: z.string().optional(),
  hint: z.string().optional()
});

const impactLevelSchema = z.enum(['low', 'medium', 'high']);

const budgetCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  profitImpact: z.string().optional(),
  strategyNote: z.string().optional()
});

const budgetExpenseSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  categoryId: z.string(),
  cafeContext: z.string().optional(),
  amount: z.number().nonnegative(),
  impact: impactLevelSchema.default('medium')
});

const percentageCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  formula: z.string(),
  applications: z.array(z.string()).optional()
});

const percentageScenarioSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  description: z.string(),
  calculationTypeId: z.string(),
  dataPoints: z.string(),
  businessContext: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  formula: z.string().optional()
});

const inventoryLotSchema = z.object({
  id: z.string(),
  label: z.string(),
  purchaseDate: z.string(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
  notes: z.string().optional()
});

const inventoryFlowModeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  targetOrder: z.array(z.string()).min(1)
});

const inventoryScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  context: z.string().optional(),
  salesQuantity: z.number().int().positive(),
  lots: z.array(inventoryLotSchema).min(1),
  flowModes: z.array(inventoryFlowModeSchema).min(1)
});

const ratioDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  businessMeaning: z.string().optional(),
  goodRange: z.string().optional(),
  whyItMatters: z.string().optional(),
  formulaSummary: z.string()
});

const ratioFormulaZoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  formula: z.string(),
  category: z.string(),
  emoji: z.string().optional(),
  expectedRatioId: z.string()
});

const blankSentenceSchema = z.object({
  id: z.string(),
  text: z.string(),
  answer: z.string(),
  hint: z.string().optional(),
  alternativeAnswers: z.array(z.string()).optional(),
  category: z.string().optional()
});

const journalEntryLineSchema = z.object({
  account: z.string(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0)
}).refine((entry) => !(entry.debit > 0 && entry.credit > 0), {
  message: 'Debit and credit cannot both be greater than zero'
});

const journalScenarioSchema = z.object({
  id: z.string(),
  description: z.string(),
  correctEntry: z.array(journalEntryLineSchema).min(2),
  explanation: z.string()
});

const reflectionPromptSchema = z.object({
  id: z.string(),
  category: z.enum(['courage', 'adaptability', 'persistence']).default('courage'),
  prompt: z.string(),
  placeholder: z.string().optional()
});

const peerCritiqueCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  placeholder: z.string().optional(),
  ratingLabel: z.string().optional()
});

const breakEvenCategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  behavior: z.enum(['fixed', 'variable']),
  whyItMatters: z.string().optional()
});

const breakEvenCostItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number().nonnegative(),
  unit: z.string().default('per unit'),
  categoryId: z.string(),
  description: z.string().optional(),
  realWorldExample: z.string().optional()
});

const salesAssumptionSchema = z.object({
  pricePerUnit: z.number().positive(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  step: z.number().positive().optional(),
  unitLabel: z.string().default('units'),
  targetUnits: z.number().int().positive().optional()
});

const cashFlowPeriodSchema = z.object({
  id: z.string(),
  label: z.string(),
  order: z.number().int(),
  description: z.string().optional(),
  highlightThreshold: z.number().optional()
});

const cashFlowItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  direction: z.enum(['inflow', 'outflow']),
  periodId: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  hint: z.string().optional()
});

const financialStatementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  focus: z.string().optional(),
  icon: z.string().optional(),
  howItHelps: z.string().optional()
});

const financialStatementItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  statementId: z.string(),
  category: z.string(),
  hint: z.string().optional()
});

const trialBalanceSideSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  type: z.enum(['debit', 'credit']),
  badgeLabel: z.string().optional()
});

const trialBalanceAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nonnegative(),
  sideId: z.string(),
  category: z.string(),
  context: z.string().optional()
});

export const activityPropsSchemas = {
  'comprehension-quiz': z.object({
    title: z.string().default('Comprehension Check'),
    description: z.string().default('Test your understanding of the lesson.'),
    showExplanations: z.boolean().default(true),
    allowRetry: z.boolean().default(true),
    questions: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        type: z.enum(['multiple-choice', 'true-false', 'short-answer']),
        options: z.array(z.string()).optional(),
        correctAnswer: z.union([z.string(), z.array(z.string())]),
        explanation: z.string().optional(),
      }),
    ).min(1),
  }),
  'drag-and-drop': z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(matchingItemSchema).min(2),
    leftColumnTitle: z.string().default('Items'),
    rightColumnTitle: z.string().default('Matches'),
    showHints: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'account-categorization': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(accountCategorySchema).min(1),
    accounts: z.array(accountItemSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'budget-category-sort': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(budgetCategorySchema).min(1),
    expenses: z.array(budgetExpenseSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'percentage-calculation-sorting': z.object({
    title: z.string(),
    description: z.string(),
    calculationTypes: z.array(percentageCategorySchema).min(1),
    scenarios: z.array(percentageScenarioSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'inventory-flow-diagram': z.object({
    title: z.string(),
    description: z.string(),
    scenarios: z.array(inventoryScenarioSchema).min(1)
  }),
  'ratio-matching': z.object({
    title: z.string(),
    description: z.string(),
    ratios: z.array(ratioDefinitionSchema).min(1),
    formulaZones: z.array(ratioFormulaZoneSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'break-even-components': z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(breakEvenCategorySchema).min(1),
    costItems: z.array(breakEvenCostItemSchema).min(1),
    salesAssumptions: salesAssumptionSchema,
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'cash-flow-timeline': z.object({
    title: z.string(),
    description: z.string(),
    periods: z.array(cashFlowPeriodSchema).min(1),
    cashFlowItems: z.array(cashFlowItemSchema).min(1),
    startingCash: z.number().default(0),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'financial-statement-matching': z.object({
    title: z.string(),
    description: z.string(),
    statements: z.array(financialStatementSchema).min(1),
    lineItems: z.array(financialStatementItemSchema).min(1),
    showHintsByDefault: z.boolean().default(false),
    shuffleItems: z.boolean().default(true)
  }),
  'trial-balance-sorting': z.object({
    title: z.string(),
    description: z.string(),
    sides: z.array(trialBalanceSideSchema).min(2),
    accounts: z.array(trialBalanceAccountSchema).min(1),
    showCategoryBadges: z.boolean().default(true),
    shuffleItems: z.boolean().default(true)
  }),
  'fill-in-the-blank': z.object({
    title: z.string(),
    description: z.string(),
    sentences: z.array(blankSentenceSchema).min(1),
    showWordList: z.boolean().default(true),
    randomizeWordOrder: z.boolean().default(true),
    showHints: z.boolean().default(false)
  }),
  'journal-entry-building': z.object({
    title: z.string().default('Journal Entry Builder'),
    description: z.string().default('Practice building balanced journal entries.'),
    availableAccounts: z.array(z.string()).default([]),
    scenarios: z.array(journalScenarioSchema).min(1),
    showInstructionsDefaultOpen: z.boolean().default(false)
  }),
  'reflection-journal': z.object({
    unitTitle: z.string().default('Learning Reflection'),
    prompts: z.array(reflectionPromptSchema).min(1)
  }),
  'peer-critique-form': z.object({
    projectTitle: z.string().default('Project Presentation'),
    peerName: z.string().default('Peer'),
    unitNumber: z.number().int().positive().optional(),
    reviewerNameLabel: z.string().optional(),
    categories: z.array(peerCritiqueCategorySchema).min(1),
    overallPrompt: z.string().optional()
  }),
  'profit-calculator': z.object({
    initialRevenue: z.number().optional(),
    initialExpenses: z.number().optional(),
    allowNegative: z.boolean().default(false),
    currency: z.string().default('USD'),
  }),
  'budget-worksheet': z.object({
    categories: z.array(z.string()),
    totalBudget: z.number(),
    constraints: z.record(z.string(), z.number()).optional(),
  }),
} as const;

export type ActivityComponentKey = keyof typeof activityPropsSchemas;

export type ActivityProps = {
  [K in ActivityComponentKey]: z.infer<(typeof activityPropsSchemas)[K]>;
}[ActivityComponentKey];

export type ComprehensionQuizActivityProps = z.infer<typeof activityPropsSchemas['comprehension-quiz']>;
export type DragAndDropActivityProps = z.infer<typeof activityPropsSchemas['drag-and-drop']>;
export type AccountCategorizationActivityProps = z.infer<typeof activityPropsSchemas['account-categorization']>;
export type BudgetCategorySortActivityProps = z.infer<typeof activityPropsSchemas['budget-category-sort']>;
export type PercentageCalculationSortingActivityProps = z.infer<typeof activityPropsSchemas['percentage-calculation-sorting']>;
export type InventoryFlowDiagramActivityProps = z.infer<typeof activityPropsSchemas['inventory-flow-diagram']>;
export type RatioMatchingActivityProps = z.infer<typeof activityPropsSchemas['ratio-matching']>;
export type BreakEvenComponentsActivityProps = z.infer<typeof activityPropsSchemas['break-even-components']>;
export type CashFlowTimelineActivityProps = z.infer<typeof activityPropsSchemas['cash-flow-timeline']>;
export type FinancialStatementMatchingActivityProps = z.infer<typeof activityPropsSchemas['financial-statement-matching']>;
export type TrialBalanceSortingActivityProps = z.infer<typeof activityPropsSchemas['trial-balance-sorting']>;
export type FillInTheBlankActivityProps = z.infer<typeof activityPropsSchemas['fill-in-the-blank']>;
export type JournalEntryActivityProps = z.infer<typeof activityPropsSchemas['journal-entry-building']>;
export type ReflectionJournalActivityProps = z.infer<typeof activityPropsSchemas['reflection-journal']>;
export type PeerCritiqueActivityProps = z.infer<typeof activityPropsSchemas['peer-critique-form']>;

export const gradingConfigSchema = z.object({
  autoGrade: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).optional(),
  partialCredit: z.boolean().default(false),
  rubric: z
    .array(
      z.object({
        criteria: z.string(),
        points: z.number(),
      }),
    )
    .optional(),
});

export type GradingConfig = z.infer<typeof gradingConfigSchema>;

export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentKey: text('component_key').$type<ActivityComponentKey>().notNull(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  props: jsonb('props').$type<ActivityProps>().notNull(),
  gradingConfig: jsonb('grading_config').$type<GradingConfig | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
