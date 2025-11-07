import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { BreakEvenComponents, type BreakEvenComponentsActivity } from './BreakEvenComponents';
import { AVAILABLE_ITEMS_DROPPABLE, getZoneDroppableId } from './useCategorizationExercise';
import type { BreakEvenComponentsActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (overrides: Partial<BreakEvenComponentsActivityProps> = {}): BreakEvenComponentsActivity => ({
  id: 'activity-break-even',
  componentKey: 'break-even-components',
  displayName: 'Break-even components',
  description: 'Categorize costs to compute break-even point',
  props: {
    title: 'Break-even builder',
    description: 'Sort costs into fixed vs variable buckets',
    categories: [
      { id: 'fixed', title: 'Fixed Costs', description: 'Stay the same every month', behavior: 'fixed' },
      { id: 'variable', title: 'Variable Costs', description: 'Change with each unit sold', behavior: 'variable' }
    ],
    costItems: [
      { id: 'rent', label: 'Monthly Rent', amount: 3000, unit: 'per month', categoryId: 'fixed' },
      { id: 'materials', label: 'Coffee Beans', amount: 4, unit: 'per drink', categoryId: 'variable' }
    ],
    salesAssumptions: {
      pricePerUnit: 8,
      unitLabel: 'drinks',
      minPrice: 5,
      maxPrice: 12,
      step: 1,
      targetUnits: 500
    },
    showHintsByDefault: false,
    shuffleItems: false,
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

const dropItem = (itemId: string, zoneId: string) =>
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

describe('BreakEvenComponents', () => {
  it('submits results once costs are categorized correctly', async () => {
    const onSubmit = vi.fn();
    render(<BreakEvenComponents activity={buildActivity()} onSubmit={onSubmit} />);

    dropItem('rent', 'fixed');
    dropItem('materials', 'variable');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-break-even',
          score: 100
        })
      );
    });
  });
});
