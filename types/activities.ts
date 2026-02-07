import type { SubmissionData } from '@/lib/db/schema/activity-submissions';

export const ACTIVITY_SUBMISSION_REQUIRED_FIELDS = ['answers'] as const;

export type ActivitySubmissionData = SubmissionData;

export type {
  AccountCategorizationActivityProps,
  ActivityComponentKey,
  ActivityProps,
  BreakEvenComponentsActivityProps,
  BudgetBalancerActivityProps,
  BudgetCategorySortActivityProps,
  CashFlowChallengeActivityProps,
  CashFlowTimelineActivityProps,
  ComprehensionQuizActivityProps,
  DragAndDropActivityProps,
  FillInTheBlankActivityProps,
  FinancialStatementMatchingActivityProps,
  GradingConfig,
  InventoryFlowDiagramActivityProps,
  InventoryManagerActivityProps,
  JournalEntryActivityProps,
  LemonadeStandActivityProps,
  PeerCritiqueActivityProps,
  PercentageCalculationSortingActivityProps,
  PitchPresentationBuilderActivityProps,
  RatioMatchingActivityProps,
  ReflectionJournalActivityProps,
  SpreadsheetActivityProps,
  SpreadsheetEvaluatorActivityProps,
  StartupJourneyActivityProps,
  TrialBalanceSortingActivityProps,
} from '@/lib/db/schema/activities';
