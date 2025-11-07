import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { FinancialStatementMatching, type FinancialStatementMatchingActivity } from './FinancialStatementMatching';
import { AVAILABLE_ITEMS_DROPPABLE, getZoneDroppableId } from './useCategorizationExercise';
import type { FinancialStatementMatchingActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (overrides: Partial<FinancialStatementMatchingActivityProps> = {}): FinancialStatementMatchingActivity => ({
  id: 'activity-financial-statements',
  componentKey: 'financial-statement-matching',
  displayName: 'Financial statement matching',
  description: 'Match each line item to its home statement',
  props: {
    title: 'Sort the statements',
    description: 'Drag every line item into the correct financial statement.',
    statements: [
      { id: 'income', name: 'Income Statement', description: 'Shows profitability' },
      { id: 'balance', name: 'Balance Sheet', description: 'Shows what we own and owe' }
    ],
    lineItems: [
      { id: 'revenue', label: 'Sales revenue', description: 'Money earned from customers', statementId: 'income', category: 'Revenue' },
      { id: 'cash', label: 'Cash on hand', description: 'Most liquid asset', statementId: 'balance', category: 'Asset' }
    ],
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

describe('FinancialStatementMatching', () => {
  it('submits results when all line items are sorted', async () => {
    const onSubmit = vi.fn();
    render(<FinancialStatementMatching activity={buildActivity()} onSubmit={onSubmit} />);

    dropItem('revenue', 'income');
    dropItem('cash', 'balance');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-financial-statements',
          score: 100
        })
      );
    });
  });
});
