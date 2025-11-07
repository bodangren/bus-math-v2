import { triggerDrag } from '@/lib/test-utils/mock-dnd'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { DropResult } from '@hello-pangea/dnd'

import { DragAndDrop, type DragAndDropActivity } from './DragAndDrop'
import type { DragAndDropActivityProps } from '@/lib/db/schema/activities'

const buildActivity = (overrides: Partial<DragAndDropActivityProps> = {}): DragAndDropActivity => ({
  id: 'activity-dnd',
  componentKey: 'drag-and-drop',
  displayName: 'Matching',
  description: 'Match vocabulary terms',
  props: {
    title: 'Vocabulary Match',
    description: 'Match each term to the correct definition.',
    leftColumnTitle: 'Terms',
    rightColumnTitle: 'Definitions',
    items: [
      { id: 'term-assets', content: 'Assets', matchId: 'def-assets' },
      { id: 'def-assets', content: 'Resources owned by the business', matchId: 'term-assets' },
      { id: 'term-liabilities', content: 'Liabilities', matchId: 'def-liabilities' },
      { id: 'def-liabilities', content: 'Amounts owed to others', matchId: 'term-liabilities' }
    ],
    showHints: false,
    shuffleItems: false,
    ...overrides
  },
  gradingConfig: null,
  createdAt: new Date(),
  updatedAt: new Date()
})

describe('DragAndDrop', () => {
  it('completes exercise and calls onSubmit with responses', async () => {
    const onSubmit = vi.fn()
    render(<DragAndDrop activity={buildActivity()} onSubmit={onSubmit} />)

    const submitMove = (itemId: string, zoneId: string) =>
      act(() => {
        triggerDrag({
          draggableId: itemId,
          type: 'DEFAULT',
          source: { droppableId: 'available-items', index: 0 },
          destination: { droppableId: `zone-${zoneId}`, index: 0 },
          reason: 'DROP',
          mode: 'FLUID',
          combine: null
        } as DropResult)
      })

    submitMove('term-assets', 'def-assets')
    submitMove('term-liabilities', 'def-liabilities')

    expect(await screen.findByText(/100% correct/i)).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-dnd',
        score: 100
      })
    )
  })
})
