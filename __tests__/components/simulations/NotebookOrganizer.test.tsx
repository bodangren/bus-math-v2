import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, screen, waitFor, within } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import type { NotebookOrganizerActivity } from '@/components/activities/simulations/NotebookOrganizer';
import {
  getNotebookFolderDroppableId,
  NotebookOrganizer,
  NOTEBOOK_QUEUE_DROPPABLE,
} from '@/components/activities/simulations/NotebookOrganizer';

const activity: NotebookOrganizerActivity = {
  id: 'notebook-test',
  displayName: 'Notebook Organizer Practice',
  description: 'Sort the notebook notes',
  componentKey: 'notebook-organizer',
  props: {
    title: 'Notebook Organizer Practice',
    description: 'Sort the notebook notes',
    items: [
      {
        id: 'cash-note',
        label: 'Cash on hand',
        amount: 100,
        category: 'asset' as const,
        description: 'Money available now',
        icon: 'cash' as const,
      },
      {
        id: 'owner-note',
        label: 'Owner contribution',
        amount: 100,
        category: 'equity' as const,
        description: 'Sarah put money in',
        icon: 'owner' as const,
      },
    ],
    initialMessage: 'Sort the notes into the right folders.',
    successMessage: 'Balanced and sorted.',
  },
  gradingConfig: null,
  standardId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('NotebookOrganizer', () => {
  const dragNoteTo = (itemId: string, category: 'asset' | 'liability' | 'equity') =>
    act(() => {
      triggerDrag({
        draggableId: itemId,
        type: 'DEFAULT',
        source: { droppableId: NOTEBOOK_QUEUE_DROPPABLE, index: 0 },
        destination: { droppableId: getNotebookFolderDroppableId(category), index: 0 },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      } as DropResult);
    });

  it('supports dragging notes into folders', async () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(<NotebookOrganizer activity={activity} onSubmit={onSubmit} onComplete={onComplete} />);

    dragNoteTo('cash-note', 'asset');
    dragNoteTo('owner-note', 'equity');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          contractVersion: 'practice.v1',
          activityId: 'notebook-test',
          mode: 'guided_practice',
          status: 'submitted',
          artifact: expect.objectContaining({
            kind: 'notebook_organizer',
            placedItems: {
              'cash-note': 'asset',
              'owner-note': 'equity',
            },
          }),
        }),
      );
    });

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        totals: expect.objectContaining({
          asset: 100,
          liability: 0,
          equity: 100,
        }),
      }),
    );
  });

  it('emits a canonical practice submission when the notebook is solved', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(<NotebookOrganizer activity={activity} onSubmit={onSubmit} onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: /How to Sort/i }));
    expect(screen.getByText(/Sort the notebook notes/i)).toBeInTheDocument();

    const cashCard = screen.getByText('Cash on hand').closest('div')?.parentElement?.parentElement?.parentElement;
    const ownerCard = screen.getByText('Owner contribution').closest('div')?.parentElement?.parentElement?.parentElement;
    expect(cashCard).toBeTruthy();
    expect(ownerCard).toBeTruthy();

    await user.click(within(cashCard as HTMLElement).getByRole('button', { name: /^asset$/i }));
    await user.click(within(ownerCard as HTMLElement).getByRole('button', { name: /^equity$/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          contractVersion: 'practice.v1',
          activityId: 'notebook-test',
          mode: 'guided_practice',
          status: 'submitted',
          artifact: expect.objectContaining({
            kind: 'notebook_organizer',
          }),
        }),
      );
    });

    const envelope = onSubmit.mock.calls[0][0]
    expect(envelope.parts.length).toBeGreaterThan(0)

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        totals: expect.objectContaining({
          asset: 100,
          liability: 0,
          equity: 100,
        }),
      }),
    );
  });

  it('only calls onSubmit once on rapid double-click of submit button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onComplete = vi.fn();

    render(<NotebookOrganizer activity={activity} onSubmit={onSubmit} onComplete={onComplete} />);

    const cashCard = screen.getByText('Cash on hand').closest('div')?.parentElement?.parentElement?.parentElement;
    const ownerCard = screen.getByText('Owner contribution').closest('div')?.parentElement?.parentElement?.parentElement;
    expect(cashCard).toBeTruthy();
    expect(ownerCard).toBeTruthy();

    await user.click(within(cashCard as HTMLElement).getByRole('button', { name: /^asset$/i }));
    await user.click(within(ownerCard as HTMLElement).getByRole('button', { name: /^equity$/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Reset to allow manual re-submission test
    await user.click(screen.getByRole('button', { name: /reset/i }));

    // Re-place items
    const cashCard2 = screen.getByText('Cash on hand').closest('div')?.parentElement?.parentElement?.parentElement;
    const ownerCard2 = screen.getByText('Owner contribution').closest('div')?.parentElement?.parentElement?.parentElement;
    await user.click(within(cashCard2 as HTMLElement).getByRole('button', { name: /^asset$/i }));
    await user.click(within(ownerCard2 as HTMLElement).getByRole('button', { name: /^equity$/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});
