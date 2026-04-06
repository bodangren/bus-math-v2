'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { RotateCcw, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TeachingModePanel } from './TeachingModePanel';

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
type CategorizationLayoutPreset = 'account-type' | 'statement-placement' | 'permanent-temporary' | 'default';

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

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function getLayoutPreset(zones: CategorizationListZone[]): CategorizationLayoutPreset {
  const names = zones.flatMap((zone) => [normalizeText(zone.id), normalizeText(zone.label)]);

  if (names.includes('assets') && names.includes('liabilities') && names.includes('equity')) {
    return 'account-type';
  }

  if (names.includes('balance sheet') && names.includes('income statement')) {
    return 'statement-placement';
  }

  if (names.includes('permanent') && names.includes('temporary')) {
    return 'permanent-temporary';
  }

  return 'default';
}

function formatDetailLines(details?: Record<string, unknown>) {
  if (!details) {
    return [];
  }

  return Object.entries(details).flatMap(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return [];
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? [`${key}: ${value.map((entry) => String(entry)).join(', ')}`] : [];
    }

    if (typeof value === 'object') {
      return [`${key}: ${JSON.stringify(value)}`];
    }

    return [`${key}: ${String(value)}`];
  });
}

function ItemDetails({ details }: { details?: Record<string, unknown> }) {
  const lines = formatDetailLines(details);
  if (lines.length === 0) {
    return null;
  }

  return (
    <dl className="mt-2 space-y-1 text-xs text-slate-600">
      {lines.map((line) => {
        const [label, ...rest] = line.split(': ');
        return (
          <div key={line} className="flex gap-2">
            <dt className="shrink-0 font-medium capitalize text-slate-500">{label}</dt>
            <dd className="min-w-0">{rest.join(': ')}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function ZoneShell({
  zone,
  showHints,
  highlighted = false,
  children,
}: {
  zone: CategorizationListZone;
  showHints: boolean;
  highlighted?: boolean;
  children: ReactNode;
}) {
  const tone =
    zone.id === 'assets'
      ? 'border-sky-200 from-sky-50'
      : zone.id === 'liabilities'
        ? 'border-rose-200 from-rose-50'
        : zone.id === 'equity'
          ? 'border-amber-200 from-amber-50'
          : zone.id === 'revenue'
            ? 'border-emerald-200 from-emerald-50'
            : zone.id === 'expenses'
              ? 'border-orange-200 from-orange-50'
              : 'border-slate-200 from-slate-50';

  return (
    <section
      data-zone-id={zone.id}
      className={cn('overflow-hidden rounded-[1.35rem] border bg-gradient-to-b to-white shadow-sm', tone, highlighted && 'ring-1 ring-slate-400/30')}
    >
      <div className="border-b border-slate-200/80 px-4 py-3">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm">
            {zone.emoji ?? '•'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{zone.label}</p>
            {zone.description && <p className="text-xs text-slate-600">{zone.description}</p>}
          </div>
        </div>
        {showHints && zone.whyItMatters && (
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Why it matters: {zone.whyItMatters}</p>
        )}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function buildReviewCard<T extends CategorizationListItem>({
  item,
  showHints,
  teacherView,
  feedback,
  zoneLabel,
}: {
  item: T;
  showHints: boolean;
  teacherView: boolean;
  feedback?: CategorizationListReviewFeedback;
  zoneLabel: string;
}) {
  return (
    <div
      key={item.id}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm',
        teacherView && feedback?.status === 'correct' && 'border-emerald-500/60 bg-emerald-50/70',
        teacherView && feedback?.status === 'incorrect' && 'border-rose-500/60 bg-rose-50/80',
        teacherView && feedback?.status === 'partial' && 'border-amber-500/60 bg-amber-50/80',
      )}
    >
      <p className="font-medium text-slate-900">{item.label}</p>
      {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
      {showHints && <ItemDetails details={item.details} />}
      {teacherView && feedback && (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                feedback.status === 'correct' ? 'default' : feedback.status === 'incorrect' ? 'destructive' : 'secondary'
              }
            >
              Your answer: {feedback.selectedZoneLabel ?? zoneLabel}
            </Badge>
            {feedback.expectedZoneLabel && <Badge variant="outline">Expected: {feedback.expectedZoneLabel}</Badge>}
            <Badge variant="outline">{feedback.scoreLabel ?? feedback.status}</Badge>
          </div>
          {feedback.misconceptionTags?.length ? (
            <div className="flex flex-wrap gap-2">
              {feedback.misconceptionTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
          {feedback.message && <p className="text-xs text-slate-600">{feedback.message}</p>}
        </div>
      )}
    </div>
  );
}

function buildInteractiveCard<T extends CategorizationListItem>({
  item,
  index,
  describeItem,
  showHints,
  renderMoveControl,
}: {
  item: T;
  index: number;
  describeItem?: (item: T) => { label: string; description?: string; details?: Record<string, unknown> };
  showHints: boolean;
  renderMoveControl: (item: T, currentZoneId?: string | null) => ReactNode;
}) {
  const itemMeta = describeItem?.(item);
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
            'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition',
            snapshot.isDragging && 'ring-2 ring-slate-400',
          )}
        >
          <p className="font-semibold text-slate-900">{label}</p>
          {detail && <p className="text-sm text-slate-600">{detail}</p>}
          {showHints && <ItemDetails details={itemMeta?.details} />}
          {renderMoveControl(item)}
        </div>
      )}
    </Draggable>
  );
}

function buildZoneList({
  zones,
  layoutPreset,
  showHints,
  renderZone,
}: {
  zones: CategorizationListZone[];
  layoutPreset: CategorizationLayoutPreset;
  showHints: boolean;
  renderZone: (zone: CategorizationListZone) => ReactNode;
}) {
  if (layoutPreset !== 'account-type') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {zones.map((zone) => (
          <ZoneShell key={zone.id} zone={zone} showHints={showHints}>
            {renderZone(zone)}
          </ZoneShell>
        ))}
      </div>
    );
  }

  const assetsZone = zones.find((zone) => normalizeText(zone.id) === 'assets' || normalizeText(zone.label) === 'assets');
  if (!assetsZone || zones.length < 5) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {zones.map((zone) => (
          <ZoneShell key={zone.id} zone={zone} showHints={showHints}>
            {renderZone(zone)}
          </ZoneShell>
        ))}
      </div>
    );
  }

  const remainingZones = zones.filter((zone) => zone.id !== assetsZone.id);
  const topStack = remainingZones.slice(0, 2);
  const bottomStack = remainingZones.slice(2);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <ZoneShell key={assetsZone.id} zone={assetsZone} showHints={false}>
        {renderZone(assetsZone)}
      </ZoneShell>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {topStack.map((zone) => (
            <ZoneShell key={zone.id} zone={zone} showHints={false}>
              {renderZone(zone)}
            </ZoneShell>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {bottomStack.map((zone) => (
            <ZoneShell key={zone.id} zone={zone} showHints={false}>
              {renderZone(zone)}
            </ZoneShell>
          ))}
        </div>
      </div>
    </div>
  );
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
  const layoutPreset = getLayoutPreset(zones);
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
  const teachingSteps = ['Read the row label and the short clue.', 'Match the item to the zone that follows the accounting rule.', 'Use the misconception tags to revisit any miss.'];

  const renderZone = (zone: CategorizationListZone) => (
    <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3">
      {placements[zone.id]?.map((item) =>
        buildReviewCard({
          item,
          showHints,
          teacherView,
          feedback: reviewFeedback[item.id],
          zoneLabel: zoneMap.get(zone.id)?.label ?? zone.label,
        }),
      )}
      {placements[zone.id]?.length === 0 && <p className="text-sm text-slate-600">No items placed.</p>}
    </div>
  );

  return (
    <Card className="w-full overflow-hidden border-slate-300 bg-[linear-gradient(180deg,#fcfbf6_0%,#f7f3eb_100%)] shadow-[0_14px_48px_rgba(15,23,42,0.08)]" data-layout={layoutPreset}>
      <CardHeader className="space-y-4 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,248,243,0.95))] px-6 py-6">
        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl tracking-tight text-slate-900">{title}</CardTitle>
          {description && <CardDescription className="text-slate-600">{description}</CardDescription>}
        </div>
        {teacherView && (
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <Badge variant="secondary" className="justify-start gap-2 bg-sky-50 text-sky-900">
              Score: {scoreLabel}
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              Attempts: {submissionSummary?.attempts ?? '—'}
            </Badge>
            <Badge variant="outline" className="justify-start gap-2">
              Submitted: {submissionSummary?.submittedAt ?? '—'}
            </Badge>
            <Badge variant="secondary" className="justify-start gap-2 bg-amber-50 text-amber-900">
              Misconceptions: {misconceptionCount}
            </Badge>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-2 bg-slate-100 text-slate-800">
            <Target className="h-4 w-4" />
            Read-only review
          </Badge>
        </div>
        {mode === 'teaching' && (
          <TeachingModePanel
            title="Sorting walkthrough"
            summary="Work through the classification rule before moving items on the board."
            steps={teachingSteps}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-6 px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.55fr)]">
          <section className="rounded-[1.5rem] border border-slate-300 bg-white/90 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {teacherView ? 'Not placed' : 'Item bank'}
            </h3>
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,#fff,#faf9f4)] p-3">
              {unplacedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                  {showHints && <ItemDetails details={item.details} />}
                  {teacherView && reviewFeedback[item.id] && (
                    <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="destructive">Your answer: {reviewFeedback[item.id]?.selectedZoneLabel ?? 'Not placed'}</Badge>
                        {reviewFeedback[item.id]?.expectedZoneLabel && <Badge variant="outline">Expected: {reviewFeedback[item.id]?.expectedZoneLabel}</Badge>}
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
                      {reviewFeedback[item.id]?.message && <p className="text-xs text-slate-600">{reviewFeedback[item.id]?.message}</p>}
                    </div>
                  )}
                </div>
              ))}
              {unplacedItems.length === 0 && <p className="text-sm text-slate-600">All items have been placed.</p>}
            </div>
          </section>

          <section className="space-y-4">
            {buildZoneList({
              zones,
              layoutPreset,
              showHints,
              renderZone,
            })}
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
  const layoutPreset = getLayoutPreset(zones);
  const zoneIds = useMemo(() => zones.map((zone) => zone.id), [zones]);
  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        targetId: item.targetId,
      })),
    [items],
  );

  const [announcement, setAnnouncement] = useState('');
  const { availableItems, placements, attempts, score, completed, handleDragEnd, moveItemToZone, reset } = useCategorizationExercise(normalizedItems, zoneIds, {
    shuffleItems,
    resetKey,
    onComplete,
  });

  const announceMove = (itemLabel: string, destinationZoneLabel: string | null) => {
    const message = destinationZoneLabel
      ? `${itemLabel} moved to ${destinationZoneLabel}`
      : `${itemLabel} returned to item bank`;
    setAnnouncement(message);
  };

  const renderMoveControl = (item: T, currentZoneId: string | null = null) => (
    <label className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
      <span className="font-medium text-slate-900">Move to</span>
      <select
        aria-label={`Move ${item.label} to another category`}
        defaultValue=""
        onChange={(event) => {
          const nextZoneId = event.target.value;
          if (!nextZoneId) {
            return;
          }

          if (nextZoneId === 'bank') {
            announceMove(item.label, null);
            moveItemToZone(item.id, null);
          } else {
            const zone = zones.find((z) => z.id === nextZoneId);
            announceMove(item.label, zone?.label ?? nextZoneId);
            moveItemToZone(item.id, nextZoneId);
          }
        }}
        className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

  const onDragEndWithAnnouncement = (result: import('@hello-pangea/dnd').DropResult) => {
    const itemId = result.draggableId;
    const item = [...availableItems, ...Object.values(placements).flat()].find((entry) => entry.id === itemId);
    const destinationZoneId = result.destination?.droppableId?.startsWith('zone-')
      ? result.destination.droppableId.replace('zone-', '')
      : null;
    const destZone = destinationZoneId ? zones.find((z) => z.id === destinationZoneId) : null;
    if (item) {
      announceMove(item.label, destZone?.label ?? null);
    }
    handleDragEnd(result);
  };

  const renderZone = (zone: CategorizationListZone) => (
    <Droppable droppableId={getZoneDroppableId(zone.id)}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'mt-3 min-h-[140px] rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,#fff,#fbfaf6)] p-3',
            attempts > 0 && placements[zone.id]?.some((item) => item.targetId === zone.id) && 'border-emerald-300 bg-emerald-50/60',
          )}
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
                      'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition',
                      snapshot.isDragging && 'ring-2 ring-slate-400',
                      attempts > 0 && (isCorrect ? 'border-emerald-500/60 bg-emerald-50/80' : 'border-rose-500/60 bg-rose-50/80'),
                    )}
                  >
                    <p className="font-medium text-slate-900">{label}</p>
                    {detail && <p className="text-sm text-slate-600">{detail}</p>}
                    {showHints && <ItemDetails details={itemMeta?.details} />}
                    {renderMoveControl(item as T, zone.id)}
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
          {placements[zone.id]?.length === 0 && <p className="text-sm text-slate-600">Drop accounts here.</p>}
        </div>
      )}
    </Droppable>
  );

  return (
    <Card className="w-full overflow-hidden border-slate-300 bg-[linear-gradient(180deg,#fcfbf6_0%,#f7f3eb_100%)] shadow-[0_14px_48px_rgba(15,23,42,0.08)]" data-layout={layoutPreset}>
      <CardHeader className="space-y-4 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,248,243,0.95))] px-6 py-6">
        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl tracking-tight text-slate-900">{title}</CardTitle>
          {description && <CardDescription className="text-slate-600">{description}</CardDescription>}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-2 bg-sky-50 text-sky-900">
            <Target className="h-4 w-4" />
            Score: {score}%
          </Badge>
          <Badge variant="outline">Attempts: {attempts}</Badge>
          {completed && <Badge variant="default">Completed</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 py-6">
        <div className="rounded-[1.25rem] border border-slate-300 bg-white/90 p-3 text-sm text-slate-600">
          Drag each item into the correct category.
        </div>
        {showHints && (
          <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/80 p-3 text-xs text-slate-600">
            Context hints are visible for this mode.
          </div>
        )}
        {mode === 'teaching' && (
          <div className="rounded-[1.25rem] border border-blue-200 bg-blue-50/70 p-3 text-sm text-blue-950">
            Classification rule: keep the account bank and the target zone in view together.
          </div>
        )}

        <DragDropContext onDragEnd={onDragEndWithAnnouncement}>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.65fr)]">
            <section className="rounded-[1.5rem] border border-slate-300 bg-white/90 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Item bank</h3>
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
                    className="flex min-h-[200px] flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,#fff,#faf9f4)] p-3"
                  >
                    {availableItems.map((item, index) => buildInteractiveCard({ item: item as T, index, describeItem, showHints, renderMoveControl }))}
                    {provided.placeholder}
                    {availableItems.length === 0 && <p className="text-center text-sm text-slate-600">All items placed.</p>}
                  </div>
                )}
              </Droppable>
            </section>

            <section className="space-y-4">
              {buildZoneList({
                zones,
                layoutPreset,
                showHints,
                renderZone,
              })}
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
