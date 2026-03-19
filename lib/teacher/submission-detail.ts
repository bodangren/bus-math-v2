/**
 * Submission Detail — teacher read-only evidence view (Phase 3)
 *
 * Pure assembly function + data fetch for the SubmissionDetailModal.
 * The fetch function is intentionally impure (DB access) and should only be
 * called from server components or API routes.
 */

import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  activitySubmissions,
  activities,
  lessons,
  lessonVersions,
  phaseVersions,
  studentProgress,
  activityCompletions,
  studentSpreadsheetResponses,
} from '@/lib/db/schema';
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

// ---------------------------------------------------------------------------
// Data fetch (impure — DB access)
// ---------------------------------------------------------------------------

/**
 * Fetches phase-level submission detail for one student × lesson.
 *
 * Returns null when the lesson or its published version cannot be found.
 * Callers MUST verify org-scoping (student belongs to teacher's org)
 * before invoking this function.
 */
export async function fetchSubmissionDetail(
  studentId: string,
  lessonId: string,
  studentName: string,
): Promise<SubmissionDetail | null> {
  // 1 — lesson title
  const [lesson] = await db
    .select({ title: lessons.title })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) return null;

  // 2 — published lesson version
  const [lessonVersion] = await db
    .select({ id: lessonVersions.id })
    .from(lessonVersions)
    .where(
      and(
        eq(lessonVersions.lessonId, lessonId),
        eq(lessonVersions.status, 'published'),
      ),
    )
    .limit(1);

  if (!lessonVersion) return null;

  // 3 — phase versions for this lesson version
  const rawPhases = await db
    .select({
      id: phaseVersions.id,
      phaseNumber: phaseVersions.phaseNumber,
      title: phaseVersions.title,
    })
    .from(phaseVersions)
    .where(eq(phaseVersions.lessonVersionId, lessonVersion.id));

  if (rawPhases.length === 0) return null;

  const phaseIds = rawPhases.map((p) => p.id);

  // 4 — student progress + activity completions (parallel)
  const [progressRows, completionRows] = await Promise.all([
    db
      .select({
        phaseId: studentProgress.phaseId,
        status: studentProgress.status,
        completedAt: studentProgress.completedAt,
      })
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, studentId),
          inArray(studentProgress.phaseId, phaseIds),
        ),
      ),

    db
      .select({
        phaseNumber: activityCompletions.phaseNumber,
        activityId: activityCompletions.activityId,
      })
      .from(activityCompletions)
      .where(
        and(
          eq(activityCompletions.studentId, studentId),
          eq(activityCompletions.lessonId, lessonId),
        ),
      ),
  ]);

  // 5 — spreadsheet and practice evidence for phases that had activity submissions
  const spreadsheetByPhaseNumber = new Map<number, SpreadsheetData>();
  const evidenceByPhaseNumber = new Map<number, SubmissionEvidence[]>();
  if (completionRows.length > 0) {
    const activityIds = completionRows.map((c) => c.activityId);
    const phaseByActivityId = new Map<string, number>();
    for (const c of completionRows) {
      phaseByActivityId.set(c.activityId, c.phaseNumber);
    }

    const [spreadsheetRows, practiceRows, activityRows] = await Promise.all([
      db
        .select({
          activityId: studentSpreadsheetResponses.activityId,
          spreadsheetData: studentSpreadsheetResponses.spreadsheetData,
          submittedAt: studentSpreadsheetResponses.submittedAt,
          updatedAt: studentSpreadsheetResponses.updatedAt,
        })
        .from(studentSpreadsheetResponses)
        .where(
          and(
            eq(studentSpreadsheetResponses.studentId, studentId),
            inArray(studentSpreadsheetResponses.activityId, activityIds),
          ),
        ),

      db
        .select({
          activityId: activitySubmissions.activityId,
          submissionData: activitySubmissions.submissionData,
          score: activitySubmissions.score,
          maxScore: activitySubmissions.maxScore,
          feedback: activitySubmissions.feedback,
          submittedAt: activitySubmissions.submittedAt,
          updatedAt: activitySubmissions.updatedAt,
        })
        .from(activitySubmissions)
        .where(
          and(
            eq(activitySubmissions.userId, studentId),
            inArray(activitySubmissions.activityId, activityIds),
          ),
        ),

      db
        .select({
          id: activities.id,
          displayName: activities.displayName,
          componentKey: activities.componentKey,
        })
        .from(activities)
        .where(inArray(activities.id, activityIds)),
    ]);

    const activityById = new Map(activityRows.map((row) => [row.id, row] as const));

    for (const row of spreadsheetRows) {
      const phaseNum = phaseByActivityId.get(row.activityId);
      if (phaseNum !== undefined && row.spreadsheetData) {
        spreadsheetByPhaseNumber.set(phaseNum, row.spreadsheetData);

        const activity = activityById.get(row.activityId);
        const evidence: SubmissionEvidence = {
          kind: 'spreadsheet',
          activityId: row.activityId,
          activityTitle: activity?.displayName ?? 'Spreadsheet activity',
          componentKey: activity?.componentKey ?? 'spreadsheet',
          submittedAt:
            row.submittedAt?.toISOString() ?? row.updatedAt.toISOString() ?? new Date().toISOString(),
          spreadsheetData: row.spreadsheetData,
        };

        const currentEvidence = evidenceByPhaseNumber.get(phaseNum) ?? [];
        currentEvidence.push(evidence);
        evidenceByPhaseNumber.set(phaseNum, currentEvidence);
      }
    }

    const latestPracticeByActivity = new Map<string, (typeof practiceRows)[number]>();
    for (const row of practiceRows) {
      const current = latestPracticeByActivity.get(row.activityId);
      if (!current) {
        latestPracticeByActivity.set(row.activityId, row);
        continue;
      }

      const currentSubmittedAt = current.submittedAt?.getTime() ?? 0;
      const nextSubmittedAt = row.submittedAt?.getTime() ?? 0;
      const currentUpdatedAt = current.updatedAt?.getTime() ?? 0;
      const nextUpdatedAt = row.updatedAt?.getTime() ?? 0;

      if (
        nextSubmittedAt > currentSubmittedAt ||
        (nextSubmittedAt === currentSubmittedAt && nextUpdatedAt >= currentUpdatedAt)
      ) {
        latestPracticeByActivity.set(row.activityId, row);
      }
    }

    for (const [activityId, row] of latestPracticeByActivity.entries()) {
      const phaseNum = phaseByActivityId.get(activityId);
      if (phaseNum === undefined) {
        continue;
      }

      const activity = activityById.get(activityId);
      const submissionData = row.submissionData as Record<string, unknown>;
      const evidence: SubmissionEvidence = {
        kind: 'practice',
        activityId,
        activityTitle: activity?.displayName ?? 'Practice submission',
        componentKey: activity?.componentKey ?? 'practice',
        submittedAt: row.submittedAt?.toISOString() ?? new Date().toISOString(),
        attemptNumber: typeof submissionData.attemptNumber === 'number'
          ? submissionData.attemptNumber
          : 1,
        score: row.score ?? null,
        maxScore: row.maxScore ?? null,
        feedback: row.feedback ?? null,
        submissionData: row.submissionData as PracticeSubmissionEnvelope | Record<string, unknown>,
      };

      const currentEvidence = evidenceByPhaseNumber.get(phaseNum) ?? [];
      currentEvidence.push(evidence);
      evidenceByPhaseNumber.set(phaseNum, currentEvidence);
    }
  }

  // 6 — cast timestamp fields and assemble
  const typedProgressRows: RawProgressRow[] = progressRows.map((r) => ({
    phaseId: r.phaseId,
    status: r.status as 'not_started' | 'in_progress' | 'completed' | null,
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
  }));

  return assembleSubmissionDetail(
    studentName,
    lesson.title,
    rawPhases,
    typedProgressRows,
    spreadsheetByPhaseNumber,
    evidenceByPhaseNumber,
  );
}
