'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ArrowDownRight, ArrowUpRight, RotateCcw, Scale, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type TrialBalanceSortingActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type TrialBalanceSortingActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'trial-balance-sorting';
  props: TrialBalanceSortingActivityProps;
};

interface TrialBalanceSortingProps {
  activity: TrialBalanceSortingActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type TrialBalanceAccount = TrialBalanceSortingActivityProps['accounts'][number] & CategorizationItem;

type BalanceTotals = {
  debitTotal: number;
  creditTotal: number;
  difference: number;
  bySide: Record<string, number>;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export function TrialBalanceSorting({ activity, onSubmit }: TrialBalanceSortingProps) {
  const [showBadges, setShowBadges] = useState(activity.props.showCategoryBadges);

  const sides = activity.props.sides;
  const sideLookup = useMemo(() => Object.fromEntries(sides.map((side) => [side.id, side])), [sides]);
  const zoneIds = useMemo(() => sides.map((side) => side.id), [sides]);
  const items = useMemo<TrialBalanceAccount[]>(
    () =>
      activity.props.accounts.map((account) => ({
        ...account,
        targetId: account.sideId
      })),
    [activity.props.accounts]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, TrialBalanceAccount[]> }) => {
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

  const totals = useMemo<BalanceTotals>(() => {
    return sides.reduce<BalanceTotals>(
      (acc, side) => {
        const total = (placements[side.id] ?? []).reduce((sum, account) => sum + account.amount, 0);
        acc.bySide[side.id] = total;
        if (side.type === 'debit') {
          acc.debitTotal += total;
        } else {
          acc.creditTotal += total;
        }
        acc.difference = Math.abs(acc.debitTotal - acc.creditTotal);
        return acc;
      },
      { debitTotal: 0, creditTotal: 0, difference: 0, bySide: {} }
    );
  }, [placements, sides]);

  const balanced = totals.difference < 0.01 && totals.debitTotal > 0 && totals.creditTotal > 0;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{activity.props.title}</CardTitle>
          <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            Debits: {currencyFormatter.format(totals.debitTotal)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            Credits: {currencyFormatter.format(totals.creditTotal)}
          </Badge>
          {balanced && <Badge variant="default">Balanced ✅</Badge>}
          {completed && <Badge variant="secondary">Submitted 🧾</Badge>}
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          {balanced ? (
            <p>The cafe&rsquo;s trial balance is balanced! Every debit has a matching credit.</p>
          ) : (
            <p>Drag each account into the side that reflects its normal balance. When totals match, the difference badge disappears.</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showBadges} onChange={() => setShowBadges((prev) => !prev)} className="h-4 w-4" />
            Show account category badges
          </label>
          <div className="inline-flex items-center gap-2">
            {balanced ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            Difference: {currencyFormatter.format(totals.difference)}
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Accounts</h3>
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
                    {availableItems.map((account, index) => {
                      const accountSide = sideLookup[account.sideId];
                      const badgeVariant = accountSide?.type === 'debit' ? 'secondary' : 'outline';
                      return (
                      <Draggable key={account.id} draggableId={account.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn('rounded-lg border bg-card p-3 transition', snapshot.isDragging && 'ring-2 ring-primary')}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold">{account.name}</p>
                              <Badge variant={badgeVariant}>
                                {currencyFormatter.format(account.amount)}
                              </Badge>
                            </div>
                            {showBadges && <p className="text-xs text-muted-foreground">{account.category}</p>}
                          </div>
                        )}
                      </Draggable>
                    );
                    })}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All accounts placed—adjust as needed.</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {sides.map((side) => (
                <div key={side.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                    <div>
                      <p className="text-lg font-semibold">{side.label}</p>
                      <p className="text-sm text-muted-foreground">{side.description}</p>
                    </div>
                    <Badge variant="outline">{currencyFormatter.format(totals.bySide[side.id] ?? 0)}</Badge>
                  </div>
                  <Separator />
                  <Droppable droppableId={getZoneDroppableId(side.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[130px]"
                      >
                        {(placements[side.id] ?? []).map((account, index) => {
                          const isCorrect = account.targetId === side.id;
                          const sideMeta = sideLookup[side.id];
                          return (
                            <Draggable key={account.id} draggableId={account.id} index={index}>
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
                                    <p className="font-medium">{account.name}</p>
                                    <Badge variant={sideMeta?.type === 'debit' ? 'secondary' : 'destructive'}>
                                      {currencyFormatter.format(account.amount)}
                                    </Badge>
                                  </div>
                                  {showBadges && <p className="text-xs text-muted-foreground">{account.category}</p>}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {(placements[side.id] ?? []).length === 0 && (
                          <p className="text-center text-xs text-muted-foreground">Drop accounts here</p>
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
