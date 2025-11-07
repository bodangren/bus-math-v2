import type { ReactNode } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { vi } from 'vitest';

export const dragHandlers: { onDragEnd: ((result: DropResult) => void) | null } = {
  onDragEnd: null
};

interface MockDroppableProvided {
  droppableProps: Record<string, unknown>;
  innerRef: () => void;
  placeholder: ReactNode;
}

interface MockDraggableProvided {
  draggableProps: Record<string, unknown>;
  dragHandleProps: Record<string, unknown>;
  innerRef: () => void;
}

interface MockDraggableSnapshot {
  isDragging: boolean;
}

vi.mock('@hello-pangea/dnd', () => {
  return {
    DragDropContext: ({
      children,
      onDragEnd
    }: {
      children: ReactNode;
      onDragEnd: (result: DropResult) => void;
    }) => {
      dragHandlers.onDragEnd = onDragEnd;
      return <div data-testid="drag-drop-context">{children}</div>;
    },
    Droppable: ({
      children,
      droppableId
    }: {
      children: (provided: MockDroppableProvided) => ReactNode;
      droppableId: string;
    }) => (
      <div data-testid={`droppable-${droppableId}`}>
        {children({
          droppableProps: { 'data-droppable-id': droppableId },
          innerRef: vi.fn(),
          placeholder: null
        })}
      </div>
    ),
    Draggable: ({
      children,
      draggableId
    }: {
      children: (provided: MockDraggableProvided, snapshot: MockDraggableSnapshot) => ReactNode;
      draggableId: string;
    }) => (
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
  };
});

export function triggerDrag(result: DropResult) {
  dragHandlers.onDragEnd?.(result);
}
