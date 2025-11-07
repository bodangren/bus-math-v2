'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Calculator, Percent, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type PercentageCalculationSortingActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type PercentageCalculationSortingActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'percentage-calculation-sorting';
  props: PercentageCalculationSortingActivityProps;
};

interface PercentageCalculationSortingProps {
  activity: PercentageCalculationSortingActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type ScenarioItem = PercentageCalculationSortingActivityProps['scenarios'][number] & CategorizationItem;

const difficultyBadge = (difficulty: ScenarioItem['difficulty']) => {
  switch (difficulty) {
    case 'easy':
      return 'secondary';
    case 'hard':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function PercentageCalculationSorting({ activity, onSubmit }: PercentageCalculationSortingProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);

  const calculationTypes = activity.props.calculationTypes;
  const zoneIds = useMemo(() => calculationTypes.map((category) => category.id), [calculationTypes]);
  const scenarios = useMemo<ScenarioItem[]>(
    () =>
      activity.props.scenarios.map((scenario) => ({
        ...scenario,
        targetId: scenario.calculationTypeId
      })),
    [activity.props.scenarios]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, ScenarioItem[]> }) => {
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

  const { availableItems, placements, attempts, score, completed, handleDragEnd, reset } = useCategorizationExercise(scenarios, zoneIds, {
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
            <Percent className="h-4 w-4" />
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
            Show formula hints
          </label>
          <div className="inline-flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Identify which percentage calculation fits each business scenario.
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Scenarios</h3>
                <Button variant="ghost" size="sm" onClick={reset} className="gap-2 text-xs">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
              <Droppable droppableId={AVAILABLE_ITEMS_DROPPABLE}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3 min-h-[200px]"
                  >
                    {availableItems.map((scenario, index) => (
                      <Draggable key={scenario.id} draggableId={scenario.id} index={index}>
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
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold">{scenario.prompt}</p>
                              <Badge variant={difficultyBadge(scenario.difficulty)} className="text-xxs">
                                {scenario.difficulty.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{scenario.dataPoints}</p>
                            {showHints && scenario.businessContext && (
                              <p className="mt-2 text-xs text-muted-foreground/80">{scenario.businessContext}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All calculations placed</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {calculationTypes.map((calculation) => (
                <div key={calculation.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-col gap-1 pb-3">
                    <p className="text-lg font-semibold">{calculation.title}</p>
                    <p className="text-sm text-muted-foreground">{calculation.description}</p>
                    {showHints && (
                      <div className="text-xs text-muted-foreground/80">
                        <p className="font-semibold">Formula: {calculation.formula}</p>
                        {calculation.applications && <p>Applications: {calculation.applications.join(', ')}</p>}
                      </div>
                    )}
                  </div>
                  <Droppable droppableId={getZoneDroppableId(calculation.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[120px]"
                      >
                        {(placements[calculation.id] ?? []).map((scenario, index) => {
                          const isCorrect = scenario.targetId === calculation.id;
                          return (
                            <Draggable key={scenario.id} draggableId={scenario.id} index={index}>
                              {(dragProvided, snapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={cn(
                                    'rounded-lg border bg-card p-3 transition',
                                    attempts > 0 && (isCorrect ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'),
                                    snapshot.isDragging && 'ring-2 ring-primary'
                                  )}
                                >
                                  <p className="font-medium">{scenario.prompt}</p>
                                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {(placements[calculation.id] ?? []).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center">Drop scenarios here</p>
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
