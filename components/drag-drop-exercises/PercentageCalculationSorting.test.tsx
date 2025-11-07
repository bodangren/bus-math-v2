import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import {
  PercentageCalculationSorting,
  type PercentageCalculationSortingActivity
} from './PercentageCalculationSorting';
import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId
} from './useCategorizationExercise';
import type { PercentageCalculationSortingActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (
  overrides: Partial<PercentageCalculationSortingActivityProps> = {}
): PercentageCalculationSortingActivity => ({
  id: 'activity-percentage',
  componentKey: 'percentage-calculation-sorting',
  displayName: 'Percentage Sorting',
  description: 'Match scenarios to calculation types',
  props: {
    title: 'Match the calculation type',
    description: 'Determine which percentage approach applies to each scenario',
    calculationTypes: [
      { id: 'change', title: 'Percentage change', description: 'Compare new vs old', formula: '((New - Old) / Old) × 100' },
      { id: 'of-total', title: 'Percentage of total', description: 'Part vs whole', formula: '(Part / Whole) × 100' }
    ],
    scenarios: [
      {
        id: 'scenario-sales',
        prompt: 'Sales increased from $1000 to $1100',
        description: 'Find the growth rate',
        calculationTypeId: 'change',
        dataPoints: '$1000 → $1100',
        businessContext: 'Growth comparison',
        difficulty: 'easy'
      },
      {
        id: 'scenario-labor',
        prompt: 'Labor costs are $400 of the $1000 budget',
        description: 'Find percentage of total',
        calculationTypeId: 'of-total',
        dataPoints: '$400 / $1000',
        businessContext: 'Budget review',
        difficulty: 'medium'
      }
    ],
    showHintsByDefault: false,
    shuffleItems: false,
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

const dropScenario = (itemId: string, zoneId: string) =>
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

describe('PercentageCalculationSorting', () => {
  it('submits when all scenarios are matched', async () => {
    const onSubmit = vi.fn();
    render(<PercentageCalculationSorting activity={buildActivity()} onSubmit={onSubmit} />);

    dropScenario('scenario-sales', 'change');
    dropScenario('scenario-labor', 'of-total');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-percentage',
          score: 100
        })
      );
    });
  });
});
