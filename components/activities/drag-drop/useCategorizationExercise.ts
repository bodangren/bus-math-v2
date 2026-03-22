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

  const moveItemToZone = useCallback(
    (itemId: string, destinationZoneId: string | null) => {
      const updatedAvailable = [...availableItems];
      const updatedPlacements = Object.keys(placements).reduce<ZonePlacements<T>>((acc, key) => {
        acc[key] = [...placements[key]];
        return acc;
      }, {});

      let movingItem: T | undefined;
      const availableIndex = updatedAvailable.findIndex((item) => item.id === itemId);

      if (availableIndex >= 0) {
        movingItem = updatedAvailable.splice(availableIndex, 1)[0];
      } else {
        for (const zoneId of zoneIds) {
          const zoneIndex = updatedPlacements[zoneId]?.findIndex((item) => item.id === itemId) ?? -1;
          if (zoneIndex >= 0) {
            movingItem = updatedPlacements[zoneId].splice(zoneIndex, 1)[0];
            break;
          }
        }
      }

      if (!movingItem) {
        return;
      }

      if (destinationZoneId && updatedPlacements[destinationZoneId]) {
        updatedPlacements[destinationZoneId].splice(updatedPlacements[destinationZoneId].length, 0, movingItem);
      } else {
        updatedAvailable.splice(updatedAvailable.length, 0, movingItem);
      }

      const upcomingAttempts = attempts + 1;
      setAvailableItems(updatedAvailable);
      setPlacements(updatedPlacements);
      setAttempts(upcomingAttempts);
      evaluate(updatedPlacements, upcomingAttempts);
    },
    [attempts, availableItems, evaluate, placements, zoneIds],
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      const sourceZone = zoneFromDroppableId(source.droppableId);
      const destinationZone = zoneFromDroppableId(destination.droppableId);
      if (!destinationZone && destination.droppableId !== AVAILABLE_ITEMS_DROPPABLE) {
        return;
      }

      moveItemToZone(
        sourceZone
          ? (placements[sourceZone][source.index]?.id ?? '')
          : availableItems[source.index]?.id ?? '',
        destinationZone,
      );
    },
    [availableItems, moveItemToZone, placements]
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
    moveItemToZone,
    reset,
    getZoneDroppableId
  };
}

export { AVAILABLE_ITEMS_DROPPABLE };
