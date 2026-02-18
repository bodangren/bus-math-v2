import { ComponentType } from 'react';

import { FinancialDashboard } from '@/components/charts/FinancialDashboard';
import { FinancialStatementMatching } from '@/components/drag-drop-exercises/FinancialStatementMatching';
import { TrialBalanceSorting } from '@/components/drag-drop-exercises/TrialBalanceSorting';
import { CashFlowChallenge } from '@/components/business-simulations/CashFlowChallenge';
import { BudgetBalancer } from '@/components/business-simulations/BudgetBalancer';
import { InventoryManager } from '@/components/business-simulations/InventoryManager';
import { LemonadeStand } from '@/components/business-simulations/LemonadeStand';
import { PitchPresentationBuilder } from '@/components/business-simulations/PitchPresentationBuilder';
import { StartupJourney } from '@/components/business-simulations/StartupJourney';
import DataCleaningExercise from '@/components/data-cleaning/DataCleaningExercise';
import { BreakEvenComponents } from '@/components/drag-drop-exercises/BreakEvenComponents';
import { BudgetCategorySort } from '@/components/drag-drop-exercises/BudgetCategorySort';
import { CashFlowTimeline } from '@/components/drag-drop-exercises/CashFlowTimeline';
import { InventoryFlowDiagram } from '@/components/drag-drop-exercises/InventoryFlowDiagram';
import { PercentageCalculationSorting } from '@/components/drag-drop-exercises/PercentageCalculationSorting';
import { RatioMatching } from '@/components/drag-drop-exercises/RatioMatching';
import { AccountCategorization } from '@/components/drag-drop-exercises/AccountCategorization';
import { DragAndDrop } from '@/components/exercises/DragAndDrop';
import { FillInTheBlank } from '@/components/exercises/FillInTheBlank';
import { JournalEntryBuilding } from '@/components/exercises/JournalEntryBuilding';
import { ComprehensionCheck } from '@/components/exercises/ComprehensionCheck';
import { PeerCritiqueForm } from '@/components/exercises/PeerCritiqueForm';
import ReflectionJournal from '@/components/exercises/ReflectionJournal';
import { SpreadsheetEvaluator } from '@/components/activities/SpreadsheetEvaluator';
import { SpreadsheetActivityAdapter } from '@/components/spreadsheet/SpreadsheetActivityAdapter';
import type { ActivityComponentKey } from '@/types/activities';

/**
 * Centralized registry for activity components.
 * Maps componentKey from database to React component.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activityRegistry: Record<ActivityComponentKey, ComponentType<any>> = {
  'comprehension-quiz': ComprehensionCheck,
  'drag-and-drop': DragAndDrop,
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
  'journal-entry-building': JournalEntryBuilding,
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
  'data-cleaning': DataCleaningExercise,

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
