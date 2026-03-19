import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { BudgetCategorySort, type BudgetCategorySortActivity } from '../../../components/activities/drag-drop/BudgetCategorySort';
import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId
} from '../../../components/activities/drag-drop/useCategorizationExercise';
import type { BudgetCategorySortActivityProps } from '@/types/activities';

const buildActivity = (overrides: Partial<BudgetCategorySortActivityProps> = {}): BudgetCategorySortActivity => ({
  id: 'activity-budget',
  componentKey: 'budget-category-sort',
  displayName: 'Budget Sort',
  description: 'Sort expenses',
  props: {
    title: 'Sort café expenses',
    description: 'Place each expense in the right budget category',
    categories: [
      { id: 'labor', title: 'Labor', description: 'Staff costs', emoji: '🧑‍🍳' },
      { id: 'overhead', title: 'Overhead', description: 'Fixed costs', emoji: '🏢' }
    ],
    expenses: [
      {
        id: 'expense-wages',
        label: 'Barista wages',
        description: 'Hourly pay for staff',
        amount: 3000,
        categoryId: 'labor',
        impact: 'high'
      },
      {
        id: 'expense-rent',
        label: 'Rent',
        description: 'Monthly lease',
        amount: 2000,
        categoryId: 'overhead',
        impact: 'medium'
      }
    ],
    showHintsByDefault: false,
    shuffleItems: false,
    ...overrides
  },
  gradingConfig: null,
  standardId: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

const dropExpense = (itemId: string, zoneId: string) =>
  act(() => {
    triggerDrag({
      draggableId: itemId,
      type: 'DEFAULT',
      source: { droppableId: AVAILABLE_ITEMS_DROPPABLE, index: 0 },
      destination: { droppableId: getZoneDroppableId(zoneId), index: 0 },
      reason: 'DROP',
      mode: 'FLUID',
      combine: null
    } as DropResult);
  });

describe('BudgetCategorySort', () => {
  it('submits categorized expenses', async () => {
    const onSubmit = vi.fn();
    render(<BudgetCategorySort activity={buildActivity()} onSubmit={onSubmit} />);

    dropExpense('expense-wages', 'labor');
    dropExpense('expense-rent', 'overhead');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          contractVersion: 'practice.v1',
          activityId: 'activity-budget',
          mode: 'independent_practice',
          status: 'submitted',
          answers: {
            labor: ['expense-wages'],
            overhead: ['expense-rent']
          },
          artifact: expect.objectContaining({
            kind: 'categorization_board'
          })
        })
      );
    });
  });
});
