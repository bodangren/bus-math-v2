'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  Loader2,
  Table2,
  X,
} from 'lucide-react';
import { SpreadsheetWrapper } from '@/components/activities/spreadsheet/SpreadsheetWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  PhaseDetail,
  PhaseStatus,
  PracticeEvidence,
  SpreadsheetEvidence,
  SubmissionDetail,
  SubmissionEvidence,
} from '@/lib/teacher/submission-detail';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectedCell {
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
}

interface SubmissionDetailModalProps {
  selected: SelectedCell;
  onClose: () => void;
}

interface SubmissionSnapshot {
  totalPhases: number;
  completedPhases: number;
  practiceEvidenceCount: number;
  overallScore: number | null;
  overallMaxScore: number | null;
  attemptNumber: number | null;
  submittedAt: string | null;
  modeLabel: string | null;
  artifactLabel: string | null;
  hintsUsed: number;
  revealStepsSeen: number;
  editsMade: number;
  misconceptionTags: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function PhaseStatusIcon({ status }: { status: PhaseStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />;
  }
  if (status === 'in_progress') {
    return <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-amber-500/40 text-amber-600" aria-hidden="true">•</span>;
  }
  return <Circle className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />;
}

function StatusBadge({ status }: { status: PhaseStatus }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        Completed
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Not Started
    </span>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) return 'No submission time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function getArtifactLabel(evidence: SubmissionEvidence) {
  if (evidence.kind === 'spreadsheet') return 'Spreadsheet';

  const artifactKind = (evidence.submissionData as Record<string, unknown>).artifact as
    | Record<string, unknown>
    | undefined;
  const kindValue = typeof artifactKind?.kind === 'string' ? artifactKind.kind : undefined;

  switch (kindValue) {
    case 'journal_entry':
      return 'Journal Entry';
    case 'statement_layout':
      return 'Statement Layout';
    case 'categorization':
      return 'Categorization';
    case 'written_explanation':
      return 'Written Explanation';
    case 'spreadsheet':
    case 'spreadsheet_evaluator':
    case 'spreadsheet_snapshot':
      return 'Spreadsheet';
    case 'data_cleaning':
      return 'Data Cleaning';
    case 'notebook_organizer':
      return 'Notebook Organizer';
    default:
      return 'Practice Artifact';
  }
}

function normalizeEvidence(phase: PhaseDetail): SubmissionEvidence[] {
  if (phase.evidence && phase.evidence.length > 0) {
    return phase.evidence;
  }

  if (!phase.spreadsheetData) {
    return [];
  }

  return [
    {
      kind: 'spreadsheet',
      activityId: phase.phaseId,
      activityTitle: `${phase.title} spreadsheet`,
      componentKey: 'spreadsheet',
      submittedAt: null,
      spreadsheetData: phase.spreadsheetData,
    } satisfies SpreadsheetEvidence,
  ];
}

function buildSnapshot(detail: SubmissionDetail): SubmissionSnapshot {
  const evidence = detail.phases.flatMap((phase) => normalizeEvidence(phase));
  const completedPhases = detail.phases.filter((phase) => phase.status === 'completed').length;
  const practiceEvidence = evidence.filter(
    (item): item is PracticeEvidence => item.kind === 'practice',
  );

  let overallScore = 0;
  let overallMaxScore = 0;
  let scoreCount = 0;
  let attemptNumber = 0;
  let latestSubmittedAt: string | null = null;
  let modeLabel: string | null = null;
  const artifactKinds = new Set<string>();
  const misconceptionTags = new Set<string>();
  let hintsUsed = 0;
  let revealStepsSeen = 0;
  let editsMade = 0;

  for (const entry of practiceEvidence) {
    if (typeof entry.score === 'number' && typeof entry.maxScore === 'number') {
      overallScore += entry.score;
      overallMaxScore += entry.maxScore;
      scoreCount += 1;
    }

    attemptNumber = Math.max(attemptNumber, entry.attemptNumber ?? 0);
    latestSubmittedAt =
      !latestSubmittedAt || new Date(entry.submittedAt).getTime() > new Date(latestSubmittedAt).getTime()
        ? entry.submittedAt
        : latestSubmittedAt;
    const submissionData = entry.submissionData as Record<string, unknown>;
    const entryMode = typeof submissionData.mode === 'string' ? submissionData.mode : null;
    modeLabel = modeLabel ?? entryMode;
    artifactKinds.add(getArtifactLabel(entry));
    const parts = Array.isArray(submissionData.parts) ? submissionData.parts : [];
    for (const part of parts) {
      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.hintsUsed === 'number') hintsUsed += partRecord.hintsUsed;
      if (typeof partRecord.revealStepsSeen === 'number') revealStepsSeen += partRecord.revealStepsSeen;
      if (typeof partRecord.changedCount === 'number') editsMade += partRecord.changedCount;
      const tags = Array.isArray(partRecord.misconceptionTags) ? partRecord.misconceptionTags : [];
      for (const tag of tags) {
        if (typeof tag === 'string' && tag.trim()) {
          misconceptionTags.add(tag.trim());
        }
      }
    }
  }

  return {
    totalPhases: detail.phases.length,
    completedPhases,
    practiceEvidenceCount: practiceEvidence.length,
    overallScore: scoreCount > 0 ? overallScore : null,
    overallMaxScore: scoreCount > 0 ? overallMaxScore : null,
    attemptNumber: attemptNumber > 0 ? attemptNumber : null,
    submittedAt: latestSubmittedAt,
    modeLabel,
    artifactLabel: artifactKinds.size === 1 ? [...artifactKinds][0] : artifactKinds.size > 1 ? 'Mixed artifacts' : null,
    hintsUsed,
    revealStepsSeen,
    editsMade,
    misconceptionTags: [...misconceptionTags],
  };
}

function SummaryChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function EvidenceValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          value.map((item, index) => (
            <Badge key={`${index}-${formatValue(item)}`} variant="secondary" className="text-xs">
              {formatValue(item)}
            </Badge>
          ))
        )}
      </div>
    );
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <dl className="grid gap-1 text-sm">
        {entries.map(([key, entryValue]) => (
          <div key={key} className="grid grid-cols-[10rem_minmax(0,1fr)] gap-2">
            <dt className="text-muted-foreground">{key}</dt>
            <dd className="min-w-0 break-words text-foreground">{formatValue(entryValue)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return <span className="break-words text-sm text-foreground">{formatValue(value)}</span>;
}

function PartRow({
  part,
  index,
  showAll,
}: {
  part: Record<string, unknown>;
  index: number;
  showAll: boolean;
}) {
  const partLabel = typeof part.partId === 'string' && part.partId.trim()
    ? part.partId.trim()
    : `Part ${index + 1}`;
  const normalized = typeof part.normalizedAnswer === 'string' ? part.normalizedAnswer : null;
  const score = typeof part.score === 'number' ? part.score : null;
  const maxScore = typeof part.maxScore === 'number' ? part.maxScore : null;
  const tags = Array.isArray(part.misconceptionTags)
    ? part.misconceptionTags.filter((tag): tag is string => typeof tag === 'string')
    : [];
  const hintsUsed = typeof part.hintsUsed === 'number' ? part.hintsUsed : null;
  const revealStepsSeen = typeof part.revealStepsSeen === 'number' ? part.revealStepsSeen : null;
  const changedCount = typeof part.changedCount === 'number' ? part.changedCount : null;

  const correctnessLabel = part.isCorrect === true
    ? 'Correct'
    : part.isCorrect === false
      ? 'Incorrect'
      : score !== null && maxScore !== null && score < maxScore
        ? 'Partial'
        : 'Not auto-scored';

  const correctnessClass = correctnessLabel === 'Correct'
    ? 'bg-green-100 text-green-800'
    : correctnessLabel === 'Partial'
      ? 'bg-amber-100 text-amber-800'
      : correctnessLabel === 'Incorrect'
        ? 'bg-red-100 text-red-800'
        : 'bg-muted text-muted-foreground';

  if (!showAll && index >= 4) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{partLabel}</span>
            <Badge variant="secondary" className={`text-xs ${correctnessClass}`}>
              {correctnessLabel}
            </Badge>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{formatValue(part.rawAnswer)}</span>
            {normalized ? <span className="ml-2">Normalized: {normalized}</span> : null}
          </div>
        </div>
        {score !== null && maxScore !== null ? (
          <Badge variant="outline" className="text-xs">
            {score} / {maxScore}
          </Badge>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {hintsUsed !== null ? <span>{hintsUsed} hints</span> : null}
        {revealStepsSeen !== null ? <span>{revealStepsSeen} reveals</span> : null}
        {changedCount !== null ? <span>{changedCount} edits</span> : null}
      </div>

      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={`${partLabel}-${tag}`} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      {part.rawAnswer && typeof part.rawAnswer === 'object' ? (
        <div className="mt-3 rounded-md bg-muted/20 p-2">
          <EvidenceValue value={part.rawAnswer} />
        </div>
      ) : null}
    </div>
  );
}

function PracticeEvidenceCard({
  evidence,
}: {
  evidence: SubmissionEvidence;
}) {
  const [showAllParts, setShowAllParts] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const isPractice = evidence.kind === 'practice';
  const submissionData = isPractice ? (evidence.submissionData as Record<string, unknown>) : null;
  const modeValue = isPractice && typeof submissionData?.mode === 'string'
    ? submissionData.mode
    : null;
  const parts = isPractice && Array.isArray(submissionData?.parts)
    ? (submissionData.parts as Record<string, unknown>[])
    : [];
  const answers = isPractice && submissionData?.answers && typeof submissionData.answers === 'object'
    ? (submissionData.answers as Record<string, unknown>)
    : {};
  const artifact = isPractice
    ? (submissionData?.artifact as Record<string, unknown> | undefined)
    : undefined;
  const artifactSpreadsheetData = artifact && Array.isArray(artifact.spreadsheetData)
    ? (artifact.spreadsheetData as unknown[])
    : null;
  const artifactLabel = getArtifactLabel(evidence);

  const misconceptionTags = new Set<string>();
  let score = isPractice && typeof evidence.score === 'number' ? evidence.score : null;
  let maxScore = isPractice && typeof evidence.maxScore === 'number' ? evidence.maxScore : null;

  for (const part of parts) {
    const tags = Array.isArray((part as Record<string, unknown>).misconceptionTags)
      ? ((part as Record<string, unknown>).misconceptionTags as unknown[])
      : [];
    for (const tag of tags) {
      if (typeof tag === 'string' && tag.trim()) {
        misconceptionTags.add(tag.trim());
      }
    }

    if ((score === null || maxScore === null) && typeof (part as Record<string, unknown>).score === 'number' && typeof (part as Record<string, unknown>).maxScore === 'number') {
      score = (part as Record<string, unknown>).score as number;
      maxScore = (part as Record<string, unknown>).maxScore as number;
    }
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-background">
      <CardHeader className="border-b border-border/70 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {evidence.activityTitle}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {artifactLabel} · {evidence.componentKey}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isPractice ? (
              <>
                <Badge variant="secondary" className="text-xs">
                  Attempt {evidence.attemptNumber}
                </Badge>
                {modeValue ? (
                  <Badge variant="outline" className="text-xs">
                    {modeValue.replace(/_/g, ' ')}
                  </Badge>
                ) : null}
                {score !== null && maxScore !== null ? (
                  <Badge variant="outline" className="text-xs">
                    {score} / {maxScore}
                  </Badge>
                ) : null}
              </>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Spreadsheet
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{formatTimestamp(evidence.submittedAt)}</span>
          {evidence.kind === 'practice' && evidence.feedback ? (
            <span>{evidence.feedback}</span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4">
        {evidence.kind === 'spreadsheet' ? (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-md border border-border">
              <SpreadsheetWrapper
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                initialData={evidence.spreadsheetData as any}
                readOnly
                className="text-xs"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Spreadsheet evidence is read-only and preserved as submitted.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">Part-by-Part Answers</div>
                  <div className="flex flex-wrap gap-2">
                    {typeof evidence.attemptNumber === 'number' ? (
                      <Badge variant="outline" className="text-xs">
                        Attempt {evidence.attemptNumber}
                      </Badge>
                    ) : null}
                    {score !== null && maxScore !== null ? (
                      <Badge variant="secondary" className="text-xs">
                        {score} / {maxScore}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {parts.length > 0 ? (
                    parts.map((part, index) => (
                      <PartRow
                        key={`${evidence.activityId}-${index}`}
                        part={part}
                        index={index}
                        showAll={showAllParts}
                      />
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground">
                      No structured part data was stored for this submission.
                    </div>
                  )}
                </div>

                {parts.length > 4 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllParts((value) => !value)}
                    className="mt-3 px-0 text-xs"
                  >
                    {showAllParts ? 'Show fewer parts' : `Show all ${parts.length} parts`}
                  </Button>
                ) : null}
              </div>

              {Object.keys(answers).length > 0 ? (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-sm font-medium text-foreground">Answer Record</div>
                  <div className="mt-3 grid gap-2">
                    {Object.entries(answers).map(([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-1 rounded-md border border-border/70 bg-muted/20 px-3 py-2"
                      >
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          {key}
                        </div>
                        <EvidenceValue value={value} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="size-4 text-muted-foreground" />
                  Artifact
                </div>
                {artifactSpreadsheetData ? (
                  <div className="mt-3 space-y-3">
                    <div className="overflow-x-auto rounded-md border border-border">
                      <SpreadsheetWrapper
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        initialData={artifactSpreadsheetData as any}
                        readOnly
                        className="text-xs"
                      />
                    </div>
                    <div className="rounded-md border border-border bg-muted/20 p-3">
                      <EvidenceValue value={artifact} />
                    </div>
                  </div>
                ) : artifact ? (
                  <div className="mt-3 rounded-md border border-border bg-muted/20 p-3">
                    <EvidenceValue value={artifact} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-md border border-dashed border-border bg-muted/10 px-3 py-4 text-sm text-muted-foreground">
                    No artifact stored for this submission.
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <div className="text-sm font-medium text-foreground">Metadata</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <SummaryChip label="Mode" value={(modeValue ?? 'assessment').replace(/_/g, ' ')} />
                  <SummaryChip label="Attempt" value={String(evidence.attemptNumber ?? 1)} />
                  <SummaryChip label="Submitted" value={formatTimestamp(evidence.submittedAt)} />
                  <SummaryChip label="Scaffold" value="Stored in parts" />
                </div>
                {misconceptionTags.size > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {[...misconceptionTags].map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">Raw Response</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRaw((value) => !value)}
                    className="px-2 text-xs"
                  >
                    {showRaw ? 'Hide' : 'View'} raw response
                  </Button>
                </div>
                {showRaw ? (
                  <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted/20 p-3 text-xs text-foreground">
                    {JSON.stringify(evidence.submissionData, null, 2)}
                  </pre>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Raw JSON stays hidden until a teacher needs to inspect the stored envelope.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PhaseSection({
  phase,
  expanded,
  onToggle,
}: {
  phase: PhaseDetail;
  expanded: boolean;
  onToggle: () => void;
}) {
  const evidence = normalizeEvidence(phase);

  return (
    <Card className="overflow-hidden border-border/80">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 border-b border-border/70 px-4 py-3 text-left hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`phase-body-${phase.phaseId}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <PhaseStatusIcon status={phase.status} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              Phase {phase.phaseNumber}: {phase.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {evidence.length > 0 ? `${evidence.length} evidence item${evidence.length === 1 ? '' : 's'}` : 'No stored practice evidence'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={phase.status} />
          {expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded ? (
        <div id={`phase-body-${phase.phaseId}`} className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {phase.completedAt ? <span>Completed {formatTimestamp(phase.completedAt)}</span> : <span>Not completed yet</span>}
            {phase.spreadsheetData ? <span>Spreadsheet snapshot stored</span> : null}
          </div>

          {evidence.length > 0 ? (
            <div className="space-y-4">
              {evidence.map((item) => (
                <PracticeEvidenceCard
                  key={`${phase.phaseId}-${item.activityId}-${item.kind}`}
                  evidence={item as PracticeEvidence}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              No stored practice submission for this phase.
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SubmissionDetailModal
// ---------------------------------------------------------------------------

/**
 * Read-only modal showing phase-by-phase progress for one student × lesson.
 * Fetches data from /api/teacher/submission-detail on mount.
 * No mutation capability — teacher view only.
 */
export function SubmissionDetailModal({ selected, onClose }: SubmissionDetailModalProps) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Set<string>>(new Set());

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setDetail(null);
    setError(null);
    setExpandedPhaseIds(new Set());

    fetch(
      `/api/teacher/submission-detail?studentId=${encodeURIComponent(selected.studentId)}&lessonId=${encodeURIComponent(selected.lessonId)}`,
    )
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.error ?? `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data: SubmissionDetail) => {
        if (!cancelled) {
          setDetail(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selected.studentId, selected.lessonId]);

  useEffect(() => {
    if (!detail) return;
    const firstEvidencePhase = detail.phases.find((phase) => normalizeEvidence(phase).length > 0) ?? detail.phases[0];
    if (firstEvidencePhase) {
      setExpandedPhaseIds(new Set([firstEvidencePhase.phaseId]));
    }
  }, [detail]);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  const snapshot = useMemo(() => (detail ? buildSnapshot(detail) : null), [detail]);

  function togglePhase(phaseId: string) {
    setExpandedPhaseIds((current) => {
      const next = new Set(current);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 pt-[5vh] sm:p-4"
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Submission detail: ${selected.studentName} — ${selected.lessonTitle}`}
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
      >
        <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-background/95 px-4 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold leading-tight text-foreground">
                {selected.studentName}
              </h2>
              <p className="text-xs text-muted-foreground">{selected.lessonTitle}</p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close submission detail"
              className="mt-0.5 shrink-0 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          </div>

          {snapshot ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
              <SummaryChip
                label="Completion"
                value={`${snapshot.completedPhases} / ${snapshot.totalPhases} phases complete`}
              />
              <SummaryChip
                label="Score"
                value={
                  snapshot.overallScore !== null && snapshot.overallMaxScore !== null
                    ? `${snapshot.overallScore} / ${snapshot.overallMaxScore}`
                    : 'No scored practice submission'
                }
              />
              <SummaryChip
                label="Scaffold"
                value={`${snapshot.hintsUsed} hints, ${snapshot.revealStepsSeen} reveals, ${snapshot.editsMade} edits`}
              />
              <SummaryChip
                label="Attempt"
                value={snapshot.attemptNumber !== null ? `Attempt ${snapshot.attemptNumber}` : 'No attempt'}
              />
              <SummaryChip
                label="Mode"
                value={snapshot.modeLabel ? snapshot.modeLabel.replace(/_/g, ' ') : 'Mixed / unspecified'}
              />
              <SummaryChip
                label="Artifact"
                value={snapshot.artifactLabel ?? 'No stored artifact'}
              />
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <Card className="border-border/80 bg-muted/10">
            <CardHeader className="px-4 py-4">
              <div className="flex items-center gap-2">
                <Table2 className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Submission Snapshot</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {snapshot ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Completion</div>
                      <div className="mt-2 flex items-center gap-2">
                        <PhaseStatusIcon status={snapshot.completedPhases === snapshot.totalPhases ? 'completed' : 'in_progress'} />
                        <span className="text-sm font-medium text-foreground">
                          {snapshot.completedPhases} of {snapshot.totalPhases} phases complete
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Score</div>
                      <div className="mt-2 text-lg font-semibold text-foreground">
                        {snapshot.overallScore !== null && snapshot.overallMaxScore !== null
                          ? `${snapshot.overallScore} / ${snapshot.overallMaxScore} correct`
                          : 'No scored practice submission'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {snapshot.submittedAt ? formatTimestamp(snapshot.submittedAt) : 'No submission time'}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Scaffold usage</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {snapshot.hintsUsed} hints
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {snapshot.revealStepsSeen} reveals
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {snapshot.editsMade} edits
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Misconceptions</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {snapshot.misconceptionTags.length > 0 ? (
                          snapshot.misconceptionTags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None stored yet</span>
                        )}
                        {snapshot.misconceptionTags.length > 3 ? (
                          <Badge variant="secondary" className="text-xs">
                            +{snapshot.misconceptionTags.length - 3} more
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No submission snapshot available.</div>
              )}
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">Loading practice evidence…</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {detail && !isLoading && (
            <div className="space-y-3" data-testid="phase-list">
              {detail.phases.map((phase) => (
                <PhaseSection
                  key={phase.phaseId}
                  phase={phase}
                  expanded={expandedPhaseIds.has(phase.phaseId)}
                  onToggle={() => togglePhase(phase.phaseId)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 shrink-0 border-t border-border bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Read-only evidence review. Teachers can inspect stored answers, artifacts, and scoring context but cannot edit student work from this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
