import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NotebookOrganizer } from '@/components/activities/simulations/NotebookOrganizer';

const activity = {
  id: 'notebook-test',
  title: 'Notebook Organizer Practice',
  description: 'Sort the notebook notes',
  props: {
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
};

describe('NotebookOrganizer', () => {
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
          artifact: expect.objectContaining({
            kind: 'notebook_organizer',
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
});
