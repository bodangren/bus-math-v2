'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { HelpCircle, RotateCcw, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type AccountCategorizationActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type AccountCategorizationActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'account-categorization';
  props: AccountCategorizationActivityProps;
};

interface AccountCategorizationProps {
  activity: AccountCategorizationActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type AccountItem = AccountCategorizationActivityProps['accounts'][number] & CategorizationItem;

export function AccountCategorization({ activity, onSubmit }: AccountCategorizationProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);

  const categories = activity.props.categories;
  const zoneIds = useMemo(() => categories.map((category) => category.id), [categories]);
  const items = useMemo<AccountItem[]>(
    () =>
      activity.props.accounts.map((account) => ({
        ...account,
        targetId: account.categoryId
      })),
    [activity.props.accounts]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, AccountItem[]> }) => {
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

  const { availableItems, placements, attempts, score, completed, handleDragEnd, reset } = useCategorizationExercise(items, zoneIds, {
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
            <Target className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">Completed 🎉</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showHints} onChange={() => setShowHints((prev) => !prev)} className="h-4 w-4" />
            Show context hints
          </label>
          <div className="inline-flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Drag each account into the correct category to reinforce the accounting equation.
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Account bank</h3>
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
                    {availableItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              'rounded-lg border bg-card p-3 shadow-sm transition',
                              snapshot.isDragging && 'ring-2 ring-primary'
                            )}
                          >
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {showHints && item.realWorldExample && (
                              <p className="mt-2 text-xs text-muted-foreground/80">Example: {item.realWorldExample}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All accounts placed. Adjust if needed!</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-col gap-1 pb-3">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">
                        {category.emoji} {category.name}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    {showHints && category.whyItMatters && (
                      <p className="text-xs text-muted-foreground/80">Why it matters: {category.whyItMatters}</p>
                    )}
                  </div>
                  <Separator />
                  <Droppable droppableId={getZoneDroppableId(category.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[120px]"
                      >
                        {placements[category.id]?.map((item, index) => {
                          const isCorrect = item.targetId === category.id;
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
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
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  {showHints && item.realWorldExample && (
                                    <p className="mt-1 text-xs text-muted-foreground/80">Real-world: {item.realWorldExample}</p>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {placements[category.id]?.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center">Drop accounts here</p>
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
