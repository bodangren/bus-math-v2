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
  AssetTimeMachineActivityProps,
  BudgetBalancerActivityProps,
  BusinessStressTestActivityProps,
  CafeSupplyChaosActivityProps,
  CapitalNegotiationActivityProps,
  CashFlowChallengeActivityProps,
  CashFlowTimelineActivityProps,
  ComprehensionQuizActivityProps,
  FillInTheBlankActivityProps,
  GradingConfig,
  GrowthPuzzleActivityProps,
  InventoryFlowDiagramActivityProps,
  InventoryManagerActivityProps,
  JournalEntryActivityProps,
  LemonadeStandActivityProps,
  NotebookOrganizerActivityProps,
  PayStructureDecisionLabActivityProps,
  PeerCritiqueActivityProps,
  PercentageCalculationSortingActivityProps,
  PitchPresentationBuilderActivityProps,
  ReflectionJournalActivityProps,
  ScenarioSwitchShowtellActivityProps,
  SpreadsheetActivityProps,
  SpreadsheetEvaluatorActivityProps,
  StartupJourneyActivityProps,
  TieredAssessmentActivityProps,
} from '@/lib/db/schema/activities';
