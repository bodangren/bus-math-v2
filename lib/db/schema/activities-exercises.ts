import { z } from 'zod';

const assetPoolItemSchema = z.object({
  name: z.string(),
  costRange: z.tuple([z.number(), z.number()]),
  lifeRange: z.tuple([z.number(), z.number()]),
  salvageRange: z.tuple([z.number(), z.number()]),
});

const depreciationConfigSchema = z.object({
  title: z.string().default('Depreciation Practice'),
  description: z.string().default('Practice depreciation calculations using different methods.'),
  assetPool: z.array(assetPoolItemSchema).optional(),
  masteryThreshold: z.number().int().positive().default(5),
  tolerance: z.number().nonnegative().default(1),
});

const capitalizationItemSchema = z.object({
  name: z.string(),
  costRange: z.tuple([z.number(), z.number()]),
  lifeRange: z.tuple([z.number(), z.number()]),
  salvageRange: z.tuple([z.number(), z.number()]),
});

const capitalizationConfigSchema = z.object({
  title: z.string().default('Capitalization vs Expense'),
  description: z.string().default('Determine whether purchases should be capitalized or expensed.'),
  capitalItems: z.array(capitalizationItemSchema).optional(),
  expenseItems: z.array(z.object({ name: z.string(), costRange: z.tuple([z.number(), z.number()]) })).optional(),
  masteryThreshold: z.number().int().positive().default(5),
});

const markupMarginConfigSchema = z.object({
  title: z.string().default('Markup & Margin Mastery'),
  description: z.string().default('Practice calculating markup and margin percentages.'),
  masteryThreshold: z.number().int().positive().default(5),
  tolerance: z.number().nonnegative().default(0.5),
});

const breakEvenConfigSchema = z.object({
  title: z.string().default('Break-Even Analysis'),
  description: z.string().default('Practice contribution margin and break-even calculations.'),
  masteryThreshold: z.number().int().positive().default(5),
  tolerance: z.number().nonnegative().default(0.5),
});

const financialStatementConfigSchema = z.object({
  title: z.string().default('Financial Statement Practice'),
  description: z.string().default('Practice classifying and constructing financial statements.'),
  companyNames: z.array(z.string()).optional(),
  distractorPool: z.array(z.string()).optional(),
});

const closingEntryConfigSchema = z.object({
  title: z.string().default('Closing Entry Practice'),
  description: z.string().default('Practice preparing closing entries at period end.'),
  revenueAccounts: z.array(z.string()).optional(),
  expenseAccounts: z.array(z.string()).optional(),
});

const monthEndConfigSchema = z.object({
  title: z.string().default('Month-End Close'),
  description: z.string().default('Practice month-end adjusting and closing procedures.'),
});

const adjustmentConfigSchema = z.object({
  title: z.string().default('Adjustment Practice'),
  description: z.string().default('Practice identifying and recording adjusting entries.'),
  types: z.array(z.enum(['accrued-revenue', 'accrued-expense', 'deferred-revenue', 'deferred-expense', 'depreciation'])).optional(),
});

const scenarioSwitchConfigSchema = z.object({
  title: z.string().default('Scenario Switch Show & Tell'),
  description: z.string().default('Compare different business scenarios and explain tradeoffs.'),
  scenarios: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
        impact: z.string().optional(),
        tradeoff: z.string().optional(),
      }),
    )
    .optional(),
});

const errorCheckingConfigSchema = z.object({
  title: z.string().default('Error Checking System'),
  description: z.string().default('Practice identifying and correcting common data errors.'),
  validationCategories: z.array(z.string()).optional(),
});

const chartLinkingConfigSchema = z.object({
  title: z.string().default('Chart Linking Simulator'),
  description: z.string().default('Practice linking data across charts and reports.'),
});

const crossSheetLinkConfigSchema = z.object({
  title: z.string().default('Cross-Sheet Linking'),
  description: z.string().default('Practice creating references between spreadsheet sheets.'),
});

const methodComparisonConfigSchema = z.object({
  title: z.string().default('Method Comparison'),
  description: z.string().default('Compare different accounting methods side by side.'),
});

const inventoryAlgorithmConfigSchema = z.object({
  title: z.string().default('Inventory Costing Methods'),
  description: z.string().default('Walk through FIFO, LIFO, and weighted-average costing algorithms.'),
  methods: z.array(z.enum(['FIFO', 'LIFO', 'weighted-average'])).default(['FIFO', 'LIFO', 'weighted-average']),
});

export const exerciseActivityPropsSchemas = {
  // Cluster 1 — U5 Depreciation & Assets
  'straight-line-mastery': depreciationConfigSchema,
  'ddb-comparison-mastery': depreciationConfigSchema,
  'capitalization-expense-mastery': capitalizationConfigSchema,
  'depreciation-method-comparison': methodComparisonConfigSchema,
  'asset-register-simulator': depreciationConfigSchema,
  'dynamic-method-selector': methodComparisonConfigSchema,
  'method-comparison-simulator': methodComparisonConfigSchema,
  'scenario-switch-showtell': scenarioSwitchConfigSchema,

  // Cluster 2 — U6 Inventory & Costing
  'inventory-algorithm-showtell': inventoryAlgorithmConfigSchema,
  'markup-margin-mastery': markupMarginConfigSchema,
  'break-even-mastery': breakEvenConfigSchema,

  // Cluster 3 — U3 Financial Statements & Reporting
  'income-statement-practice': financialStatementConfigSchema,
  'cash-flow-practice': financialStatementConfigSchema,
  'balance-sheet-practice': financialStatementConfigSchema,
  'chart-linking-simulator': chartLinkingConfigSchema,
  'cross-sheet-link-simulator': crossSheetLinkConfigSchema,

  // Cluster 4 — U2 Transactions & Adjustments
  'closing-entry-practice': closingEntryConfigSchema,
  'month-end-close-practice': monthEndConfigSchema,
  'adjustment-practice': adjustmentConfigSchema,

  // Cluster 5 — U8 Integrated Model & Validation
  'error-checking-system': errorCheckingConfigSchema,
} as const;
