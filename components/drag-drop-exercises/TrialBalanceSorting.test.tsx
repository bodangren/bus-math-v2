import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { TrialBalanceSorting, type TrialBalanceSortingActivity } from './TrialBalanceSorting';
import { AVAILABLE_ITEMS_DROPPABLE, getZoneDroppableId } from './useCategorizationExercise';
import type { TrialBalanceSortingActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (overrides: Partial<TrialBalanceSortingActivityProps> = {}): TrialBalanceSortingActivity => ({
  id: 'activity-trial-balance',
  componentKey: 'trial-balance-sorting',
  displayName: 'Trial balance sorting',
  description: 'Sort accounts into debit and credit columns',
  props: {
    title: 'Balance the books',
    description: 'Drag each account into the side that reflects its normal balance.',
    sides: [
      { id: 'debit', label: 'Debit Balances', description: 'Assets + expenses', type: 'debit' },
      { id: 'credit', label: 'Credit Balances', description: 'Liabilities + equity + revenue', type: 'credit' }
    ],
    accounts: [
      { id: 'cash', name: 'Cash', amount: 5000, sideId: 'debit', category: 'Asset' },
      { id: 'accounts-payable', name: 'Accounts Payable', amount: 5000, sideId: 'credit', category: 'Liability' }
    ],
    showCategoryBadges: true,
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

describe('TrialBalanceSorting', () => {
  it('submits when debits and credits are sorted correctly', async () => {
    const onSubmit = vi.fn();
    render(<TrialBalanceSorting activity={buildActivity()} onSubmit={onSubmit} />);

    dropItem('cash', 'debit');
    dropItem('accounts-payable', 'credit');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-trial-balance',
          score: 100
        })
      );
    });
  });
});
