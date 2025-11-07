'use client';

import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { BookText, RotateCcw, Scale } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type FinancialStatementMatchingActivityProps } from '@/lib/db/schema/activities';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem
} from './useCategorizationExercise';

export type FinancialStatementMatchingActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'financial-statement-matching';
  props: FinancialStatementMatchingActivityProps;
};

interface FinancialStatementMatchingProps {
  activity: FinancialStatementMatchingActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type StatementItem = FinancialStatementMatchingActivityProps['lineItems'][number] & CategorizationItem;

export function FinancialStatementMatching({ activity, onSubmit }: FinancialStatementMatchingProps) {
  const [showHints, setShowHints] = useState(activity.props.showHintsByDefault);

  const statements = activity.props.statements;
  const zoneIds = useMemo(() => statements.map((statement) => statement.id), [statements]);
  const items = useMemo<StatementItem[]>(
    () =>
      activity.props.lineItems.map((item) => ({
        ...item,
        targetId: item.statementId
      })),
    [activity.props.lineItems]
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, StatementItem[]> }) => {
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
            <Scale className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">All statements balanced 🎉</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={showHints} onChange={() => setShowHints((prev) => !prev)} className="h-4 w-4" />
            Show hints about each item
          </label>
          <div className="inline-flex items-center gap-2">
            <BookText className="h-4 w-4" />
            Remember: profitability lives on the income statement; assets/liabilities live on the balance sheet; cash movements land on the cash flow statement.
          </div>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Line items</h3>
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
                              <Badge variant="secondary">{item.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {showHints && item.hint && <p className="mt-1 text-xs text-muted-foreground/80">Hint: {item.hint}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableItems.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All line items have a home!</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {statements.map((statement) => (
                <div key={statement.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                    <div>
                      <p className="text-lg font-semibold">{statement.name}</p>
                      <p className="text-sm text-muted-foreground">{statement.description}</p>
                      {showHints && statement.howItHelps && (
                        <p className="text-xs text-muted-foreground/80">Why it matters: {statement.howItHelps}</p>
                      )}
                    </div>
                    {statement.focus && <Badge variant="outline">{statement.focus}</Badge>}
                  </div>
                  <Separator />
                  <Droppable droppableId={getZoneDroppableId(statement.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[130px]"
                      >
                        {(placements[statement.id] ?? []).map((item, index) => {
                          const isCorrect = item.targetId === statement.id;
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
                                    <Badge variant="secondary">{item.category}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                  {showHints && item.hint && <p className="mt-1 text-xs text-muted-foreground/80">{item.hint}</p>}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {(placements[statement.id] ?? []).length === 0 && (
                          <p className="text-center text-xs text-muted-foreground">Drop line items here</p>
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
