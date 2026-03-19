import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('supports keyboard-friendly move controls', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <CategorizationList
        title="Categorization with move controls"
        shuffleItems={false}
        items={[
          { id: 'cash', label: 'Cash', description: 'Asset', targetId: 'assets' },
        ]}
        zones={[
          { id: 'assets', label: 'Assets', description: 'Resources', emoji: '💼' },
        ]}
        onComplete={onComplete}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/move cash to another category/i), 'assets');

    expect(await screen.findByText(/score: 100%/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 100,
          attempts: 1,
        }),
      );
    });
  });

  it('renders teacher review annotations and summary state', () => {
    render(
      <CategorizationList
        title="Review state"
        readOnly
        teacherView
        items={[
          { id: 'cash', label: 'Cash', description: 'Asset', targetId: 'assets' },
          { id: 'rent', label: 'Rent Expense', description: 'Expense', targetId: 'expenses' },
        ]}
        zones={[
          { id: 'assets', label: 'Assets', description: 'Resources', emoji: '💼' },
          { id: 'expenses', label: 'Expenses', description: 'Costs', emoji: '💸' },
        ]}
        reviewPlacements={{
          assets: [{ id: 'cash', label: 'Cash', description: 'Asset', targetId: 'assets' }],
          expenses: [{ id: 'rent', label: 'Rent Expense', description: 'Expense', targetId: 'expenses' }],
        }}
        reviewFeedback={{
          cash: {
            status: 'correct',
            scoreLabel: '1/1',
            selectedZoneLabel: 'Assets',
            expectedZoneLabel: 'Assets',
            misconceptionTags: [],
            message: 'Cash is a resource.',
          },
          rent: {
            status: 'incorrect',
            scoreLabel: '0/1',
            selectedZoneLabel: 'Assets',
            expectedZoneLabel: 'Expenses',
            misconceptionTags: ['expense-vs-asset'],
            message: 'Rent expense belongs in expenses.',
          },
        }}
        submissionSummary={{
          scoreLabel: '1/2 correct',
          attempts: 2,
          submittedAt: '2026-03-20 09:15',
          misconceptionCount: 1,
        }}
      />,
    );

    expect(screen.getByText(/score: 1\/2 correct/i)).toBeInTheDocument();
    expect(screen.getByText(/attempts: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted: 2026-03-20 09:15/i)).toBeInTheDocument();
    expect(screen.getByText(/misconceptions: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/expected: expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/expense-vs-asset/i)).toBeInTheDocument();
  });
});
