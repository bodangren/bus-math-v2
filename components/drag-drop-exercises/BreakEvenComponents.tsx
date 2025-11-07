'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Calculator, LineChart, Percent, RotateCcw, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type BreakEvenComponentsActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type BreakEvenComponentsActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'break-even-components';
  props: BreakEvenComponentsActivityProps;
};

interface BreakEvenComponentsProps {
  activity: BreakEvenComponentsActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type CostItem = BreakEvenComponentsActivityProps['costItems'][number] & CategorizationItem;

type Totals = {
  fixedCosts: number;
  variablePerUnit: number;
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1
});

export function BreakEvenComponents({ activity, onSubmit }: BreakEvenComponentsProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);
  const [unitPrice, setUnitPrice] = useState(activity.props.salesAssumptions.pricePerUnit);

  useEffect(() => {
    setShowHints(activity.props.showHintsByDefault);
  }, [activity.props.showHintsByDefault, activity.id]);

  useEffect(() => {
    setUnitPrice(activity.props.salesAssumptions.pricePerUnit);
  }, [activity.props.salesAssumptions.pricePerUnit, activity.id]);

  const categories = activity.props.categories;
  const zoneIds = useMemo(() => categories.map((category) => category.id), [categories]);
  const items = useMemo<CostItem[]>(
    () =>
      activity.props.costItems.map((item) => ({
        ...item,
        targetId: item.categoryId
      })),
    [activity.props.costItems]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, CostItem[]> }) => {
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

  const totals = useMemo<Totals>(() => {
    let fixedCosts = 0;
    let variablePerUnit = 0;

    categories.forEach((category) => {
      const bucketTotal = (placements[category.id] ?? []).reduce((sum, cost) => sum + cost.amount, 0);
      if (category.behavior === 'fixed') {
        fixedCosts += bucketTotal;
      } else if (category.behavior === 'variable') {
        variablePerUnit += bucketTotal;
      }
    });

    const contributionMargin = unitPrice - variablePerUnit;
    const breakEvenUnits = contributionMargin <= 0 ? 0 : Math.ceil(fixedCosts / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * unitPrice;

    return {
      fixedCosts,
      variablePerUnit,
      contributionMargin,
      breakEvenUnits,
      breakEvenRevenue
    };
  }, [categories, placements, unitPrice]);

  const minPrice = activity.props.salesAssumptions.minPrice ?? activity.props.salesAssumptions.pricePerUnit;
  const maxPriceCandidate = activity.props.salesAssumptions.maxPrice ?? Math.max(minPrice, activity.props.salesAssumptions.pricePerUnit * 2);
  const maxPrice = Math.max(minPrice, maxPriceCandidate);
  const step = activity.props.salesAssumptions.step ?? 1;

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
          {completed && <Badge variant="default">Break-even set 🎯</Badge>}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-muted-foreground">Unit price ({activity.props.salesAssumptions.unitLabel ?? 'units'})</p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                step={step}
                value={unitPrice}
                onChange={(event) => setUnitPrice(Number(event.target.value))}
                className="flex-1"
              />
              <div className="rounded-md border bg-background px-3 py-1 text-sm font-semibold">
                {currencyFormatter.format(unitPrice)}
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-semibold">Why drag/drop matters</p>
            <p>Every correct placement feeds into the break-even math below. Fixed costs pile up, variable costs eat into every unit, and price sets your revenue line.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-lg border bg-background p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">Fixed costs</p>
            <p className="text-lg font-semibold text-red-600">{currencyFormatter.format(totals.fixedCosts)}</p>
          </div>
          <div className="rounded-lg border bg-background p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">Variable / unit</p>
            <p className="text-lg font-semibold text-orange-600">{currencyFormatter.format(totals.variablePerUnit)}</p>
          </div>
          <div className="rounded-lg border bg-background p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">Contribution margin</p>
            <p className={cn('text-lg font-semibold', totals.contributionMargin > 0 ? 'text-emerald-600' : 'text-destructive')}>
              {currencyFormatter.format(totals.contributionMargin)}
            </p>
          </div>
          <div className="rounded-lg border bg-background p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">Break-even units</p>
            <p className="text-lg font-semibold text-sky-600">{numberFormatter.format(totals.breakEvenUnits)}</p>
          </div>
          <div className="rounded-lg border bg-background p-3 text-center">
            <p className="text-xs uppercase text-muted-foreground">Break-even revenue</p>
            <p className="text-lg font-semibold text-primary">{currencyFormatter.format(totals.breakEvenRevenue)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showHints} onChange={() => setShowHints((prev) => !prev)} className="h-4 w-4" />
            Show cost hints
          </label>
          <div className="inline-flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Correct placements fuel the break-even calculation.
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Cost pool</h3>
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
                            className={cn('rounded-lg border bg-card p-3 transition', snapshot.isDragging && 'ring-2 ring-primary')}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold">{item.label}</p>
                              <Badge variant="secondary">{currencyFormatter.format(item.amount)}</Badge>
                            </div>
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
                      <p className="text-center text-sm text-muted-foreground">All costs placed—fine tune as needed.</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                    <div>
                      <p className="text-lg font-semibold">
                        {category.emoji} {category.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      {showHints && category.whyItMatters && (
                        <p className="text-xs text-muted-foreground/80">Why it matters: {category.whyItMatters}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      {category.behavior === 'fixed' ? <LineChart className="h-3 w-3" /> : <Percent className="h-3 w-3" />}
                      {currencyFormatter.format((placements[category.id] ?? []).reduce((sum, cost) => sum + cost.amount, 0))}
                    </Badge>
                  </div>
                  <Separator />
                  <Droppable droppableId={getZoneDroppableId(category.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[120px]"
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
                                    <Badge variant="secondary">{currencyFormatter.format(item.amount)}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  {showHints && item.realWorldExample && (
                                    <p className="mt-1 text-xs text-muted-foreground/80">Scenario: {item.realWorldExample}</p>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {(placements[category.id] ?? []).length === 0 && (
                          <p className="text-center text-xs text-muted-foreground">Drop costs here</p>
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
