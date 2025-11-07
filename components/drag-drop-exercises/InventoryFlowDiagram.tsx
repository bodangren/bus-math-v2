'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { ArrowRight, BarChart3, Package, RotateCcw, Warehouse } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/db/schema/validators';
import { type InventoryFlowDiagramActivityProps } from '@/lib/db/schema/activities';

export type InventoryFlowDiagramActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'inventory-flow-diagram';
  props: InventoryFlowDiagramActivityProps;
};

interface InventoryFlowDiagramProps {
  activity: InventoryFlowDiagramActivity;
  onSubmit?: (payload: {
    activityId: string;
    score: number;
    attempts: number;
    responses: Record<string, string[]>;
    completedAt: Date;
  }) => void;
}

type InventoryScenario = InventoryFlowDiagramActivityProps['scenarios'][number];
type InventoryLot = InventoryScenario['lots'][number];

export const INVENTORY_AVAILABLE_DROPPABLE = 'inventory-available';
export const INVENTORY_ARRANGEMENT_DROPPABLE = 'inventory-arrangement';

export function InventoryFlowDiagram({ activity, onSubmit }: InventoryFlowDiagramProps) {
  const scenarios = activity.props.scenarios;
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? '');

  const activeScenario = useMemo<InventoryScenario>(
    () => scenarios.find((scenario) => scenario.id === scenarioId) ?? scenarios[0],
    [scenarioId, scenarios]
  );

  const [methodId, setMethodId] = useState(activeScenario?.flowModes[0]?.id ?? '');

  useEffect(() => {
    if (!activeScenario) return;
    setMethodId(activeScenario.flowModes[0]?.id ?? '');
  }, [activeScenario]);

  const activeMode = useMemo(
    () => activeScenario?.flowModes.find((mode) => mode.id === methodId) ?? activeScenario?.flowModes[0],
    [activeScenario, methodId]
  );

  const [availableLots, setAvailableLots] = useState<InventoryLot[]>([]);
  const [arrangement, setArrangement] = useState<InventoryLot[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const resetBoard = useCallback(() => {
    if (!activeScenario) return;
    setAvailableLots([...activeScenario.lots].sort(() => Math.random() - 0.5));
    setArrangement([]);
    setAttempts(0);
    setScore(0);
    setCompleted(false);
  }, [activeScenario]);

  useEffect(() => {
    resetBoard();
  }, [resetBoard, activeMode]);

  const evaluate = useCallback(
    (nextArrangement: InventoryLot[], upcomingAttempts: number) => {
      if (!activeMode) return;
      const targetOrder = activeMode.targetOrder;
      const comparableLength = Math.min(targetOrder.length, nextArrangement.length);
      let correct = 0;
      for (let i = 0; i < comparableLength; i += 1) {
        if (nextArrangement[i]?.id === targetOrder[i]) {
          correct += 1;
        }
      }
      const nextScore = targetOrder.length === 0 ? 0 : Math.round((correct / targetOrder.length) * 100);
      setScore(nextScore);

      if (!completed && targetOrder.length > 0 && correct === targetOrder.length) {
        setCompleted(true);
        onSubmit?.({
          activityId: activity.id,
          score: nextScore,
          attempts: upcomingAttempts,
          responses: { arrangement: nextArrangement.map((lot) => lot.id) },
          completedAt: new Date()
        });
      }
    },
    [activity.id, activeMode, completed, onSubmit]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const nextAvailable = [...availableLots];
      const nextArrangement = [...arrangement];
      let movingLot: InventoryLot | undefined;

      if (source.droppableId === INVENTORY_AVAILABLE_DROPPABLE) {
        movingLot = nextAvailable.splice(source.index, 1)[0];
      } else if (source.droppableId === INVENTORY_ARRANGEMENT_DROPPABLE) {
        movingLot = nextArrangement.splice(source.index, 1)[0];
      }

      if (!movingLot) return;

      if (destination.droppableId === INVENTORY_AVAILABLE_DROPPABLE) {
        nextAvailable.splice(destination.index, 0, movingLot);
      } else if (destination.droppableId === INVENTORY_ARRANGEMENT_DROPPABLE) {
        nextArrangement.splice(destination.index, 0, movingLot);
      } else {
        return;
      }

      setAvailableLots(nextAvailable);
      setArrangement(nextArrangement);
      setAttempts((prev) => {
        const upcomingAttempts = prev + 1;
        evaluate(nextArrangement, upcomingAttempts);
        return upcomingAttempts;
      });
    },
    [arrangement, availableLots, evaluate]
  );

  if (!activeScenario || !activeMode) {
    return null;
  }

  const totalQuantity = arrangement.reduce((sum, lot) => sum + lot.quantity, 0);
  const totalCost = arrangement.reduce((sum, lot) => sum + lot.quantity * lot.unitCost, 0);
  const averageCost = totalQuantity === 0 ? 0 : totalCost / totalQuantity;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{activity.props.title}</CardTitle>
          <CardDescription>{activity.props.description ?? activity.description}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">Flow complete</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Scenario
            <select
              value={activeScenario.id}
              onChange={(event) => setScenarioId(event.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Method
            <select
              value={activeMode.id}
              onChange={(event) => setMethodId(event.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {activeScenario.flowModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.name}
                </option>
              ))}
            </select>
          </label>
          <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={resetBoard}>
            <RotateCcw className="h-4 w-4" />
            Reset arrangement
          </Button>
        </div>

        <div className="rounded-xl border bg-muted/10 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-lg">{activeScenario.title}</p>
              <p className="text-sm text-muted-foreground">{activeScenario.description}</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Sales target: {activeScenario.salesQuantity} units
            </Badge>
          </div>
          {activeScenario.context && <p className="mt-2 text-sm text-muted-foreground">{activeScenario.context}</p>}
          <Separator className="my-3" />
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium">{activeMode.name}</span>
            {activeMode.description && <span>{activeMode.description}</span>}
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Warehouse className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Available lots</h3>
              </div>
              <Droppable droppableId={INVENTORY_AVAILABLE_DROPPABLE}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3 min-h-[200px]"
                  >
                    {availableLots.map((lot, index) => (
                      <Draggable key={lot.id} draggableId={lot.id} index={index}>
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
                            <p className="font-semibold">{lot.label}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Date: {lot.purchaseDate}</span>
                              <span>Qty: {lot.quantity}</span>
                              <span>Unit: ${lot.unitCost.toFixed(2)}</span>
                            </div>
                            {lot.notes && <p className="text-xs text-muted-foreground/80">{lot.notes}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableLots.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">All lots are in the flow</p>
                    )}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Flow arrangement</h3>
              </div>
              <Droppable droppableId={INVENTORY_ARRANGEMENT_DROPPABLE}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3 min-h-[220px]"
                  >
                    {arrangement.map((lot, index) => {
                      const correctId = activeMode.targetOrder[index];
                      const isCorrectPosition = attempts > 0 && lot.id === correctId;
                      const isIncorrectPosition = attempts > 0 && lot.id !== correctId;
                      return (
                        <Draggable key={lot.id} draggableId={lot.id} index={index}>
                          {(dragProvided, snapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={cn(
                                'rounded-lg border bg-card p-3 transition',
                                isCorrectPosition && 'border-green-500 bg-green-50',
                                isIncorrectPosition && 'border-destructive bg-destructive/10',
                                snapshot.isDragging && 'ring-2 ring-primary'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold">
                                  Step {index + 1}: {lot.label}
                                </p>
                                <Badge variant="outline">Qty {lot.quantity}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                ${lot.unitCost.toFixed(2)} per unit • Purchased {lot.purchaseDate}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {arrangement.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground">Drag lots here to build the cost flow</p>
                    )}
                  </div>
                )}
              </Droppable>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold">Lots used</p>
                  <p>{arrangement.length}</p>
                </div>
                <div>
                  <p className="font-semibold">Units assigned</p>
                  <p>{totalQuantity}</p>
                </div>
                <div>
                  <p className="font-semibold">Average cost</p>
                  <p>${averageCost.toFixed(2)}</p>
                </div>
              </div>
            </section>
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
