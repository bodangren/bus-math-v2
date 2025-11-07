'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { CheckCircle, Lightbulb, RotateCcw, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type DragAndDropActivityProps } from '@/lib/db/schema/activities';
import { type Activity } from '@/lib/db/schema/validators';

interface MatchingItem {
  id: string;
  content: string;
  matchId: string;
  category?: string;
  hint?: string;
  description?: string;
}

interface DropZone {
  id: string;
  targetItem: MatchingItem;
}

interface DroppedMatch {
  item: MatchingItem;
  isCorrect: boolean;
}

export type DragAndDropActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'drag-and-drop';
  props: DragAndDropActivityProps;
};

interface DragAndDropProps {
  activity: DragAndDropActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string>;
    completedAt: Date;
  }) => void;
}

const AVAILABLE_DROPPABLE_ID = 'available-items';

const shuffleArray = <T,>(items: T[]) => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

const buildColumns = (items: MatchingItem[]) => {
  const left: MatchingItem[] = [];
  const right: MatchingItem[] = [];
  const used = new Set<string>();

  for (const item of items) {
    if (used.has(item.id)) continue;
    const match = items.find((candidate) => candidate.id === item.matchId);
    if (match) {
      left.push(item);
      right.push(match);
      used.add(item.id);
      used.add(match.id);
    }
  }

  return { left, right };
};

export function DragAndDrop({ activity, onSubmit }: DragAndDropProps) {
  const { items, leftColumnTitle, rightColumnTitle, showHints, shuffleItems } = activity.props;

  const { left, right } = useMemo(() => buildColumns(items as MatchingItem[]), [items]);

  const [availableItems, setAvailableItems] = useState<MatchingItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [placements, setPlacements] = useState<Record<string, DroppedMatch | null>>({});
  const placementsRef = useRef<Record<string, DroppedMatch | null>>({});
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(showHints);

  useEffect(() => {
    const sourceItems = shuffleItems ? shuffleArray(left) : left;
    const zones: DropZone[] = right.map((target) => ({
      id: target.id,
      targetItem: target,
    }));

    const initialPlacements = zones.reduce<Record<string, DroppedMatch | null>>((acc, zone) => {
      acc[zone.id] = null;
      return acc;
    }, {});

    placementsRef.current = initialPlacements;
    setAvailableItems(sourceItems);
    setDropZones(zones);
    setPlacements(initialPlacements);
    setAttempts(0);
    setScore(0);
    setCompleted(false);
  }, [left, right, shuffleItems]);

  const evaluate = (updatedPlacements: Record<string, DroppedMatch | null>, upcomingAttempts: number) => {
    const total = dropZones.length;
    const correct = Object.values(updatedPlacements).filter((placement) => placement?.isCorrect).length;
    const nextScore = total === 0 ? 0 : Math.round((correct / total) * 100);
    setScore(nextScore);

    if (total > 0 && correct === total && !completed) {
      setCompleted(true);
      const responses = Object.entries(updatedPlacements).reduce<Record<string, string>>((acc, [zoneId, placement]) => {
        if (placement?.item) {
          acc[zoneId] = placement.item.id;
        }
        return acc;
      }, {});
      onSubmit?.({
        activityId: activity.id,
        score: nextScore,
        attempts: upcomingAttempts,
        responses,
        completedAt: new Date(),
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceZoneId = source.droppableId.startsWith('zone-') ? source.droppableId.replace('zone-', '') : null;
    const destinationZoneId = destination.droppableId.startsWith('zone-') ? destination.droppableId.replace('zone-', '') : null;

    setAvailableItems((prevAvailable) => {
      let movingItem: MatchingItem | undefined;
      const updatedAvailable = [...prevAvailable];
      const updatedPlacements = { ...placementsRef.current };

      if (sourceZoneId) {
        movingItem = placements[sourceZoneId]?.item ?? undefined;
        updatedPlacements[sourceZoneId] = null;
      } else {
        movingItem = prevAvailable[source.index];
        updatedAvailable.splice(source.index, 1);
      }

      if (!movingItem) {
        return prevAvailable;
      }

      if (destinationZoneId) {
        const zone = dropZones.find((z) => z.id === destinationZoneId);
        if (!zone) return prevAvailable;

        const displaced = updatedPlacements[destinationZoneId];
        if (displaced?.item) {
          updatedAvailable.splice(destination.index, 0, displaced.item);
        }

        const isCorrect = movingItem.id === zone.targetItem.matchId;
        updatedPlacements[destinationZoneId] = { item: movingItem, isCorrect };
      } else {
        updatedAvailable.splice(destination.index, 0, movingItem);
      }

      placementsRef.current = updatedPlacements;
      setPlacements(updatedPlacements);
      setAttempts((prev) => {
        const upcomingAttempts = prev + 1;
        evaluate(updatedPlacements, upcomingAttempts);
        return upcomingAttempts;
      });
      return updatedAvailable;
    });
  };

  const resetExercise = () => {
    const reshuffled = shuffleItems ? shuffleArray(left) : left;
    const resetPlacements = dropZones.reduce<Record<string, DroppedMatch | null>>((acc, zone) => {
      acc[zone.id] = null;
      return acc;
    }, {});
    placementsRef.current = resetPlacements;
    setAvailableItems(reshuffled);
    setPlacements(resetPlacements);
    setScore(0);
    setAttempts(0);
    setCompleted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Target className="h-6 w-6 text-muted-foreground" />
          {activity.props.title}
          <Badge variant={completed ? 'default' : 'secondary'} className="ml-auto">
            {score}% correct
          </Badge>
        </CardTitle>
        <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Attempts: {attempts}</span>
          <span>Available: {availableItems.length}</span>
          <div className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            <label className="inline-flex items-center gap-1 text-sm">
              <input
                aria-label="Toggle hints"
                checked={hintsEnabled}
                className="h-4 w-4"
                onChange={() => setHintsEnabled((prev) => !prev)}
                type="checkbox"
              />
              Show hints
            </label>
          </div>
          <Button onClick={resetExercise} size="sm" variant="ghost" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <header className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{leftColumnTitle}</h3>
                <Badge variant="outline">{availableItems.length} items</Badge>
              </header>
              <Droppable droppableId={AVAILABLE_DROPPABLE_ID}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 p-4 min-h-[200px]"
                  >
                    {availableItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              'rounded-md border bg-background p-3 shadow-sm transition',
                              snapshot.isDragging && 'border-primary bg-primary/5'
                            )}
                          >
                            <p className="font-medium">{item.content}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
            <section>
              <header className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{rightColumnTitle}</h3>
                <Badge variant="outline">{dropZones.length} matches</Badge>
              </header>
              <div className="space-y-4">
                {dropZones.map((zone) => {
                  const placement = placements[zone.id];
                  const isCorrect = placement?.isCorrect;
                  return (
                    <Droppable droppableId={`zone-${zone.id}`} key={zone.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            'rounded-lg border p-4 transition',
                            isCorrect && 'border-green-500 bg-green-50',
                            placement && !isCorrect && 'border-red-400 bg-red-50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{zone.targetItem.content}</p>
                              {zone.targetItem.description && (
                                <p className="text-sm text-muted-foreground">{zone.targetItem.description}</p>
                              )}
                            </div>
                            {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" aria-label="Correct match" />}
                          </div>
                          <div className="mt-3 min-h-[48px]">
                            {placement ? (
                              <div className="rounded-md border bg-background/70 p-3">
                                <p>{placement.item.content}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Drag an item here</p>
                            )}
                          </div>
                          {hintsEnabled && zone.targetItem.hint && (
                            <p className="mt-2 text-sm text-muted-foreground">Hint: {zone.targetItem.hint}</p>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </section>
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
