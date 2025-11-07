'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ArrowDownRight, ArrowUpRight, Calendar, PiggyBank, RotateCcw, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type CashFlowTimelineActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type CashFlowTimelineActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'cash-flow-timeline';
  props: CashFlowTimelineActivityProps;
};

interface CashFlowTimelineProps {
  activity: CashFlowTimelineActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type CashFlowItem = CashFlowTimelineActivityProps['cashFlowItems'][number] & CategorizationItem;
type TimelinePeriod = CashFlowTimelineActivityProps['periods'][number];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export function CashFlowTimeline({ activity, onSubmit }: CashFlowTimelineProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);

  const sortedPeriods = useMemo<TimelinePeriod[]>(
    () => [...activity.props.periods].sort((a, b) => a.order - b.order),
    [activity.props.periods]
  );
  const zoneIds = useMemo(() => sortedPeriods.map((period) => period.id), [sortedPeriods]);
  const items = useMemo<CashFlowItem[]>(
    () =>
      activity.props.cashFlowItems.map((item) => ({
        ...item,
        targetId: item.periodId
      })),
    [activity.props.cashFlowItems]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, CashFlowItem[]> }) => {
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

  const timelineStats = useMemo(() => {
    let runningBalance = activity.props.startingCash ?? 0;
    return sortedPeriods.map((period) => {
      const periodItems = placements[period.id] ?? [];
      const netFlow = periodItems.reduce((sum, item) => sum + (item.direction === 'inflow' ? item.amount : -item.amount), 0);
      runningBalance += netFlow;
      return {
        period,
        items: periodItems,
        netFlow,
        endingBalance: runningBalance
      };
    });
  }, [activity.props.startingCash, placements, sortedPeriods]);

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{activity.props.title}</CardTitle>
          <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <PiggyBank className="h-4 w-4" />
            Starting cash: {currencyFormatter.format(activity.props.startingCash ?? 0)}
          </Badge>
          {completed && <Badge variant="default">Timeline locked in ✅</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showHints} onChange={() => setShowHints((prev) => !prev)} className="h-4 w-4" />
            Show scenario hints
          </label>
          <div className="inline-flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Drag every inflow/outflow into the week when the cash actually moves.
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Cash flow queue</h3>
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
                    className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3 min-h-[220px]"
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
                              <Badge variant={item.direction === 'inflow' ? 'secondary' : 'destructive'}>
                                {item.direction === 'inflow' ? '+' : '-'}
                                {currencyFormatter.format(Math.abs(item.amount))}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {showHints && item.category && (
                              <p className="mt-1 text-xs text-muted-foreground/80">Category: {item.category}</p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All cash events scheduled—double-check timing.</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {timelineStats.map(({ period, items: periodItems, netFlow, endingBalance }) => (
                <div key={period.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold">{period.label}</p>
                      <p className="text-sm text-muted-foreground">{period.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant={netFlow >= 0 ? 'secondary' : 'destructive'} className="flex items-center gap-1">
                        {netFlow >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {netFlow >= 0 ? '+' : '-'}{currencyFormatter.format(Math.abs(netFlow))}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1',
                          period.highlightThreshold !== undefined && endingBalance < period.highlightThreshold && 'border-destructive text-destructive'
                        )}
                      >
                        Balance: {currencyFormatter.format(endingBalance)}
                      </Badge>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <Droppable droppableId={getZoneDroppableId(period.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[130px]"
                      >
                        {periodItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(dragProvided, snapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={cn(
                                  'rounded-lg border bg-card p-3 transition',
                                  attempts > 0 && (item.targetId === period.id ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'),
                                  snapshot.isDragging && 'ring-2 ring-primary'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium">{item.label}</p>
                                  <Badge variant={item.direction === 'inflow' ? 'secondary' : 'destructive'}>
                                    {item.direction === 'inflow' ? '+' : '-'}
                                    {currencyFormatter.format(Math.abs(item.amount))}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                {showHints && item.hint && (
                                  <p className="mt-1 text-xs text-muted-foreground/80">Hint: {item.hint}</p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {periodItems.length === 0 && (
                          <p className="text-center text-xs text-muted-foreground">Drop cash events for this period</p>
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
