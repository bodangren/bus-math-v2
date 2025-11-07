import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { CashFlowTimeline, type CashFlowTimelineActivity } from './CashFlowTimeline';
import { AVAILABLE_ITEMS_DROPPABLE, getZoneDroppableId } from './useCategorizationExercise';
import type { CashFlowTimelineActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (overrides: Partial<CashFlowTimelineActivityProps> = {}): CashFlowTimelineActivity => ({
  id: 'activity-cash-flow',
  componentKey: 'cash-flow-timeline',
  displayName: 'Cash flow timeline',
  description: 'Sequence inflows and outflows',
  props: {
    title: 'Plan the café cash flow',
    description: 'Drag each inflow/outflow to the correct week to keep cash positive.',
    periods: [
      { id: 'week-1', label: 'Week 1', order: 1, description: 'Launch week' },
      { id: 'week-2', label: 'Week 2', order: 2, description: 'Growth week' }
    ],
    cashFlowItems: [
      { id: 'loan', label: 'Bank loan funded', amount: 10000, direction: 'inflow', periodId: 'week-1' },
      { id: 'rent', label: 'Rent payment', amount: 2000, direction: 'outflow', periodId: 'week-2' }
    ],
    startingCash: 5000,
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

describe('CashFlowTimeline', () => {
  it('submits results after all events are placed', async () => {
    const onSubmit = vi.fn();
    render(<CashFlowTimeline activity={buildActivity()} onSubmit={onSubmit} />);

    dropItem('loan', 'week-1');
    dropItem('rent', 'week-2');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-cash-flow',
          score: 100
        })
      );
    });
  });
});
