import { ComponentType } from 'react';

import { FinancialDashboard } from '@/components/activities/charts/FinancialDashboard';
import { FinancialStatementMatching } from '@/components/activities/drag-drop/FinancialStatementMatching';
import { TrialBalanceSorting } from '@/components/activities/drag-drop/TrialBalanceSorting';
import { CashFlowChallenge } from '@/components/activities/simulations/CashFlowChallenge';
import { BudgetBalancer } from '@/components/activities/simulations/BudgetBalancer';
import { InventoryManager } from '@/components/activities/simulations/InventoryManager';
import { LemonadeStand } from '@/components/activities/simulations/LemonadeStand';
import { PitchPresentationBuilder } from '@/components/activities/simulations/PitchPresentationBuilder';
import { StartupJourney } from '@/components/activities/simulations/StartupJourney';
import DataCleaningActivity from '@/components/activities/spreadsheet/DataCleaningActivity';
import { BreakEvenComponents } from '@/components/activities/drag-drop/BreakEvenComponents';
import { BudgetCategorySort } from '@/components/activities/drag-drop/BudgetCategorySort';
import { CashFlowTimeline } from '@/components/activities/drag-drop/CashFlowTimeline';
import { InventoryFlowDiagram } from '@/components/activities/drag-drop/InventoryFlowDiagram';
import { PercentageCalculationSorting } from '@/components/activities/drag-drop/PercentageCalculationSorting';
import { RatioMatching } from '@/components/activities/drag-drop/RatioMatching';
import { AccountCategorization } from '@/components/activities/drag-drop/AccountCategorization';
import { GeneralDragAndDrop } from '@/components/activities/drag-drop/GeneralDragAndDrop';
import { FillInTheBlank } from '@/components/activities/quiz/FillInTheBlank';
import { JournalEntryActivity } from '@/components/activities/accounting/JournalEntryActivity';
import { ComprehensionCheck } from '@/components/activities/quiz/ComprehensionCheck';
import { PeerCritiqueForm } from '@/components/activities/quiz/PeerCritiqueForm';
import ReflectionJournal from '@/components/activities/quiz/ReflectionJournal';
import { SpreadsheetEvaluator } from '@/components/activities/spreadsheet/SpreadsheetEvaluator';
import { SpreadsheetActivityAdapter } from '@/components/activities/spreadsheet/SpreadsheetActivityAdapter';
import type { ActivityComponentKey } from '@/types/activities';

/**
 * Centralized registry for activity components.
 * Maps componentKey from database to React component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activityRegistry: Record<ActivityComponentKey, ComponentType<any>> = {
  'comprehension-quiz': ComprehensionCheck,
  'drag-and-drop': GeneralDragAndDrop,
  'account-categorization': AccountCategorization,
  'budget-category-sort': BudgetCategorySort,
  'percentage-calculation-sorting': PercentageCalculationSorting,
  'inventory-flow-diagram': InventoryFlowDiagram,
  'ratio-matching': RatioMatching,
  'break-even-components': BreakEvenComponents,
  'cash-flow-timeline': CashFlowTimeline,
  'financial-statement-matching': FinancialStatementMatching,
  'trial-balance-sorting': TrialBalanceSorting,
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
};

/**
 * Get activity component by componentKey
 * @param componentKey - The activity component key from database
 * @returns React component or null if not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActivityComponent(componentKey: string): ComponentType<any> | null {
  return activityRegistry[componentKey as ActivityComponentKey] ?? null;
}
