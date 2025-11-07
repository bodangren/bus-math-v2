import { dragHandlers, triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import {
  InventoryFlowDiagram,
  INVENTORY_ARRANGEMENT_DROPPABLE,
  INVENTORY_AVAILABLE_DROPPABLE,
  type InventoryFlowDiagramActivity
} from './InventoryFlowDiagram';
import type { InventoryFlowDiagramActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (
  overrides: Partial<InventoryFlowDiagramActivityProps> = {}
): InventoryFlowDiagramActivity => ({
  id: 'activity-inventory',
  componentKey: 'inventory-flow-diagram',
  displayName: 'Inventory Flow',
  description: 'Arrange lots',
  props: {
    title: 'Inventory flow',
    description: 'Arrange lots to match FIFO/LIFO',
    scenarios: [
      {
        id: 'scenario-1',
        title: 'Laptop lots',
        description: 'Organize laptop purchases',
        context: 'Tech retail pilot',
        salesQuantity: 10,
        lots: [
          { id: 'lot-a', label: 'January lot', purchaseDate: '2024-01-01', quantity: 5, unitCost: 1000 },
          { id: 'lot-b', label: 'February lot', purchaseDate: '2024-02-01', quantity: 5, unitCost: 1100 }
        ],
        flowModes: [
          {
            id: 'fifo',
            name: 'FIFO',
            description: 'Oldest inventory first',
            targetOrder: ['lot-a', 'lot-b']
          }
        ]
      }
    ],
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

const moveLot = (lotId: string, sourceIndex: number, destinationIndex: number) =>
  act(() => {
    triggerDrag({
      draggableId: lotId,
      type: 'DEFAULT',
      source: { droppableId: INVENTORY_AVAILABLE_DROPPABLE, index: sourceIndex },
      destination: { droppableId: INVENTORY_ARRANGEMENT_DROPPABLE, index: destinationIndex },
      reason: 'DROP',
      mode: 'FLUID',
      combine: null
    } as DropResult);
  });

describe('InventoryFlowDiagram', () => {
  it('submits once the arrangement matches the target order', async () => {
    const onSubmit = vi.fn();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    render(<InventoryFlowDiagram activity={buildActivity()} onSubmit={onSubmit} />);
    expect(dragHandlers.onDragEnd).toBeTruthy();

    moveLot('lot-a', 0, 0);
    moveLot('lot-b', 0, 1);

    expect(await screen.findByText(/Step 1: January lot/i)).toBeInTheDocument();
    expect(await screen.findByText(/Step 2: February lot/i)).toBeInTheDocument();
    expect(await screen.findByText(/Flow complete/i)).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-inventory',
        responses: { arrangement: ['lot-a', 'lot-b'] }
      })
    );
    randomSpy.mockRestore();
  });
});
