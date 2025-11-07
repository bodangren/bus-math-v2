import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { AccountCategorization, type AccountCategorizationActivity } from './AccountCategorization';
import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId
} from './useCategorizationExercise';
import type { AccountCategorizationActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (overrides: Partial<AccountCategorizationActivityProps> = {}): AccountCategorizationActivity => ({
  id: 'activity-account',
  componentKey: 'account-categorization',
  displayName: 'Account Categorization',
  description: 'Sort accounts',
  props: {
    title: 'Categorize accounts',
    description: 'Match each account to the right category',
    categories: [
      { id: 'assets', name: 'Assets', description: 'Things we own', emoji: '💰' },
      { id: 'expenses', name: 'Expenses', description: 'Costs we pay', emoji: '💸' }
    ],
    accounts: [
      {
        id: 'acct-cash',
        name: 'Cash',
        description: 'Money on hand',
        categoryId: 'assets'
      },
      {
        id: 'acct-rent',
        name: 'Rent Expense',
        description: 'Monthly rent',
        categoryId: 'expenses'
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

const performDrop = (itemId: string, zoneId: string) =>
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

describe('AccountCategorization', () => {
  it('calls onSubmit when all accounts are categorized correctly', async () => {
    const onSubmit = vi.fn();
    render(<AccountCategorization activity={buildActivity()} onSubmit={onSubmit} />);

    performDrop('acct-cash', 'assets');
    performDrop('acct-rent', 'expenses');

    expect(await screen.findByText(/Score: 100%/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-account',
          score: 100,
          responses: {
            assets: ['acct-cash'],
            expenses: ['acct-rent']
          }
        })
      );
    });
  });
});
