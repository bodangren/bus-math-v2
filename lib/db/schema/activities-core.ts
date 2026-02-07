import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { categorizationActivityPropsSchemas } from './activities-categorization';
import { quizActivityPropsSchemas } from './activities-quiz';
import { simulationActivityPropsSchemas } from './activities-simulation';
import { spreadsheetActivityPropsSchemas } from './activities-spreadsheet';
import { competencyStandards } from './competencies';

const chartSeriesSchema = z.object({
  key: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

const chartSegmentSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

const chartDataPointSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null(), z.undefined()]));

const financialKpiSchema = z.object({
  title: z.string(),
  value: z.string(),
  change: z.number(),
  trend: z.enum(['up', 'down']),
  helperText: z.string().optional(),
});

const financialDashboardSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  className: z.string().optional(),
  monthlyMetrics: z.array(chartDataPointSchema).optional(),
  performanceSeries: z.array(chartSeriesSchema).optional(),
  cashflowSeries: z.array(chartSeriesSchema).optional(),
  accountBreakdown: z.array(chartSegmentSchema).optional(),
  kpis: z.array(financialKpiSchema).optional(),
  refreshable: z.boolean().optional(),
  exportable: z.boolean().optional(),
});

const coreActivityPropsSchemas = {
  'financial-dashboard': financialDashboardSchema,
  'chart-builder': financialDashboardSchema,
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
  'data-cleaning': z.object({
    title: z.string().default('Data Cleaning Exercise'),
    description: z.string().default('Clean and analyze messy datasets to prepare them for analysis.'),
    dataset: z.object({
      name: z.string(),
      description: z.string(),
      rows: z
        .array(
          z.object({
            id: z.string(),
            data: z.record(z.string(), z.union([z.string(), z.number(), z.null(), z.undefined()])),
            issues: z
              .array(
                z.object({
                  type: z.enum(['missing', 'inconsistent', 'duplicate', 'format']),
                  description: z.string(),
                  severity: z.enum(['low', 'medium', 'high']),
                }),
              )
              .optional(),
          }),
        )
        .min(1),
    }),
    cleaningSteps: z.array(z.string()).min(1),
    showHints: z.boolean().default(false),
  }),
} as const;

export const activityPropsSchemas = {
  ...quizActivityPropsSchemas,
  ...categorizationActivityPropsSchemas,
  ...coreActivityPropsSchemas,
  ...simulationActivityPropsSchemas,
  ...spreadsheetActivityPropsSchemas,
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
export type LemonadeStandActivityProps = z.infer<typeof activityPropsSchemas['lemonade-stand']>;
export type StartupJourneyActivityProps = z.infer<typeof activityPropsSchemas['startup-journey']>;
export type BudgetBalancerActivityProps = z.infer<typeof activityPropsSchemas['budget-balancer']>;
export type CashFlowChallengeActivityProps = z.infer<typeof activityPropsSchemas['cash-flow-challenge']>;
export type InventoryManagerActivityProps = z.infer<typeof activityPropsSchemas['inventory-manager']>;
export type PitchPresentationBuilderActivityProps = z.infer<typeof activityPropsSchemas['pitch-presentation-builder']>;
export type SpreadsheetActivityProps = z.infer<typeof activityPropsSchemas.spreadsheet>;
export type SpreadsheetEvaluatorActivityProps = z.infer<typeof activityPropsSchemas['spreadsheet-evaluator']>;

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

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    componentKey: text('component_key').$type<ActivityComponentKey>().notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    props: jsonb('props').$type<ActivityProps>().notNull(),
    gradingConfig: jsonb('grading_config').$type<GradingConfig | null>(),
    standardId: uuid('standard_id').references(() => competencyStandards.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    standardIdIdx: index('idx_activities_standard_id').on(table.standardId),
  }),
);
