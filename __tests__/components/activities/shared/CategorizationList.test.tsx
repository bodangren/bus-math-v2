import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { AVAILABLE_ITEMS_DROPPABLE, getZoneDroppableId } from '@/components/activities/drag-drop/useCategorizationExercise';
import { CategorizationList } from '@/components/activities/shared';

const dragToZone = (itemId: string, zoneId: string) =>
  act(() => {
    triggerDrag({
      draggableId: itemId,
      type: 'DEFAULT',
      source: { droppableId: AVAILABLE_ITEMS_DROPPABLE, index: 0 },
      destination: { droppableId: getZoneDroppableId(zoneId), index: 0 },
      reason: 'DROP',
      mode: 'FLUID',
      combine: null,
    } as DropResult);
  });

describe('CategorizationList', () => {
  it('completes a generic drag-and-drop review', async () => {
    const onComplete = vi.fn();

    render(
      <CategorizationList
        title="Generic categorization"
        shuffleItems={false}
        items={[
          { id: 'cash', label: 'Cash', description: 'Asset', targetId: 'assets' },
          { id: 'rent', label: 'Rent Expense', description: 'Expense', targetId: 'expenses' },
        ]}
        zones={[
          { id: 'assets', label: 'Assets', description: 'Resources', emoji: '💼' },
          { id: 'expenses', label: 'Expenses', description: 'Costs', emoji: '💸' },
        ]}
        onComplete={onComplete}
      />,
    );

    dragToZone('cash', 'assets');
    dragToZone('rent', 'expenses');

    expect(await screen.findByText(/score: 100%/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 100,
          attempts: 2,
        }),
      );
    });
  });
});
