import { ComponentType } from 'react';

import { FinancialDashboard } from '@/components/activities/charts/FinancialDashboard';
import { CashFlowChallenge } from '@/components/activities/simulations/CashFlowChallenge';
import { BudgetBalancer } from '@/components/activities/simulations/BudgetBalancer';
import { InventoryManager } from '@/components/activities/simulations/InventoryManager';
import { LemonadeStand } from '@/components/activities/simulations/LemonadeStand';
import { PitchPresentationBuilder } from '@/components/activities/simulations/PitchPresentationBuilder';
import { StartupJourney } from '@/components/activities/simulations/StartupJourney';
import { DataCleaningActivity } from '@/components/activities/spreadsheet/DataCleaningActivity';
import { CashFlowTimeline } from '@/components/activities/drag-drop/CashFlowTimeline';
import { InventoryFlowDiagram } from '@/components/activities/drag-drop/InventoryFlowDiagram';
import { PercentageCalculationSorting } from '@/components/activities/drag-drop/PercentageCalculationSorting';
import { FillInTheBlank } from '@/components/activities/quiz/FillInTheBlank';
import { JournalEntryActivity } from '@/components/activities/accounting/JournalEntryActivity';
import { ComprehensionCheck } from '@/components/activities/quiz/ComprehensionCheck';
import { TieredAssessment } from '@/components/activities/quiz/TieredAssessment';
import { PeerCritiqueForm } from '@/components/activities/quiz/PeerCritiqueForm';
import { ReflectionJournal } from '@/components/activities/quiz/ReflectionJournal';
import { SpreadsheetEvaluator } from '@/components/activities/spreadsheet/SpreadsheetEvaluator';
import { SpreadsheetActivityAdapter } from '@/components/activities/spreadsheet/SpreadsheetActivityAdapter';

// Simulations
import { CafeSupplyChaos } from '@/components/activities/simulations/CafeSupplyChaos';
import { NotebookOrganizer } from '@/components/activities/simulations/NotebookOrganizer';
import { GrowthPuzzle } from '@/components/activities/simulations/GrowthPuzzle';
import { AssetTimeMachine } from '@/components/activities/simulations/AssetTimeMachine';
import { CapitalNegotiation } from '@/components/activities/simulations/CapitalNegotiation';
import { BusinessStressTest } from '@/components/activities/simulations/BusinessStressTest';
import { PayStructureDecisionLab } from '@/components/activities/simulations/PayStructureDecisionLab';
import { ClassificationActivity } from '@/components/activities/ClassificationActivity';
import { AssetRegisterSimulator } from '@/components/activities/simulations/AssetRegisterSimulator';
import { DepreciationMethodComparisonSimulator } from '@/components/activities/simulations/DepreciationMethodComparisonSimulator';
import { DynamicMethodSelector } from '@/components/activities/simulations/DynamicMethodSelector';
import { MethodComparisonSimulator } from '@/components/activities/simulations/MethodComparisonSimulator';
import { ScenarioSwitchShowTell } from '@/components/activities/simulations/ScenarioSwitchShowTell';

// Exercises
import { StraightLineMastery } from '@/components/activities/exercises/StraightLineMastery';
import { DDBComparisonMastery } from '@/components/activities/exercises/DDBComparisonMastery';
import { CapitalizationExpenseMastery } from '@/components/activities/exercises/CapitalizationExpenseMastery';
import { MarkupMarginMastery } from '@/components/activities/exercises/MarkupMarginMastery';
import { BreakEvenMastery } from '@/components/activities/exercises/BreakEvenMastery';
import { InventoryAlgorithmShowtell } from '@/components/activities/exercises/InventoryAlgorithmShowtell';
import { AdjustmentPractice } from '@/components/activities/exercises/AdjustmentPractice';
import { ClosingEntryPractice } from '@/components/activities/exercises/ClosingEntryPractice';
import { MonthEndClosePractice } from '@/components/activities/exercises/MonthEndClosePractice';
import { IncomeStatementPractice } from '@/components/activities/exercises/IncomeStatementPractice';
import { CashFlowPractice } from '@/components/activities/exercises/CashFlowPractice';
import { BalanceSheetPractice } from '@/components/activities/exercises/BalanceSheetPractice';
import { ChartLinkingSimulator } from '@/components/activities/exercises/ChartLinkingSimulator';

import { resolveActivityComponentKey } from '@/lib/activities/component-keys';
import type { ActivityComponentKey } from '@/types/activities';

/**
 * Centralized registry for activity components.
 * Maps componentKey from database to React component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activityRegistry: Record<ActivityComponentKey, ComponentType<any>> = {
  'comprehension-quiz': ComprehensionCheck,
  'tiered-assessment': TieredAssessment,
  'percentage-calculation-sorting': PercentageCalculationSorting,
  'inventory-flow-diagram': InventoryFlowDiagram,
  'cash-flow-timeline': CashFlowTimeline,
  'fill-in-the-blank': FillInTheBlank,
  'journal-entry-building': JournalEntryActivity,
  'reflection-journal': ReflectionJournal,
  'peer-critique-form': PeerCritiqueForm,

  // Business simulations
  'lemonade-stand': LemonadeStand,
  'startup-journey': StartupJourney,
  'budget-balancer': BudgetBalancer,
  'cash-flow-challenge': CashFlowChallenge,
  'inventory-manager': InventoryManager,
  'pitch-presentation-builder': PitchPresentationBuilder,
  'pitch': PitchPresentationBuilder, // Alias for pitch-presentation-builder
  'cafe-supply-chaos': CafeSupplyChaos,
  'notebook-organizer': NotebookOrganizer,
  'growth-puzzle': GrowthPuzzle,
  'asset-time-machine': AssetTimeMachine,
  'capital-negotiation': CapitalNegotiation,
  'business-stress-test': BusinessStressTest,
  'pay-structure-lab': PayStructureDecisionLab,

  // Classification
  'classification': ClassificationActivity,

  // Charting components
  'financial-dashboard': FinancialDashboard,
  'chart-builder': FinancialDashboard,

  // Spreadsheet + data utilities
  'spreadsheet': SpreadsheetActivityAdapter,
  'spreadsheet-evaluator': SpreadsheetEvaluator,
  'data-cleaning': DataCleaningActivity,

  // Placeholder for remaining activity types - to be implemented
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'profit-calculator': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'budget-worksheet': (() => null) as unknown as ComponentType<any>,

  // Exercises — Cluster 1: U5 Depreciation & Assets
  'straight-line-mastery': StraightLineMastery,
  'ddb-comparison-mastery': DDBComparisonMastery,
  'capitalization-expense-mastery': CapitalizationExpenseMastery,
  'depreciation-method-comparison': DepreciationMethodComparisonSimulator,
  'asset-register-simulator': AssetRegisterSimulator,
  'dynamic-method-selector': DynamicMethodSelector,
  'method-comparison-simulator': MethodComparisonSimulator,
  'scenario-switch-showtell': ScenarioSwitchShowTell,

  // Exercises — Cluster 2: U6 Inventory & Costing
  'inventory-algorithm-showtell': InventoryAlgorithmShowtell,
  'markup-margin-mastery': MarkupMarginMastery,
  'break-even-mastery': BreakEvenMastery,

  // Exercises — Cluster 3: U3 Financial Statements & Reporting
  'income-statement-practice': IncomeStatementPractice,
  'cash-flow-practice': CashFlowPractice,
  'balance-sheet-practice': BalanceSheetPractice,
  'chart-linking-simulator': ChartLinkingSimulator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'cross-sheet-link-simulator': (() => null) as unknown as ComponentType<any>,

  // Exercises — Cluster 4: U2 Transactions & Adjustments
  'adjustment-practice': AdjustmentPractice,
  'closing-entry-practice': ClosingEntryPractice,
  'month-end-close-practice': MonthEndClosePractice,

  // Exercises — Cluster 5: U8 Integrated Model & Validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'error-checking-system': (() => null) as unknown as ComponentType<any>,
};

/**
 * Get activity component by componentKey
 * @param componentKey - The activity component key from database
 * @returns React component or null if not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActivityComponent(componentKey: string): ComponentType<any> | null {
  const canonicalKey = resolveActivityComponentKey(componentKey);
  if (!canonicalKey) {
    return null;
  }

  return activityRegistry[canonicalKey as ActivityComponentKey] ?? null;
}
