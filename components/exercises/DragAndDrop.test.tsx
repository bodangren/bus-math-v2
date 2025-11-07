import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { DropResult } from '@hello-pangea/dnd'

import { DragAndDrop, type DragAndDropActivity } from './DragAndDrop'
import type { DragAndDropActivityProps } from '@/lib/db/schema/activities'

const dragHandlers: { onDragEnd: ((result: DropResult) => void) | null } = { onDragEnd: null }

interface MockDroppableProvided {
  droppableProps: Record<string, unknown>
  innerRef: () => void
  placeholder: ReactNode
}

interface MockDraggableProvided {
  draggableProps: Record<string, unknown>
  dragHandleProps: Record<string, unknown>
  innerRef: () => void
}

interface MockDraggableSnapshot {
  isDragging: boolean
}

vi.mock('@hello-pangea/dnd', () => {
  return {
    DragDropContext: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: (result: DropResult) => void }) => {
      dragHandlers.onDragEnd = onDragEnd
      return <div data-testid="drag-drop-context">{children}</div>
    },
    Droppable: ({ children, droppableId }: { children: (provided: MockDroppableProvided) => ReactNode; droppableId: string }) => (
      <div data-testid={`droppable-${droppableId}`}>
        {children({
          droppableProps: { 'data-droppable-id': droppableId },
          innerRef: vi.fn(),
          placeholder: null
        })}
      </div>
    ),
    Draggable: ({ children, draggableId }: { children: (provided: MockDraggableProvided, snapshot: MockDraggableSnapshot) => ReactNode; draggableId: string }) => (
      <div data-testid={`draggable-${draggableId}`}>
        {children(
          {
            draggableProps: {},
            dragHandleProps: {},
            innerRef: vi.fn()
          },
          { isDragging: false }
        )}
      </div>
    )
  }
})

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

    const submitMove = (itemId: string, zoneId: string) => {
      act(() => {
        dragHandlers.onDragEnd?.({
          draggableId: itemId,
          type: 'DEFAULT',
          source: { droppableId: 'available-items', index: 0 },
          destination: { droppableId: `zone-${zoneId}`, index: 0 },
          reason: 'DROP',
          mode: 'FLUID',
          combine: null
        } as DropResult)
      })
    }

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
