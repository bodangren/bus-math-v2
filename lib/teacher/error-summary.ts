/**
 * Error Summary Assembly — deterministic teacher-facing summaries
 *
 * Aggregates misconception tags, correctness rates, and scaffold metrics
 * from normalized practice.v1 submission evidence so teachers can interpret
 * student work faster without losing direct access to the underlying data.
 */

import type { PracticeEvidence, SubmissionEvidence, SubmissionDetail } from '@/lib/teacher/submission-detail';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MisconceptionFrequency {
  tag: string;
  count: number;
  partIds: string[];
}

export interface ActivityErrorSummary {
  activityId: string;
  activityTitle: string;
  mode: string | null;
  totalParts: number;
  correctParts: number;
  incorrectParts: number;
  correctnessRate: number | null;
  misconceptionTags: MisconceptionFrequency[];
  hintsUsed: number;
  revealStepsSeen: number;
  editsMade: number;
}

export interface LessonErrorSummary {
  studentName: string;
  lessonTitle: string;
  activities: ActivityErrorSummary[];
  totalParts: number;
  correctParts: number;
  incorrectParts: number;
  overallCorrectnessRate: number | null;
  topMisconceptions: MisconceptionFrequency[];
  totalHintsUsed: number;
  totalRevealsSeen: number;
  totalEditsMade: number;
  attemptNumber: number | null;
  latestSubmittedAt: string | null;
}

// ---------------------------------------------------------------------------
// Pure assembly functions (no DB access — fully unit-testable)
// ---------------------------------------------------------------------------

function extractPartsFromEvidence(evidence: SubmissionEvidence): Record<string, unknown>[] {
  if (evidence.kind !== 'practice') return [];
  const submissionData = evidence.submissionData as Record<string, unknown>;
  return Array.isArray(submissionData.parts)
    ? (submissionData.parts as Record<string, unknown>[])
    : [];
}

function getActivityMode(evidence: SubmissionEvidence): string | null {
  if (evidence.kind !== 'practice') return null;
  const submissionData = evidence.submissionData as Record<string, unknown>;
  return typeof submissionData.mode === 'string' ? submissionData.mode : null;
}

function computeMisconceptionFrequencies(parts: Record<string, unknown>[]): MisconceptionFrequency[] {
  const tagMap = new Map<string, { count: number; partIds: string[] }>();

  for (const part of parts) {
    const partId = typeof part.partId === 'string' ? part.partId : 'unknown';
    const tags = Array.isArray(part.misconceptionTags)
      ? (part.misconceptionTags as unknown[]).filter((t): t is string => typeof t === 'string')
      : [];

    for (const tag of tags) {
      const trimmed = tag.trim();
      if (!trimmed) continue;

      const existing = tagMap.get(trimmed) ?? { count: 0, partIds: [] };
      existing.count += 1;
      if (!existing.partIds.includes(partId)) {
        existing.partIds.push(partId);
      }
      tagMap.set(trimmed, existing);
    }
  }

  return [...tagMap.entries()]
    .map(([tag, data]) => ({ tag, count: data.count, partIds: data.partIds }))
    .sort((a, b) => b.count - a.count);
}

function computeScaffoldMetrics(parts: Record<string, unknown>[]): {
  hintsUsed: number;
  revealStepsSeen: number;
  editsMade: number;
} {
  let hintsUsed = 0;
  let revealStepsSeen = 0;
  let editsMade = 0;

  for (const part of parts) {
    if (typeof part.hintsUsed === 'number') hintsUsed += part.hintsUsed;
    if (typeof part.revealStepsSeen === 'number') revealStepsSeen += part.revealStepsSeen;
    if (typeof part.changedCount === 'number') editsMade += part.changedCount;
  }

  return { hintsUsed, revealStepsSeen, editsMade };
}

/**
 * Build an error summary for a single practice evidence item.
 */
export function buildActivityErrorSummary(evidence: PracticeEvidence): ActivityErrorSummary {
  const parts = extractPartsFromEvidence(evidence);
  const mode = getActivityMode(evidence);

  const totalParts = parts.length;
  const correctParts = parts.filter((p) => p.isCorrect === true).length;
  const incorrectParts = parts.filter((p) => p.isCorrect === false).length;
  const correctnessRate = totalParts > 0 ? correctParts / totalParts : null;

  const misconceptionTags = computeMisconceptionFrequencies(parts);
  const scaffold = computeScaffoldMetrics(parts);

  return {
    activityId: evidence.activityId,
    activityTitle: evidence.activityTitle,
    mode,
    totalParts,
    correctParts,
    incorrectParts,
    correctnessRate,
    misconceptionTags,
    hintsUsed: scaffold.hintsUsed,
    revealStepsSeen: scaffold.revealStepsSeen,
    editsMade: scaffold.editsMade,
  };
}

/**
 * Build a lesson-level error summary from a full SubmissionDetail.
 *
 * Aggregates across all practice evidence in all phases, producing
 * per-activity summaries plus lesson-wide totals and top misconceptions.
 */
export function buildLessonErrorSummary(detail: SubmissionDetail): LessonErrorSummary {
  const activities: ActivityErrorSummary[] = [];
  let totalParts = 0;
  let correctParts = 0;
  let incorrectParts = 0;
  let totalHintsUsed = 0;
  let totalRevealsSeen = 0;
  let totalEditsMade = 0;
  let attemptNumber: number | null = null;
  let latestSubmittedAt: string | null = null;

  const globalTagMap = new Map<string, { count: number; partIds: string[] }>();

  for (const phase of detail.phases) {
    for (const evidence of phase.evidence ?? []) {
      if (evidence.kind !== 'practice') continue;

      const summary = buildActivityErrorSummary(evidence);
      activities.push(summary);

      totalParts += summary.totalParts;
      correctParts += summary.correctParts;
      incorrectParts += summary.incorrectParts;
      totalHintsUsed += summary.hintsUsed;
      totalRevealsSeen += summary.revealStepsSeen;
      totalEditsMade += summary.editsMade;

      attemptNumber = Math.max(attemptNumber ?? 0, evidence.attemptNumber ?? 0);

      if (!latestSubmittedAt || new Date(evidence.submittedAt).getTime() > new Date(latestSubmittedAt).getTime()) {
        latestSubmittedAt = evidence.submittedAt;
      }

      for (const freq of summary.misconceptionTags) {
        const existing = globalTagMap.get(freq.tag) ?? { count: 0, partIds: [] };
        existing.count += freq.count;
        for (const partId of freq.partIds) {
          if (!existing.partIds.includes(partId)) {
            existing.partIds.push(partId);
          }
        }
        globalTagMap.set(freq.tag, existing);
      }
    }
  }

  const overallCorrectnessRate = totalParts > 0 ? correctParts / totalParts : null;

  const topMisconceptions = [...globalTagMap.entries()]
    .map(([tag, data]) => ({ tag, count: data.count, partIds: data.partIds }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    studentName: detail.studentName,
    lessonTitle: detail.lessonTitle,
    activities,
    totalParts,
    correctParts,
    incorrectParts,
    overallCorrectnessRate,
    topMisconceptions,
    totalHintsUsed,
    totalRevealsSeen,
    totalEditsMade,
    attemptNumber: attemptNumber !== null && attemptNumber > 0 ? attemptNumber : null,
    latestSubmittedAt,
  };
}

/**
 * Generate a concise deterministic text summary for teacher review.
 *
 * Returns a human-readable string that highlights the student's
 * performance, top misconceptions, and scaffold usage patterns.
 */
export function generateDeterministicSummary(summary: LessonErrorSummary): string {
  if (summary.totalParts === 0) {
    return `No practice evidence available for ${summary.studentName} in "${summary.lessonTitle}".`;
  }

  const lines: string[] = [];

  // Overall performance
  const pct = summary.overallCorrectnessRate !== null
    ? Math.round(summary.overallCorrectnessRate * 100)
    : null;
  lines.push(
    `${summary.studentName} completed ${summary.totalParts} parts across ${summary.activities.length} activity(ies)` +
    (pct !== null ? `, scoring ${pct}% correct` : '') +
    (summary.attemptNumber !== null ? ` on attempt ${summary.attemptNumber}` : '') +
    '.'
  );

  // Top misconceptions
  if (summary.topMisconceptions.length > 0) {
    const topTags = summary.topMisconceptions.slice(0, 3);
    const tagList = topTags.map((f) => `"${f.tag}" (${f.count} occurrence${f.count > 1 ? 's' : ''})`).join(', ');
    lines.push(`Most frequent misconceptions: ${tagList}.`);
  } else {
    lines.push('No misconception tags were recorded.');
  }

  // Scaffold usage
  if (summary.totalHintsUsed > 0 || summary.totalRevealsSeen > 0 || summary.totalEditsMade > 0) {
    lines.push(
      `Scaffold usage: ${summary.totalHintsUsed} hint(s), ${summary.totalRevealsSeen} reveal(s), ${summary.totalEditsMade} edit(s).`
    );
  }

  // Per-activity breakdown (only if multiple activities)
  if (summary.activities.length > 1) {
    lines.push('Activity breakdown:');
    for (const activity of summary.activities) {
      const activityPct = activity.correctnessRate !== null
        ? Math.round(activity.correctnessRate * 100)
        : null;
      const scoreStr = activityPct !== null ? `${activityPct}%` : 'unscored';
      lines.push(`  - ${activity.activityTitle}: ${activity.correctParts}/${activity.totalParts} correct (${scoreStr})`);
    }
  }

  return lines.join('\n');
}
