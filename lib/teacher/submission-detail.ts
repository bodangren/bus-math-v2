/**
 * Submission Detail — teacher read-only evidence view (Phase 3)
 *
 * Pure assembly function + data fetch for the SubmissionDetailModal.
 * The fetch function is intentionally impure (DB access) and should only be
 * called from server components or API routes.
 */

import type { SpreadsheetData } from '@/lib/db/schema/spreadsheet-responses';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fallback phase names used when phase_versions.title is null. */
const DEFAULT_PHASE_NAMES: Record<number, string> = {
  1: 'Hook',
  2: 'Introduction',
  3: 'Guided Practice',
  4: 'Independent Practice',
  5: 'Assessment',
  6: 'Closing',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';

export interface SpreadsheetEvidence {
  kind: 'spreadsheet';
  activityId: string;
  activityTitle: string;
  componentKey: string;
  submittedAt: string | null;
  spreadsheetData: SpreadsheetData;
}

export interface PracticeEvidence {
  kind: 'practice';
  activityId: string;
  activityTitle: string;
  componentKey: string;
  submittedAt: string;
  attemptNumber: number;
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  submissionData: PracticeSubmissionEnvelope | Record<string, unknown>;
}

export type SubmissionEvidence = SpreadsheetEvidence | PracticeEvidence;

export interface PhaseDetail {
  phaseNumber: number;
  phaseId: string;
  title: string;
  status: PhaseStatus;
  completedAt: string | null;
  /** Populated when the student submitted a spreadsheet activity in this phase. */
  spreadsheetData: SpreadsheetData | null;
  evidence?: SubmissionEvidence[];
}

export interface SubmissionDetail {
  studentName: string;
  lessonTitle: string;
  phases: PhaseDetail[];
}

// ---------------------------------------------------------------------------
// Internal raw types (used for assembly)
// ---------------------------------------------------------------------------

export interface RawPhaseVersion {
  id: string;
  phaseNumber: number;
  title: string | null;
}

export interface RawProgressRow {
  phaseId: string;
  status: 'not_started' | 'in_progress' | 'completed' | null;
  completedAt: string | null;
}

// ---------------------------------------------------------------------------
// Pure assembly (no DB access — fully unit-testable)
// ---------------------------------------------------------------------------

/**
 * Assembles a SubmissionDetail from raw DB query results.
 * All parameters are plain data with no database access.
 */
export function assembleSubmissionDetail(
  studentName: string,
  lessonTitle: string,
  rawPhases: RawPhaseVersion[],
  progressRows: RawProgressRow[],
  spreadsheetByPhaseNumber: Map<number, SpreadsheetData>,
  evidenceByPhaseNumber: Map<number, SubmissionEvidence[]> = new Map(),
): SubmissionDetail {
  const progressByPhaseId = new Map<string, RawProgressRow>();
  for (const row of progressRows) {
    progressByPhaseId.set(row.phaseId, row);
  }

  const phases: PhaseDetail[] = [...rawPhases]
    .sort((a, b) => a.phaseNumber - b.phaseNumber)
    .map((phase) => {
      const progress = progressByPhaseId.get(phase.id);
      const status: PhaseStatus = progress?.status ?? 'not_started';
      const title =
        phase.title?.trim() ||
        DEFAULT_PHASE_NAMES[phase.phaseNumber] ||
        `Phase ${phase.phaseNumber}`;

      return {
        phaseNumber: phase.phaseNumber,
        phaseId: phase.id,
        title,
        status,
        completedAt: progress?.completedAt ?? null,
        spreadsheetData: spreadsheetByPhaseNumber.get(phase.phaseNumber) ?? null,
        evidence: evidenceByPhaseNumber.get(phase.phaseNumber) ?? [],
      };
    });

  return { studentName, lessonTitle, phases };
}

