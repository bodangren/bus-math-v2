import { triggerDrag } from '@/lib/test-utils/mock-dnd';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DropResult } from '@hello-pangea/dnd';

import { RatioMatching, type RatioMatchingActivity } from './RatioMatching';
import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId
} from './useCategorizationExercise';
import type { RatioMatchingActivityProps } from '@/lib/db/schema/activities';

const buildActivity = (overrides: Partial<RatioMatchingActivityProps> = {}): RatioMatchingActivity => ({
  id: 'activity-ratio',
  componentKey: 'ratio-matching',
  displayName: 'Ratio Matching',
  description: 'Match ratios to formulas',
  props: {
    title: 'Match ratios',
    description: 'Connect the formula to the ratio name',
    ratios: [
      {
        id: 'current',
        name: 'Current ratio',
        category: 'Liquidity',
        description: 'Short-term solvency',
        formulaSummary: 'Current assets ÷ Current liabilities'
      },
      {
        id: 'debt-equity',
        name: 'Debt-to-equity',
        category: 'Leverage',
        description: 'Capital structure',
        formulaSummary: 'Total debt ÷ Total equity'
      }
    ],
    formulaZones: [
      {
        id: 'zone-current',
        title: 'Current ratio formula',
        formula: 'Current assets ÷ Current liabilities',
        category: 'Liquidity',
        expectedRatioId: 'current'
      },
      {
        id: 'zone-de',
        title: 'Debt-to-equity formula',
        formula: 'Total debt ÷ Total equity',
        category: 'Leverage',
        expectedRatioId: 'debt-equity'
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

const dropRatio = (itemId: string, zoneId: string) =>
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

describe('RatioMatching', () => {
  it('submits when ratios match their formulas', async () => {
    const onSubmit = vi.fn();
    render(<RatioMatching activity={buildActivity()} onSubmit={onSubmit} />);

    dropRatio('current', 'zone-current');
    dropRatio('debt-equity', 'zone-de');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: 'activity-ratio',
          score: 100
        })
      );
    });
  });
});
