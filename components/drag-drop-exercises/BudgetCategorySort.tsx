'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { DollarSign, Lightbulb, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type BudgetCategorySortActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type BudgetCategorySortActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'budget-category-sort';
  props: BudgetCategorySortActivityProps;
};

interface BudgetCategorySortProps {
  activity: BudgetCategorySortActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type BudgetItem = BudgetCategorySortActivityProps['expenses'][number] & CategorizationItem;

const impactBadge = (impact: BudgetItem['impact']) => {
  switch (impact) {
    case 'high':
      return 'destructive';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function BudgetCategorySort({ activity, onSubmit }: BudgetCategorySortProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);

  const categories = activity.props.categories;
  const zoneIds = useMemo(() => categories.map((category) => category.id), [categories]);
  const items = useMemo<BudgetItem[]>(
    () =>
      activity.props.expenses.map((expense) => ({
        ...expense,
        targetId: expense.categoryId
      })),
    [activity.props.expenses]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, BudgetItem[]> }) => {
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

  const totalBudgetPlaced = useMemo(
    () =>
      Object.values(placements).flat().reduce((sum, expense) => {
        return sum + expense.amount;
      }, 0),
    [placements]
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{activity.props.title}</CardTitle>
          <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Placed budget: ${totalBudgetPlaced.toLocaleString()}
          </Badge>
          <Badge variant="outline">Score: {score}%</Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">Completed</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showHints} onChange={() => setShowHints((prev) => !prev)} className="h-4 w-4" />
            Show budgeting hints
          </label>
          <div className="inline-flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Match each café expense to the budget category it belongs to.
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Expense pool</h3>
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
                              'rounded-lg border bg-card p-3 transition',
                              snapshot.isDragging && 'ring-2 ring-primary'
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold">{item.label}</p>
                              <Badge variant={impactBadge(item.impact)}>${item.amount.toLocaleString()}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {showHints && item.cafeContext && (
                              <p className="mt-2 text-xs text-muted-foreground/80">{item.cafeContext}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All expenses are categorized—great work!</p>
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
                      <p className="text-lg font-semibold">{category.emoji} {category.title}</p>
                      {category.profitImpact && <Badge variant="secondary">{category.profitImpact}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    {showHints && category.strategyNote && (
                      <p className="text-xs text-muted-foreground/80">Hint: {category.strategyNote}</p>
                    )}
                  </div>
                  <Droppable droppableId={getZoneDroppableId(category.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="mt-2 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[120px]"
                      >
                        {(placements[category.id] ?? []).map((item, index) => {
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
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium">{item.label}</p>
                                    <Badge variant="outline">${item.amount.toLocaleString()}</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {(placements[category.id] ?? []).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center">Drop expenses here</p>
                        )}
                      </div>
                    )}
                  </Droppable>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Total</span>
                    <span>
                      $
                      {(placements[category.id] ?? [])
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
