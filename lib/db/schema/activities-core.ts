import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

import { categorizationActivityPropsSchemas } from './activities-categorization';
import { exerciseActivityPropsSchemas } from './activities-exercises';
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
  'graphing-explorer': z.object({
    activityId: z.string(),
    mode: z.enum(['teaching', 'guided', 'practice', 'explore']),
    onSubmit: z.function().optional(),
    variant: z.enum(['plot_from_equation', 'compare_functions', 'find_intercepts', 'graph_system', 'compare_lines', 'multi_curve']).optional(),
    equation: z.string(),
    domain: z.tuple([z.number(), z.number()]).optional(),
    range: z.tuple([z.number(), z.number()]).optional(),
    points: z.array(z.tuple([z.number(), z.number()])).optional(),
    comparisonEquation: z.string().optional(),
    comparisonQuestion: z.string().optional(),
    comparisonAnswer: z.enum(['first', 'second']).optional(),
    linearEquation: z.string().optional(),
    exploreQuestion: z.string().optional(),
    explorationPrompts: z.array(z.string()).optional(),
    sliderDefaults: z.object({
      a: z.number().optional(),
      b: z.number().optional(),
      c: z.number().optional(),
    }).optional(),
    secondEquation: z.string().optional(),
    secondEquationLabel: z.string().optional(),
  }),
} as const;

export const activityPropsSchemas = {
  ...quizActivityPropsSchemas,
  ...categorizationActivityPropsSchemas,
  ...coreActivityPropsSchemas,
  ...exerciseActivityPropsSchemas,
  ...simulationActivityPropsSchemas,
  ...spreadsheetActivityPropsSchemas,
} as const;

export type ActivityComponentKey = keyof typeof activityPropsSchemas;

export type ActivityProps = {
  [K in ActivityComponentKey]: z.infer<(typeof activityPropsSchemas)[K]>;
}[ActivityComponentKey];

export type ComprehensionQuizActivityProps = z.infer<typeof activityPropsSchemas['comprehension-quiz']>;
export type PercentageCalculationSortingActivityProps = z.infer<typeof activityPropsSchemas['percentage-calculation-sorting']>;
export type InventoryFlowDiagramActivityProps = z.infer<typeof activityPropsSchemas['inventory-flow-diagram']>;
export type CashFlowTimelineActivityProps = z.infer<typeof activityPropsSchemas['cash-flow-timeline']>;
export type FillInTheBlankActivityProps = z.infer<typeof activityPropsSchemas['fill-in-the-blank']>;
export type JournalEntryActivityProps = z.infer<typeof activityPropsSchemas['journal-entry-building']>;
export type ReflectionJournalActivityProps = z.infer<typeof activityPropsSchemas['reflection-journal']>;
export type PeerCritiqueActivityProps = z.infer<typeof activityPropsSchemas['peer-critique-form']>;
export type TieredAssessmentActivityProps = z.infer<typeof activityPropsSchemas['tiered-assessment']>;
export type LemonadeStandActivityProps = z.infer<typeof activityPropsSchemas['lemonade-stand']>;
export type StartupJourneyActivityProps = z.infer<typeof activityPropsSchemas['startup-journey']>;
export type BudgetBalancerActivityProps = z.infer<typeof activityPropsSchemas['budget-balancer']>;
export type CashFlowChallengeActivityProps = z.infer<typeof activityPropsSchemas['cash-flow-challenge']>;
export type InventoryManagerActivityProps = z.infer<typeof activityPropsSchemas['inventory-manager']>;
export type PitchPresentationBuilderActivityProps = z.infer<typeof activityPropsSchemas['pitch-presentation-builder']>;
export type NotebookOrganizerActivityProps = z.infer<typeof activityPropsSchemas['notebook-organizer']>;
export type GrowthPuzzleActivityProps = z.infer<typeof activityPropsSchemas['growth-puzzle']>;
export type AssetTimeMachineActivityProps = z.infer<typeof activityPropsSchemas['asset-time-machine']>;
export type CafeSupplyChaosActivityProps = z.infer<typeof activityPropsSchemas['cafe-supply-chaos']>;
export type CapitalNegotiationActivityProps = z.infer<typeof activityPropsSchemas['capital-negotiation']>;
export type BusinessStressTestActivityProps = z.infer<typeof activityPropsSchemas['business-stress-test']>;
export type PayStructureDecisionLabActivityProps = z.infer<typeof activityPropsSchemas['pay-structure-lab']>;
export type SpreadsheetActivityProps = z.infer<typeof activityPropsSchemas.spreadsheet>;
export type SpreadsheetEvaluatorActivityProps = z.infer<typeof activityPropsSchemas['spreadsheet-evaluator']>;
export type ScenarioSwitchShowtellActivityProps = z.infer<typeof activityPropsSchemas['scenario-switch-showtell']>;
export type GraphingExplorerActivityProps = z.infer<typeof activityPropsSchemas['graphing-explorer']>;

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
