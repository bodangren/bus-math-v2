'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Table2,
  X,
} from 'lucide-react';
import { SpreadsheetWrapper, type SpreadsheetData } from '@/components/activities/spreadsheet/SpreadsheetWrapper';
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

type ModeFilter = 'all' | 'guided_practice' | 'independent_practice' | 'assessment';

export interface SelectedCell {
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  independentPractice: {
    completed: boolean;
    score: number | null;
    maxScore: number | null;
  } | null;
  assessment: {
    completed: boolean;
    score: number | null;
    maxScore: number | null;
    gradedAt: number | null;
  } | null;
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
  const isSpreadsheet = evidence.kind === 'spreadsheet';
  const submissionData = isPractice ? (evidence.submissionData as Record<string, unknown>) : null;
  const parts = isPractice && Array.isArray(submissionData?.parts)
    ? (submissionData.parts as Record<string, unknown>[])
    : [];
  const answers = isPractice && submissionData?.answers && typeof submissionData.answers === 'object'
    ? (submissionData.answers as Record<string, unknown>)
    : {};
  const spreadsheetData = isSpreadsheet ? evidence.spreadsheetData : null;
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
  }

  if ((score === null || maxScore === null) && typeof (part as Record<string, unknown>).score === 'number' && typeof (part as Record<string, unknown>).maxScore === 'number') {
    score = (part as Record<string, unknown>).score as number;
    maxScore = (part as Record<string, unknown>).maxScore as number;
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
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {evidence.submittedAt ? (
              <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Completed {formatTimestamp(evidence.submittedAt)}
              </span>
            ) : null}
            {evidence.attemptNumber ? (
              <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                Attempt {evidence.attemptNumber}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4">
        {isSpreadsheet ? (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-md border border-border">
              <SpreadsheetWrapper
                readOnly
                className="text-xs"
                initialData={spreadsheetData as SpreadsheetData}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Spreadsheet evidence is read-only and preserved as submitted.
            </div>

            {/* AI Feedback section */}
            {evidence.aiFeedback ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-sm font-semibold text-amber-900">
                    AI Preliminary Feedback
                    {evidence.aiFeedback.preliminaryScore !== undefined ? (
                      <Badge variant="secondary" className="ml-2 bg-amber-200 text-amber-900">
                        {evidence.aiFeedback.preliminaryScore} / 40 (AI Preliminary)
                      </Badge>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-3 space-y-3">
                  {evidence.aiFeedback.strengths && evidence.aiFeedback.strengths.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-800 mb-1">Strengths</h4>
                      <ul className="list-disc list-inside text-xs text-amber-900">
                        {evidence.aiFeedback.strengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {evidence.aiFeedback.improvements && evidence.aiFeedback.improvements.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-800 mb-1">Improvements</h4>
                      <ul className="list-disc list-inside text-xs text-amber-900">
                        {evidence.aiFeedback.improvements.map((improvement, i) => (
                          <li key={i}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {evidence.aiFeedback.nextSteps && evidence.aiFeedback.nextSteps.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-800 mb-1">Next Steps</h4>
                      <ul className="list-disc list-inside text-xs text-amber-900">
                        {evidence.aiFeedback.nextSteps.map((nextStep, i) => (
                          <li key={i}>{nextStep}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {/* Teacher Override section */}
            {evidence.teacherScoreOverride !== undefined || evidence.teacherFeedbackOverride ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-sm font-semibold text-green-900">
                    Teacher Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-3 space-y-3">
                  {evidence.teacherScoreOverride !== undefined ? (
                    <div>
                      <h4 className="text-xs font-semibold text-green-800 mb-1">Score</h4>
                      <Badge variant="secondary" className="bg-green-200 text-green-900">
                        {evidence.teacherScoreOverride} / 40 (Teacher Reviewed)
                      </Badge>
                    </div>
                  ) : null}
                  {evidence.teacherFeedbackOverride ? (
                    <div>
                      <h4 className="text-xs font-semibold text-green-800 mb-1">Feedback</h4>
                      <p className="text-xs text-green-900">{evidence.teacherFeedbackOverride}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
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
                    <div className="text-sm text-muted-foreground">No parts recorded</div>
                  )}

                  {parts.length > 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllParts(!showAllParts)}
                      className="mt-2"
                    >
                      {showAllParts ? 'Show fewer parts' : 'Show all parts'}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRaw(!showRaw)}
                    disabled={!answers || Object.keys(answers).length === 0}
                  >
                    {showRaw ? 'Hide' : 'Show'} raw answers
                  </Button>
                </div>

                {showRaw && answers && Object.keys(answers).length > 0 && (
                  <div className="mt-3 rounded-md bg-muted/20 p-3">
                    <div className="text-xs font-medium text-foreground mb-2">Raw answers</div>
                    <dl className="grid gap-2 text-sm">
                      {Object.entries(answers).map(([key, answer]) => (
                        <div key={key} className="grid grid-cols-[minmax(10rem,20%)_minmax(8rem,1fr)] gap-2">
                          <dt className="text-muted-foreground">{key}</dt>
                          <dd className="min-w-0 break-words text-foreground">{formatValue(answer)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SubmissionDetailModal
// ---------------------------------------------------------------------------

export function SubmissionDetailModal({
  selected,
  onClose,
}: SubmissionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModeFilter>('all');
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { fetchInternalQuery, internal } = await import('@/lib/convex/server');
      const result = await fetchInternalQuery(
        internal.teacher.getTeacherLessonMonitoringData,
        {
          userId: selected.studentId,
          unitNumber: 1,
          lessonId: selected.lessonId,
        },
      );

      if (result && 'detail' in result && result.detail) {
        setDetail(result.detail);
      } else {
        setError('No submission data found for this student');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selected.studentId, selected.lessonId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (!closeBtnRef.current) return;
    closeBtnRef.current.focus();
  }, [closeBtnRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const snapshot = useMemo(() => {
    if (!detail) return null;
    return buildSnapshot(detail);
  }, [detail]);

  const filteredPhases = useMemo(() => {
    if (!detail) return [];

    const allPhases = detail.phases.flatMap((phase) => {
      const evidence = phase.evidence || [];
      const evidenceWithMode = evidence.filter((e) => {
        if (e.kind === 'spreadsheet') return false;
        const submissionData = e.submissionData as Record<string, unknown>;
        const mode = typeof submissionData?.mode === 'string' ? submissionData.mode : null;
        return mode === activeTab;
      });

      if (evidenceWithMode.length === 0) return [];

      return [
        {
          phaseId: phase.phaseId,
          title: phase.title,
          status: phase.status,
          evidence: evidenceWithMode,
        },
      ];
    });

    return allPhases;
  }, [detail, activeTab]);

  const filteredDetail = useMemo(() => {
    if (!detail || activeTab === 'all') return detail;
    return {
      ...detail,
      phases: filteredPhases,
    };
  }, [detail, filteredPhases, activeTab]);

  const filteredSnapshot = useMemo(() => {
    if (!filteredDetail || activeTab === 'all') return snapshot;
    return buildSnapshot(filteredDetail);
  }, [filteredDetail, activeTab]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background shadow-lg" role="dialog" aria-modal="true">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between border-b border-border p-4">
            <div>
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

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : null}

            {snapshot && (
              <>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTab === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={activeTab === 'guided_practice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('guided_practice')}
                  >
                    Guided Practice
                  </Button>
                  <Button
                    variant={activeTab === 'independent_practice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('independent_practice')}
                  >
                    Independent Practice
                  </Button>
                  <Button
                    variant={activeTab === 'assessment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('assessment')}
                  >
                    Assessment
                  </Button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                  <SummaryChip
                    label="Completion"
                    value={`${filteredSnapshot?.completedPhases ?? 0} / ${filteredSnapshot?.totalPhases ?? 0} phases complete`}
                  />
                  <SummaryChip
                    label="Score"
                    value={
                      filteredSnapshot?.overallScore !== null && filteredSnapshot?.overallMaxScore !== null
                        ? `${filteredSnapshot.overallScore} / ${filteredSnapshot.overallMaxScore}`
                        : 'No scored practice submission'
                    }
                  />
                  <SummaryChip
                    label="Scaffold"
                    value={`${filteredSnapshot?.hintsUsed ?? 0} hints, ${filteredSnapshot?.revealStepsSeen ?? 0} reveals, ${filteredSnapshot?.editsMade ?? 0} edits`}
                  />
                  <SummaryChip
                    label="Attempt"
                    value={filteredSnapshot?.attemptNumber !== null ? `Attempt ${filteredSnapshot.attemptNumber}` : 'No attempt'}
                  />
                  <SummaryChip
                    label="Mode"
                    value={filteredSnapshot?.modeLabel ? filteredSnapshot.modeLabel.replace(/_/g, ' ') : 'Mixed / unspecified'}
                  />
                  <SummaryChip
                    label="Artifact"
                    value={filteredSnapshot?.artifactLabel ?? 'No stored artifact'}
                  />
                </div>

                <Card className="border-border/80 bg-muted/10">
                  <CardHeader className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Table2 className="size-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">Submission Snapshot</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Completion</div>
                          <div className="mt-2 flex items-center gap-2">
                            <PhaseStatusIcon status={filteredSnapshot?.completedPhases === filteredSnapshot?.totalPhases ? 'completed' : 'in_progress'} />
                            <span className="text-sm font-medium text-foreground">
                              {filteredSnapshot?.completedPhases ?? 0} of {filteredSnapshot?.totalPhases ?? 0} phases complete
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Score</div>
                          <div className="mt-2 text-lg font-semibold text-foreground">
                            {filteredSnapshot?.overallScore !== null && filteredSnapshot?.overallMaxScore !== null
                              ? `${filteredSnapshot.overallScore} / ${filteredSnapshot.overallMaxScore} correct`
                              : 'No scored practice submission'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {filteredSnapshot?.submittedAt ? formatTimestamp(filteredSnapshot.submittedAt) : 'No submission time'}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Scaffold usage</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {filteredSnapshot?.hintsUsed ?? 0} hints
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {filteredSnapshot?.revealStepsSeen ?? 0} reveals
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {filteredSnapshot?.editsMade ?? 0} edits
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Misconceptions</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {filteredSnapshot?.misconceptionTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4" data-testid="phase-list">
                  <p className="text-sm font-semibold text-foreground">
                    {activeTab === 'all'
                      ? 'All Submissions'
                      : activeTab === 'guided_practice'
                        ? 'Guided Practice'
                        : activeTab === 'independent_practice'
                          ? 'Independent Practice'
                          : 'Assessments'}
                  </p>
                  {filteredDetail?.phases.flatMap((phase) =>
                    (phase.evidence || []).map((evidence) => (
                      <PracticeEvidenceCard key={`${phase.phaseId}-${evidence.activityId}`} evidence={evidence} />
                    )),
                  ) || (
                    <div className="text-sm text-muted-foreground">No submissions found</div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
            Read-only evidence review — student submissions are view-only
          </div>
        </div>
      </div>
    </div>
  );
}
