'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { HelpCircle, RotateCcw, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type RatioMatchingActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type RatioMatchingActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'ratio-matching';
  props: RatioMatchingActivityProps;
};

interface RatioMatchingProps {
  activity: RatioMatchingActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type RatioItem = RatioMatchingActivityProps['ratios'][number] & CategorizationItem;

export function RatioMatching({ activity, onSubmit }: RatioMatchingProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);

  const formulaZones = activity.props.formulaZones;
  const zoneIds = useMemo(() => formulaZones.map((zone) => zone.id), [formulaZones]);
  const ratios = useMemo<RatioItem[]>(
    () =>
      activity.props.ratios.map((ratio) => ({
        ...ratio,
        targetId: activity.props.formulaZones.find((zone) => zone.expectedRatioId === ratio.id)?.id ?? ''
      })),
    [activity.props.formulaZones, activity.props.ratios]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, RatioItem[]> }) => {
      const responses = Object.fromEntries(
        Object.entries(placements).map(([zoneId, zoneItems]) => [zoneId, zoneItems.map((item) => item.id)])
      );
      onSubmit?.({
        activityId: activity.id,
        score,
        attempts,
        responses,
        completedAt: new Date()
      });
    },
    [activity.id, onSubmit]
  );

  const { availableItems, placements, attempts, score, completed, handleDragEnd, reset } = useCategorizationExercise(ratios, zoneIds, {
    shuffleItems: activity.props.shuffleItems,
    resetKey: activity.id,
    onComplete: handleCompletion
  });

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{activity.props.title}</CardTitle>
          <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">Complete</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showHints} onChange={() => setShowHints((prev) => !prev)} className="h-4 w-4" />
            Show ratio guidance
          </label>
          <div className="inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Match each financial ratio to the formula that calculates it.
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="gap-2 text-xs">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Ratios</h3>
              <Droppable droppableId={AVAILABLE_ITEMS_DROPPABLE}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3 min-h-[200px]"
                  >
                    {availableItems.map((ratio, index) => (
                      <Draggable key={ratio.id} draggableId={ratio.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              'rounded-lg border bg-card p-3 transition',
                              snapshot.isDragging && 'ring-2 ring-primary'
                            )}
                          >
                            <p className="font-semibold">{ratio.name}</p>
                            <p className="text-xs text-muted-foreground">{ratio.description}</p>
                            {showHints && ratio.businessMeaning && (
                              <p className="mt-1 text-xs text-muted-foreground/80">{ratio.businessMeaning}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All ratios placed</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {formulaZones.map((zone) => (
                <div key={zone.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex items-center gap-2 pb-3">
                    {zone.emoji && <span>{zone.emoji}</span>}
                    <div>
                      <p className="text-lg font-semibold">{zone.title}</p>
                      <p className="text-sm font-mono text-muted-foreground">{zone.formula}</p>
                    </div>
                  </div>
                  <Droppable droppableId={getZoneDroppableId(zone.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[120px]"
                      >
                        {(placements[zone.id] ?? []).map((ratio, index) => {
                          const isCorrect = ratio.targetId === zone.id;
                          return (
                            <Draggable key={ratio.id} draggableId={ratio.id} index={index}>
                              {(dragProvided, snapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={cn(
                                    'rounded-lg border bg-card p-3 text-sm transition',
                                    attempts > 0 && (isCorrect ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'),
                                    snapshot.isDragging && 'ring-2 ring-primary'
                                  )}
                                >
                                  <p className="font-medium">{ratio.name}</p>
                                  {showHints && ratio.goodRange && (
                                    <p className="text-xs text-muted-foreground">Good range: {ratio.goodRange}</p>
                                  )}
                                  {showHints && ratio.whyItMatters && (
                                    <p className="text-xs text-muted-foreground/80">{ratio.whyItMatters}</p>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {(placements[zone.id] ?? []).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center">Drop the matching ratio here</p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </section>
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
