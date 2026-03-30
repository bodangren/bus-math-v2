import type { SubmissionData } from '@/lib/db/schema/activity-submissions';

export const ACTIVITY_SUBMISSION_REQUIRED_FIELDS = [
  'contractVersion',
  'activityId',
  'mode',
  'status',
  'attemptNumber',
  'submittedAt',
  'answers',
  'parts',
] as const;

export type ActivitySubmissionData = SubmissionData;

export type {
  ActivityComponentKey,
  ActivityProps,
  BudgetBalancerActivityProps,
  CashFlowChallengeActivityProps,
  CashFlowTimelineActivityProps,
  ComprehensionQuizActivityProps,
  FillInTheBlankActivityProps,
  GradingConfig,
  InventoryFlowDiagramActivityProps,
  InventoryManagerActivityProps,
  JournalEntryActivityProps,
  LemonadeStandActivityProps,
  PeerCritiqueActivityProps,
  PercentageCalculationSortingActivityProps,
  PitchPresentationBuilderActivityProps,
  ReflectionJournalActivityProps,
  SpreadsheetActivityProps,
  SpreadsheetEvaluatorActivityProps,
  StartupJourneyActivityProps,
  TieredAssessmentActivityProps,
} from '@/lib/db/schema/activities';
