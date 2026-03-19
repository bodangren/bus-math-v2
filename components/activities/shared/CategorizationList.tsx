'use client';

import { useMemo, useState } from 'react';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { HelpCircle, RotateCcw, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import {
  AVAILABLE_ITEMS_DROPPABLE,
  getZoneDroppableId,
  useCategorizationExercise,
  type CategorizationItem,
  type ZonePlacements,
} from '@/components/activities/drag-drop/useCategorizationExercise';

export interface CategorizationListZone {
  id: string;
  label: string;
  description?: string;
  whyItMatters?: string;
  emoji?: string;
}

export interface CategorizationListItem extends CategorizationItem {
  label: string;
  description?: string;
  details?: Record<string, unknown>;
}

export interface CategorizationListProps<T extends CategorizationListItem> {
  title: string;
  description?: string;
  items: T[];
  zones: CategorizationListZone[];
  showHintsByDefault?: boolean;
  shuffleItems?: boolean;
  resetKey?: string;
  readOnly?: boolean;
  reviewPlacements?: ZonePlacements<T>;
  onComplete?: (payload: { score: number; attempts: number; placements: ZonePlacements<T> }) => void;
  describeItem?: (item: T) => { label: string; description?: string; details?: Record<string, unknown> };
}

function CategorizationReview<T extends CategorizationListItem>({
  title,
  description,
  items,
  zones,
  showHintsByDefault = false,
  reviewPlacements,
}: CategorizationListProps<T>) {
  const placements = reviewPlacements ?? zones.reduce<ZonePlacements<T>>((acc, zone) => {
    acc[zone.id] = [];
    return acc;
  }, {});

  const unplacedItems = items.filter((item) => !Object.values(placements).some((zoneItems) => zoneItems.some((entry) => entry.id === item.id)));

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Read-only review
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
          <section className="rounded-xl border bg-muted/20 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Item bank</h3>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3">
              {unplacedItems.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card p-3 shadow-sm">
                  <p className="font-semibold">{item.label}</p>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  {showHintsByDefault && item.details && (
                    <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">{JSON.stringify(item.details, null, 2)}</pre>
                  )}
                </div>
              ))}
              {unplacedItems.length === 0 && <p className="text-sm text-muted-foreground">All items have been placed.</p>}
            </div>
          </section>
          <section className="space-y-4">
            {zones.map((zone) => (
              <div key={zone.id} className="rounded-xl border bg-muted/10 p-4">
                <div className="flex flex-col gap-1 pb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {zone.emoji} {zone.label}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{zone.description}</p>
                  {showHintsByDefault && zone.whyItMatters && (
                    <p className="text-xs text-muted-foreground/80">Why it matters: {zone.whyItMatters}</p>
                  )}
                </div>
                <Separator />
                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3">
                  {placements[zone.id]?.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-card p-3">
                      <p className="font-medium">{item.label}</p>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </div>
                  ))}
                  {placements[zone.id]?.length === 0 && <p className="text-sm text-muted-foreground">No items placed.</p>}
                </div>
              </div>
            ))}
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

function CategorizationInteractive<T extends CategorizationListItem>({
  title,
  description,
  items,
  zones,
  showHintsByDefault = false,
  shuffleItems = true,
  resetKey,
  onComplete,
  describeItem,
}: CategorizationListProps<T>) {
  const [showHints, setShowHints] = useState(showHintsByDefault);
  const zoneIds = useMemo(() => zones.map((zone) => zone.id), [zones]);
  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        targetId: item.targetId,
      })),
    [items],
  );

  const { availableItems, placements, attempts, score, completed, handleDragEnd, reset } = useCategorizationExercise(normalizedItems, zoneIds, {
    shuffleItems,
    resetKey,
    onComplete,
  });

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">Completed</Badge>}
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
            Drag each item into the correct category.
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
            <section className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Item bank</h3>
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
                    className="flex min-h-[200px] flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3"
                  >
                    {availableItems.map((item, index) => {
                      const itemMeta = describeItem?.(item as T);
                      const label = itemMeta?.label ?? item.label;
                      const detail = itemMeta?.description ?? item.description;
                      return (
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
                              <p className="font-semibold">{label}</p>
                              {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
                              {showHints && itemMeta?.details && (
                                <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">{JSON.stringify(itemMeta.details, null, 2)}</pre>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {availableItems.length === 0 && <p className="text-center text-sm text-muted-foreground">All items placed.</p>}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="rounded-xl border bg-muted/10 p-4">
                  <div className="flex flex-col gap-1 pb-3">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">
                        {zone.emoji} {zone.label}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{zone.description}</p>
                    {showHints && zone.whyItMatters && <p className="text-xs text-muted-foreground/80">Why it matters: {zone.whyItMatters}</p>}
                  </div>
                  <Separator />
                  <Droppable droppableId={getZoneDroppableId(zone.id)}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="mt-3 flex min-h-[120px] flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3"
                      >
                        {placements[zone.id]?.map((item, index) => {
                          const itemMeta = describeItem?.(item as T);
                          const label = itemMeta?.label ?? item.label;
                          const detail = itemMeta?.description ?? item.description;
                          const isCorrect = item.targetId === zone.id;
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(dragProvided, snapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={cn(
                                    'rounded-lg border bg-card p-3 transition',
                                    snapshot.isDragging && 'ring-2 ring-primary',
                                    attempts > 0 && (isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-destructive bg-destructive/10')
                                  )}
                                >
                                  <p className="font-medium">{label}</p>
                                  {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {placements[zone.id]?.length === 0 && <p className="text-sm text-muted-foreground">Drop items here.</p>}
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

export function CategorizationList<T extends CategorizationListItem>(props: CategorizationListProps<T>) {
  if (props.readOnly) {
    return <CategorizationReview {...props} />;
  }

  return <CategorizationInteractive {...props} />;
}
