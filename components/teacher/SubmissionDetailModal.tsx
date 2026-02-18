'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, CheckCircle2, Clock, Circle, Loader2 } from 'lucide-react';
import { SpreadsheetWrapper } from '@/components/spreadsheet/SpreadsheetWrapper';
import type { PhaseDetail, PhaseStatus, SubmissionDetail } from '@/lib/teacher/submission-detail';

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

// ---------------------------------------------------------------------------
// Phase status helpers
// ---------------------------------------------------------------------------

function PhaseStatusIcon({ status }: { status: PhaseStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />;
  }
  if (status === 'in_progress') {
    return <Clock className="size-4 shrink-0 text-yellow-500" aria-hidden="true" />;
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

// ---------------------------------------------------------------------------
// Phase row
// ---------------------------------------------------------------------------

function PhaseRow({ phase }: { phase: PhaseDetail }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PhaseStatusIcon status={phase.status} />
          <span className="text-sm font-medium text-foreground">
            Phase {phase.phaseNumber}: {phase.title}
          </span>
        </div>
        <StatusBadge status={phase.status} />
      </div>

      {phase.completedAt && (
        <p className="text-xs text-muted-foreground pl-6">
          Completed {new Date(phase.completedAt).toLocaleDateString()}
        </p>
      )}

      {phase.spreadsheetData && (
        <div
          className="mt-2 overflow-x-auto rounded border border-border"
          aria-label={`Spreadsheet submission for Phase ${phase.phaseNumber}`}
        >
          <SpreadsheetWrapper
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            initialData={phase.spreadsheetData as any}
            readOnly
            className="text-xs"
          />
        </div>
      )}
    </div>
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

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch on mount / when selection changes
  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setDetail(null);
    setError(null);

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

  // Focus the close button when the modal opens
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // ESC key closes the modal
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

  // Click on backdrop closes the modal
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[8vh]"
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Submission detail: ${selected.studentName} — ${selected.lessonTitle}`}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-foreground leading-tight">
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">Loading phases…</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {detail && !isLoading && (
            <div className="space-y-2" data-testid="phase-list">
              {detail.phases.map((phase) => (
                <PhaseRow key={phase.phaseId} phase={phase} />
              ))}
            </div>
          )}
        </div>

        {/* Footer — read-only callout */}
        <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Read-only view — teacher cannot edit student work from this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
