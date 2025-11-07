'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';

const AVAILABLE_ITEMS_DROPPABLE = 'available-items';

export interface CategorizationItem {
  id: string;
  targetId: string;
}

export type ZonePlacements<T extends CategorizationItem> = Record<string, T[]>;

interface UseCategorizationExerciseOptions<T extends CategorizationItem> {
  shuffleItems?: boolean;
  resetKey?: string;
  onComplete?: (payload: { score: number; attempts: number; placements: ZonePlacements<T> }) => void;
}

const shuffle = <T,>(items: T[]) => {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

const buildPlacements = <T extends CategorizationItem>(zoneIds: string[]): ZonePlacements<T> =>
  zoneIds.reduce<ZonePlacements<T>>((acc, zoneId) => {
    acc[zoneId] = [];
    return acc;
  }, {});

const zoneFromDroppableId = (droppableId: string): string | null =>
  droppableId.startsWith('zone-') ? droppableId.replace('zone-', '') : null;

export function getZoneDroppableId(zoneId: string) {
  return `zone-${zoneId}`;
}

export function useCategorizationExercise<T extends CategorizationItem>(items: T[], zoneIds: string[], options: UseCategorizationExerciseOptions<T> = {}) {
  const { shuffleItems = true, resetKey, onComplete } = options;

  const [availableItems, setAvailableItems] = useState<T[]>([]);
  const [placements, setPlacements] = useState<ZonePlacements<T>>(() => buildPlacements<T>(zoneIds));
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const totalItems = items.length;

  useEffect(() => {
    const initialPlacements = buildPlacements<T>(zoneIds);
    setPlacements(initialPlacements);
    setAvailableItems(shuffleItems ? shuffle(items) : [...items]);
    setAttempts(0);
    setScore(0);
    setCompleted(false);
  }, [items, zoneIds, shuffleItems, resetKey]);

  const evaluate = useCallback(
    (candidatePlacements: ZonePlacements<T>, upcomingAttempts: number) => {
      const correct = Object.entries(candidatePlacements).reduce((sum, [zoneId, zoneItems]) => {
        const zoneCorrect = zoneItems.filter((item) => item.targetId === zoneId).length;
        return sum + zoneCorrect;
      }, 0);

      const nextScore = totalItems === 0 ? 0 : Math.round((correct / totalItems) * 100);
      setScore(nextScore);

      if (!completed && totalItems > 0 && correct === totalItems) {
        setCompleted(true);
        onComplete?.({
          score: nextScore,
          attempts: upcomingAttempts,
          placements: candidatePlacements
        });
      }
    },
    [completed, onComplete, totalItems]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      const updatedAvailable = [...availableItems];
      const updatedPlacements = Object.keys(placements).reduce<ZonePlacements<T>>((acc, key) => {
        acc[key] = [...placements[key]];
        return acc;
      }, {});

      const sourceZone = zoneFromDroppableId(source.droppableId);
      const destinationZone = zoneFromDroppableId(destination.droppableId);

      let movingItem: T | undefined;
      if (sourceZone) {
        movingItem = updatedPlacements[sourceZone].splice(source.index, 1)[0];
      } else if (source.droppableId === AVAILABLE_ITEMS_DROPPABLE) {
        movingItem = updatedAvailable.splice(source.index, 1)[0];
      }

      if (!movingItem) return;

      if (destinationZone) {
        updatedPlacements[destinationZone].splice(destination.index, 0, movingItem);
      } else if (destination.droppableId === AVAILABLE_ITEMS_DROPPABLE) {
        updatedAvailable.splice(destination.index, 0, movingItem);
      } else {
        return;
      }

      setAvailableItems(updatedAvailable);
      setPlacements(updatedPlacements);
      setAttempts((prev) => {
        const upcomingAttempts = prev + 1;
        evaluate(updatedPlacements, upcomingAttempts);
        return upcomingAttempts;
      });
    },
    [availableItems, placements, evaluate]
  );

  const reset = useCallback(() => {
    const initialPlacements = buildPlacements<T>(zoneIds);
    setPlacements(initialPlacements);
    setAvailableItems(shuffleItems ? shuffle(items) : [...items]);
    setAttempts(0);
    setScore(0);
    setCompleted(false);
  }, [items, shuffleItems, zoneIds]);

  return {
    AVAILABLE_ITEMS_DROPPABLE,
    availableItems,
    placements,
    attempts,
    score,
    completed,
    handleDragEnd,
    reset,
    getZoneDroppableId
  };
}

export { AVAILABLE_ITEMS_DROPPABLE };
