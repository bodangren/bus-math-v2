import { ComponentType } from 'react';
import type { ActivityComponentKey } from '@/lib/db/schema/activities';

// Import activity components
import { ComprehensionCheck } from '@/components/exercises/ComprehensionCheck';
import { DragAndDrop } from '@/components/exercises/DragAndDrop';
import { FillInTheBlank } from '@/components/exercises/FillInTheBlank';
import { JournalEntryBuilding } from '@/components/exercises/JournalEntryBuilding';
import ReflectionJournal from '@/components/exercises/ReflectionJournal';
import { PeerCritiqueForm } from '@/components/exercises/PeerCritiqueForm';

// Import drag-drop exercises
import { AccountCategorization } from '@/components/drag-drop-exercises/AccountCategorization';
import { BudgetCategorySort } from '@/components/drag-drop-exercises/BudgetCategorySort';
import { PercentageCalculationSorting } from '@/components/drag-drop-exercises/PercentageCalculationSorting';
import { InventoryFlowDiagram } from '@/components/drag-drop-exercises/InventoryFlowDiagram';
import { RatioMatching } from '@/components/drag-drop-exercises/RatioMatching';
import { BreakEvenComponents } from '@/components/drag-drop-exercises/BreakEvenComponents';
import { CashFlowTimeline } from '@/components/drag-drop-exercises/CashFlowTimeline';
import { FinancialStatementMatching } from '@/components/drag-drop-exercises/FinancialStatementMatching';
import { TrialBalanceSorting } from '@/components/drag-drop-exercises/TrialBalanceSorting';

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

  // Placeholder for remaining activity types - to be implemented
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'profit-calculator': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'budget-worksheet': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'lemonade-stand': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'startup-journey': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'budget-balancer': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'cash-flow-challenge': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'inventory-manager': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'pitch-presentation-builder': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'spreadsheet': (() => null) as unknown as ComponentType<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'pitch': (() => null) as unknown as ComponentType<any>,
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
