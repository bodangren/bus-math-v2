'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Brain, Loader2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getMisconceptionTag } from '@/lib/practice/misconception-taxonomy';

// ---------------------------------------------------------------------------
// Types (mirrors DeterministicErrorSummary from error-analysis)
// ---------------------------------------------------------------------------

interface MisconceptionSummary {
  tag: string;
  count: number;
  affectedParts: string[];
  affectedStudents: string[];
}

interface PartOutcomeSummary {
  partId: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
}

interface DeterministicErrorSummary {
  type: 'deterministic';
  lessonId: string;
  generatedAt: number;
  partSummaries: PartOutcomeSummary[];
  topMisconceptions: MisconceptionSummary[];
  studentCount: number;
  averageAccuracy: number;
}

interface LessonErrorSummaryProps {
  lessonId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAccuracy(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

function accuracyColor(rate: number): string {
  if (rate >= 0.8) return 'text-green-700';
  if (rate >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}

function progressColor(rate: number): string {
  if (rate >= 0.8) return '[&>div]:bg-green-500';
  if (rate >= 0.6) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MisconceptionRow({
  misconception,
}: {
  misconception: MisconceptionSummary;
}) {
  const tagDef = getMisconceptionTag(misconception.tag);
  const label = tagDef?.label ?? misconception.tag;
  const category = tagDef?.category ?? 'mechanics';

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {category}
          </Badge>
        </div>
        {tagDef?.description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{tagDef.description}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold text-foreground">{misconception.count}</div>
        <div className="text-[10px] text-muted-foreground">
          {misconception.affectedStudents.length} student{misconception.affectedStudents.length === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
}

function PartAccuracyRow({ part }: { part: PartOutcomeSummary }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm text-foreground">{part.partId}</span>
        <span className={`text-sm font-medium tabular-nums ${accuracyColor(part.accuracyRate)}`}>
          {formatAccuracy(part.accuracyRate)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Progress
          value={part.accuracyRate * 100}
          className={`h-1.5 flex-1 ${progressColor(part.accuracyRate)}`}
        />
        <span className="w-20 text-right text-[11px] text-muted-foreground">
          {part.correctCount}/{part.totalAttempts} correct
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LessonErrorSummary
// ---------------------------------------------------------------------------

/**
 * Class-wide error summary for a lesson, showing misconception overview
 * and per-part accuracy rates. Fetches from /api/teacher/error-summary.
 * Displays gracefully when no practice submissions exist yet.
 */
export function LessonErrorSummary({ lessonId }: LessonErrorSummaryProps) {
  const [summary, setSummary] = useState<DeterministicErrorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    setSummary(null);

    fetch(`/api/teacher/error-summary?lessonId=${encodeURIComponent(lessonId)}`)
      .then((res) => {
        if (res.status === 404) {
          return null;
        }
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.error ?? `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data: DeterministicErrorSummary | null) => {
        if (!cancelled) {
          setSummary(data);
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
  }, [lessonId]);

  if (isLoading) {
    return (
      <Card className="border-border/80">
        <CardContent className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Loading error summary…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/80">
        <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="border-border/80 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No practice submissions recorded for this lesson yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Error analysis will appear once students submit practice work.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPartSummaries = summary.partSummaries.length > 0;
  const hasMisconceptions = summary.topMisconceptions.length > 0;

  return (
    <div className="space-y-4">
      {/* Overview stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/80">
          <CardContent className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Students
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-lg font-semibold text-foreground">
                {summary.studentCount}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Class Accuracy
            </div>
            <div className={`mt-1 text-lg font-semibold ${accuracyColor(summary.averageAccuracy)}`}>
              {formatAccuracy(summary.averageAccuracy)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Top Misconception
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {hasMisconceptions
                ? (getMisconceptionTag(summary.topMisconceptions[0].tag)?.label ?? summary.topMisconceptions[0].tag)
                : 'None detected'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Misconception overview */}
      {hasMisconceptions ? (
        <Card className="border-border/80">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Misconception Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {summary.topMisconceptions.map((misconception) => (
              <MisconceptionRow key={misconception.tag} misconception={misconception} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Per-part accuracy */}
      {hasPartSummaries ? (
        <Card className="border-border/80">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-sm font-semibold">Per-Part Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {summary.partSummaries.map((part) => (
              <PartAccuracyRow key={part.partId} part={part} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* AI Insights placeholder */}
      <Card className="border-border/80 border-dashed">
        <CardContent className="flex items-start gap-3 px-4 py-4">
          <Brain className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">AI Insights</span> are available
            per-student through the submission detail view. Open a student&apos;s submission in the
            gradebook to see AI-assisted error analysis and suggested interventions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
