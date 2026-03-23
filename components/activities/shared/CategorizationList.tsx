'use client';

import { useMemo } from 'react';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { RotateCcw, Target } from 'lucide-react';

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

export interface CategorizationListReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  expectedZoneLabel?: string;
  selectedZoneLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

export interface CategorizationListReviewSummary {
  scoreLabel?: string;
  attempts?: number;
  submittedAt?: string;
  misconceptionCount?: number;
}

export type CategorizationListMode = 'guided_practice' | 'independent_practice' | 'assessment' | 'teaching';

export interface CategorizationListProps<T extends CategorizationListItem> {
  title: string;
  description?: string;
  items: T[];
  zones: CategorizationListZone[];
  mode?: CategorizationListMode;
  showHintsByDefault?: boolean;
  shuffleItems?: boolean;
  resetKey?: string;
  readOnly?: boolean;
  teacherView?: boolean;
  reviewPlacements?: ZonePlacements<T>;
  reviewFeedback?: Record<string, CategorizationListReviewFeedback>;
  submissionSummary?: CategorizationListReviewSummary;
  onComplete?: (payload: { score: number; attempts: number; placements: ZonePlacements<T> }) => void;
  describeItem?: (item: T) => { label: string; description?: string; details?: Record<string, unknown> };
}

function CategorizationReview<T extends CategorizationListItem>({
  title,
  description,
  items,
  zones,
  mode,
  showHintsByDefault = false,
  teacherView = false,
  reviewPlacements,
  reviewFeedback = {},
  submissionSummary,
}: CategorizationListProps<T>) {
  const showHints = mode ? mode === 'guided_practice' || mode === 'teaching' : showHintsByDefault;
  const placements = reviewPlacements ?? zones.reduce<ZonePlacements<T>>((acc, zone) => {
    acc[zone.id] = [];
    return acc;
  }, {});
  const zoneMap = useMemo(() => new Map(zones.map((zone) => [zone.id, zone])), [zones]);

  const unplacedItems = items.filter((item) => !Object.values(placements).some((zoneItems) => zoneItems.some((entry) => entry.id === item.id)));
  const scoreLabel =
    submissionSummary?.scoreLabel ??
    `${Object.values(reviewFeedback).filter((feedback) => feedback.status === 'correct').length}/${items.length} correct`;
  const misconceptionCount =
    submissionSummary?.misconceptionCount ??
    new Set(Object.values(reviewFeedback).flatMap((feedback) => feedback.misconceptionTags ?? [])).size;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {teacherView && (
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <Badge variant="secondary" className="justify-start gap-2">
              Score: {scoreLabel}
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              Attempts: {submissionSummary?.attempts ?? '—'}
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              Submitted: {submissionSummary?.submittedAt ?? '—'}
            </Badge>
            <Badge variant="secondary" className="justify-start gap-2">
              Misconceptions: {misconceptionCount}
            </Badge>
          </div>
        )}
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
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              {teacherView ? 'Not placed' : 'Item bank'}
            </h3>
            <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-background/70 p-3">
              {unplacedItems.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card p-3 shadow-sm">
                  <p className="font-semibold">{item.label}</p>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  {showHints && item.details && (
                    <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">{JSON.stringify(item.details, null, 2)}</pre>
                  )}
                  {teacherView && reviewFeedback[item.id] && (
                    <div className="mt-3 space-y-2 rounded-lg border bg-muted/30 p-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="destructive">Your answer: {reviewFeedback[item.id]?.selectedZoneLabel ?? 'Not placed'}</Badge>
                        {reviewFeedback[item.id]?.expectedZoneLabel && (
                          <Badge variant="outline">Expected: {reviewFeedback[item.id]?.expectedZoneLabel}</Badge>
                        )}
                        <Badge
                          variant={
                            reviewFeedback[item.id]?.status === 'correct'
                              ? 'default'
                              : reviewFeedback[item.id]?.status === 'incorrect'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {reviewFeedback[item.id]?.scoreLabel ?? reviewFeedback[item.id]?.status}
                        </Badge>
                      </div>
                      {reviewFeedback[item.id]?.misconceptionTags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {reviewFeedback[item.id]?.misconceptionTags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      {reviewFeedback[item.id]?.message && (
                        <p className="text-xs text-muted-foreground">{reviewFeedback[item.id]?.message}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {unplacedItems.length === 0 && <p className="text-sm text-muted-foreground">All items have been placed.</p>}
            </div>
          </section>
          <section className="space-y-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  'rounded-xl border bg-muted/10 p-4',
                  teacherView && placements[zone.id]?.some((item) => reviewFeedback[item.id]?.status === 'incorrect') && 'border-destructive/70 bg-destructive/5',
                  teacherView && placements[zone.id]?.every((item) => reviewFeedback[item.id]?.status === 'correct') && placements[zone.id]?.length > 0 && 'border-emerald-500/60 bg-emerald-50/60',
                )}
              >
                <div className="flex flex-col gap-1 pb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {zone.emoji} {zone.label}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{zone.description}</p>
                  {showHints && zone.whyItMatters && (
                    <p className="text-xs text-muted-foreground/80">Why it matters: {zone.whyItMatters}</p>
                  )}
                </div>
                <Separator />
                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed bg-background/60 p-3">
                  {placements[zone.id]?.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'rounded-lg border bg-card p-3',
                        teacherView && reviewFeedback[item.id]?.status === 'correct' && 'border-emerald-500/60 bg-emerald-50/60',
                        teacherView && reviewFeedback[item.id]?.status === 'incorrect' && 'border-destructive/70 bg-destructive/10',
                        teacherView && reviewFeedback[item.id]?.status === 'partial' && 'border-amber-500/70 bg-amber-50/70',
                      )}
                    >
                      <p className="font-medium">{item.label}</p>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      {teacherView && reviewFeedback[item.id] && (
                        <div className="mt-3 space-y-2 rounded-lg border bg-muted/30 p-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={
                                reviewFeedback[item.id]?.status === 'correct'
                                  ? 'default'
                                  : reviewFeedback[item.id]?.status === 'incorrect'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              Your answer: {reviewFeedback[item.id]?.selectedZoneLabel ?? zoneMap.get(zone.id)?.label ?? zone.label}
                            </Badge>
                            {reviewFeedback[item.id]?.expectedZoneLabel && (
                              <Badge variant="outline">Expected: {reviewFeedback[item.id]?.expectedZoneLabel}</Badge>
                            )}
                            <Badge variant="outline">{reviewFeedback[item.id]?.scoreLabel ?? reviewFeedback[item.id]?.status}</Badge>
                          </div>
                          {reviewFeedback[item.id]?.misconceptionTags?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {reviewFeedback[item.id]?.misconceptionTags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {reviewFeedback[item.id]?.message && (
                            <p className="text-xs text-muted-foreground">{reviewFeedback[item.id]?.message}</p>
                          )}
                        </div>
                      )}
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
  mode,
  showHintsByDefault = false,
  shuffleItems = true,
  resetKey,
  onComplete,
  describeItem,
}: CategorizationListProps<T>) {
  const showHints = mode ? mode === 'guided_practice' || mode === 'teaching' : showHintsByDefault;
  const zoneIds = useMemo(() => zones.map((zone) => zone.id), [zones]);
  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        targetId: item.targetId,
      })),
    [items],
  );

  const { availableItems, placements, attempts, score, completed, handleDragEnd, moveItemToZone, reset } = useCategorizationExercise(normalizedItems, zoneIds, {
    shuffleItems,
    resetKey,
    onComplete,
  });

  const renderMoveControl = (item: T, currentZoneId: string | null = null) => (
    <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Move to</span>
      <select
        aria-label={`Move ${item.label} to another category`}
        defaultValue=""
        onChange={(event) => {
          const nextZoneId = event.target.value;
          if (!nextZoneId) {
            return;
          }

          moveItemToZone(item.id, nextZoneId === 'bank' ? null : nextZoneId);
        }}
        className="min-h-11 rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="" disabled>
          Select a category
        </option>
        {currentZoneId ? <option value="bank">Return to bank</option> : null}
        {zones
          .filter((zone) => zone.id !== currentZoneId)
          .map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.label}
            </option>
          ))}
      </select>
    </label>
  );

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
        <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
          Drag each item into the correct category.
        </div>
        {showHints && (
          <div className="rounded-xl border border-dashed bg-background/80 p-3 text-xs text-muted-foreground">
            Context hints are visible for this mode.
          </div>
        )}

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
                              {renderMoveControl(item as T)}
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
                                  {renderMoveControl(item as T, zone.id)}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {placements[zone.id]?.length === 0 && <p className="text-sm text-muted-foreground">Drop accounts here.</p>}
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
