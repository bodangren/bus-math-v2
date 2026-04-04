import { describe, it, expect, vi } from 'vitest';

// Mock DB so importing submission-detail doesn't require DATABASE_URL
vi.mock('@/lib/db/drizzle', () => ({ db: {} }));

import {
  assembleSubmissionDetail,
  type RawPhaseVersion,
  type PracticeEvidence,
  type SubmissionEvidence,
} from '@/lib/teacher/submission-detail';
import {
  buildActivityErrorSummary,
  buildLessonErrorSummary,
  generateDeterministicSummary,
} from '@/lib/teacher/error-summary';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PHASES: RawPhaseVersion[] = [
  { id: 'phase-1', phaseNumber: 1, title: 'Hook' },
  { id: 'phase-2', phaseNumber: 2, title: 'Introduction' },
  { id: 'phase-3', phaseNumber: 3, title: 'Guided Practice' },
  { id: 'phase-4', phaseNumber: 4, title: 'Independent Practice' },
  { id: 'phase-5', phaseNumber: 5, title: 'Assessment' },
];

function makePracticeEvidence(overrides: Partial<PracticeEvidence> = {}): PracticeEvidence {
  return {
    kind: 'practice',
    activityId: 'activity-1',
    activityTitle: 'Journal Entry Practice',
    componentKey: 'journal-entry-building',
    submittedAt: '2026-03-19T12:30:00.000Z',
    attemptNumber: 1,
    score: null,
    maxScore: null,
    feedback: null,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: 'activity-1',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-03-19T12:30:00.000Z',
      answers: {},
      parts: [],
    },
    ...overrides,
  };
}

function makePart(overrides: Record<string, unknown> = {}) {
  return {
    partId: 'part-1',
    rawAnswer: 'Cash',
    normalizedAnswer: 'cash',
    isCorrect: true,
    misconceptionTags: [],
    ...overrides,
  };
}

function makeSubmissionDetail(
  evidenceMap: Map<number, SubmissionEvidence[]> = new Map(),
) {
  return assembleSubmissionDetail('Alice Brown', 'Lesson 1: Accounting Equation', PHASES, [], new Map(), evidenceMap);
}

// ---------------------------------------------------------------------------
// buildActivityErrorSummary
// ---------------------------------------------------------------------------

describe('buildActivityErrorSummary', () => {
  it('computes correctness rate from parts', () => {
    const evidence = makePracticeEvidence({
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'act-1',
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-03-19T12:30:00.000Z',
        answers: {},
        parts: [
          makePart({ partId: 'q1', isCorrect: true }),
          makePart({ partId: 'q2', isCorrect: false }),
          makePart({ partId: 'q3', isCorrect: true }),
          makePart({ partId: 'q4', isCorrect: false }),
        ],
      },
    });

    const summary = buildActivityErrorSummary(evidence);

    expect(summary.totalParts).toBe(4);
    expect(summary.correctParts).toBe(2);
    expect(summary.incorrectParts).toBe(2);
    expect(summary.correctnessRate).toBe(0.5);
  });

  it('aggregates misconception tag frequencies', () => {
    const evidence = makePracticeEvidence({
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'act-1',
        mode: 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-03-19T12:30:00.000Z',
        answers: {},
        parts: [
          makePart({ partId: 'q1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
          makePart({ partId: 'q2', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
          makePart({ partId: 'q3', isCorrect: false, misconceptionTags: ['amount-error'] }),
          makePart({ partId: 'q4', isCorrect: false, misconceptionTags: ['normal-balance-error', 'amount-error'] }),
        ],
      },
    });

    const summary = buildActivityErrorSummary(evidence);

    expect(summary.misconceptionTags).toHaveLength(2);
    expect(summary.misconceptionTags[0]).toMatchObject({ tag: 'normal-balance-error', count: 3 });
    expect(summary.misconceptionTags[1]).toMatchObject({ tag: 'amount-error', count: 2 });
  });

  it('sums scaffold metrics across parts', () => {
    const evidence = makePracticeEvidence({
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: 'act-1',
        mode: 'guided_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: '2026-03-19T12:30:00.000Z',
        answers: {},
        parts: [
          { partId: 'q1', rawAnswer: 'Cash', hintsUsed: 2, revealStepsSeen: 1, changedCount: 3 },
          { partId: 'q2', rawAnswer: 'Revenue', hintsUsed: 0, revealStepsSeen: 0, changedCount: 1 },
          { partId: 'q3', rawAnswer: 'Expense', hintsUsed: 1, revealStepsSeen: 2, changedCount: 0 },
        ],
      },
    });

    const summary = buildActivityErrorSummary(evidence);

    expect(summary.hintsUsed).toBe(3);
    expect(summary.revealStepsSeen).toBe(3);
    expect(summary.editsMade).toBe(4);
  });

  it('handles empty parts array', () => {
    const evidence = makePracticeEvidence();
    const summary = buildActivityErrorSummary(evidence);

    expect(summary.totalParts).toBe(0);
    expect(summary.correctnessRate).toBeNull();
    expect(summary.misconceptionTags).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildLessonErrorSummary
// ---------------------------------------------------------------------------

describe('buildLessonErrorSummary', () => {
  it('aggregates across all activities in a lesson', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        3,
        [
          makePracticeEvidence({
            activityId: 'guided-1',
            activityTitle: 'Guided Journal Entries',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'guided-1',
              mode: 'guided_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T10:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'g1', isCorrect: true }),
                makePart({ partId: 'g2', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
              ],
            },
          }),
        ],
      ],
      [
        4,
        [
          makePracticeEvidence({
            activityId: 'indep-1',
            activityTitle: 'Independent Journal Entries',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'indep-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T11:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'i1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'i2', isCorrect: false, misconceptionTags: ['amount-error'] }),
              ],
            },
          }),
        ],
      ],
      [
        5,
        [
          makePracticeEvidence({
            activityId: 'assess-1',
            activityTitle: 'Unit Assessment',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'assess-1',
              mode: 'assessment',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'a1', isCorrect: true }),
                makePart({ partId: 'a2', isCorrect: true }),
              ],
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);

    expect(summary.studentName).toBe('Alice Brown');
    expect(summary.lessonTitle).toBe('Lesson 1: Accounting Equation');
    expect(summary.activities).toHaveLength(3);
    expect(summary.totalParts).toBe(6);
    expect(summary.correctParts).toBe(3);
    expect(summary.incorrectParts).toBe(3);
    expect(summary.overallCorrectnessRate).toBe(0.5);
    expect(summary.topMisconceptions).toHaveLength(2);
    expect(summary.topMisconceptions[0]).toMatchObject({ tag: 'normal-balance-error', count: 2 });
    expect(summary.topMisconceptions[1]).toMatchObject({ tag: 'amount-error', count: 1 });
  });

  it('returns empty summary when no practice evidence exists', () => {
    const detail = makeSubmissionDetail();
    const summary = buildLessonErrorSummary(detail);

    expect(summary.totalParts).toBe(0);
    expect(summary.activities).toHaveLength(0);
    expect(summary.overallCorrectnessRate).toBeNull();
    expect(summary.topMisconceptions).toHaveLength(0);
  });

  it('tracks attempt number and latest submission time', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            attemptNumber: 2,
            submittedAt: '2026-03-19T10:00:00.000Z',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 2,
              submittedAt: '2026-03-19T10:00:00.000Z',
              answers: {},
              parts: [makePart({ partId: 'q1', isCorrect: true })],
            },
          }),
        ],
      ],
      [
        5,
        [
          makePracticeEvidence({
            attemptNumber: 1,
            submittedAt: '2026-03-19T12:00:00.000Z',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-2',
              mode: 'assessment',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:00:00.000Z',
              answers: {},
              parts: [makePart({ partId: 'r1', isCorrect: true })],
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);

    expect(summary.attemptNumber).toBe(2);
    expect(summary.latestSubmittedAt).toBe('2026-03-19T12:00:00.000Z');
  });

  it('limits top misconceptions to 10 entries', () => {
    const parts = Array.from({ length: 20 }, (_, i) =>
      makePart({ partId: `q${i}`, isCorrect: false, misconceptionTags: [`tag-${i % 15}`] })
    );

    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts,
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);

    expect(summary.topMisconceptions.length).toBeLessThanOrEqual(10);
  });
});

// ---------------------------------------------------------------------------
// generateDeterministicSummary
// ---------------------------------------------------------------------------

describe('generateDeterministicSummary', () => {
  it('returns message when no evidence available', () => {
    const detail = makeSubmissionDetail();
    const summary = buildLessonErrorSummary(detail);
    const text = generateDeterministicSummary(summary);

    expect(text).toContain('No practice evidence available');
    expect(text).toContain('Alice Brown');
    expect(text).toContain('Lesson 1: Accounting Equation');
  });

  it('includes overall performance metrics', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            attemptNumber: 2,
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 2,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: true }),
                makePart({ partId: 'q2', isCorrect: false }),
                makePart({ partId: 'q3', isCorrect: true }),
              ],
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);
    const text = generateDeterministicSummary(summary);

    expect(text).toContain('3 parts');
    expect(text).toContain('67% correct');
    expect(text).toContain('attempt 2');
  });

  it('lists top misconceptions', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'q2', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'q3', isCorrect: false, misconceptionTags: ['amount-error'] }),
              ],
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);
    const text = generateDeterministicSummary(summary);

    expect(text).toContain('normal-balance-error');
    expect(text).toContain('amount-error');
  });

  it('includes scaffold usage when present', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-1',
              mode: 'guided_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                { partId: 'q1', rawAnswer: 'Cash', hintsUsed: 2, revealStepsSeen: 1, changedCount: 3 },
                { partId: 'q2', rawAnswer: 'Revenue', hintsUsed: 1, revealStepsSeen: 0, changedCount: 0 },
              ],
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);
    const text = generateDeterministicSummary(summary);

    expect(text).toContain('3 hint(s)');
    expect(text).toContain('1 reveal(s)');
    expect(text).toContain('3 edit(s)');
  });

  it('includes per-activity breakdown when multiple activities exist', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            activityId: 'act-1',
            activityTitle: 'Activity One',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T10:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: true }),
                makePart({ partId: 'q2', isCorrect: false }),
              ],
            },
          }),
        ],
      ],
      [
        5,
        [
          makePracticeEvidence({
            activityId: 'act-2',
            activityTitle: 'Activity Two',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'act-2',
              mode: 'assessment',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'r1', isCorrect: true }),
                makePart({ partId: 'r2', isCorrect: true }),
              ],
            },
          }),
        ],
      ],
    ]);

    const detail = makeSubmissionDetail(evidenceMap);
    const summary = buildLessonErrorSummary(detail);
    const text = generateDeterministicSummary(summary);

    expect(text).toContain('Activity breakdown:');
    expect(text).toContain('Activity One');
    expect(text).toContain('Activity Two');
  });
});

// ---------------------------------------------------------------------------
// Deterministic error summary assembly (existing tests via assembly)
// ---------------------------------------------------------------------------

describe('deterministic error summary assembly', () => {
  it('aggregates misconception tags across all practice evidence', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            activityId: 'activity-1',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'q2', isCorrect: true, misconceptionTags: [] }),
                makePart({ partId: 'q3', isCorrect: false, misconceptionTags: ['contra-account-same-as-parent'] }),
              ],
            },
          }),
        ],
      ],
      [
        5,
        [
          makePracticeEvidence({
            activityId: 'activity-2',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-2',
              mode: 'assessment',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T13:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'r1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'r2', isCorrect: false, misconceptionTags: ['amount-error'] }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);

    const allTags = new Set<string>();
    for (const phase of result.phases) {
      for (const ev of phase.evidence ?? []) {
        if (ev.kind === 'practice') {
          const parts = (ev.submissionData as Record<string, unknown>).parts as Record<string, unknown>[];
          for (const part of parts) {
            const tags = (part.misconceptionTags as string[]) ?? [];
            for (const tag of tags) {
              allTags.add(tag);
            }
          }
        }
      }
    }

    expect(allTags.has('normal-balance-error')).toBe(true);
    expect(allTags.has('contra-account-same-as-parent')).toBe(true);
    expect(allTags.has('amount-error')).toBe(true);
    expect(allTags.size).toBe(3);
  });

  it('computes per-activity correctness rate', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            activityId: 'activity-1',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: true }),
                makePart({ partId: 'q2', isCorrect: false }),
                makePart({ partId: 'q3', isCorrect: true }),
                makePart({ partId: 'q4', isCorrect: false }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    const ev = phase4.evidence?.[0] as PracticeEvidence;
    const parts = (ev.submissionData as Record<string, unknown>).parts as Record<string, unknown>[];

    const correct = parts.filter((p) => p.isCorrect === true).length;
    const total = parts.length;
    const rate = correct / total;

    expect(rate).toBe(0.5);
    expect(correct).toBe(2);
    expect(total).toBe(4);
  });

  it('identifies most frequent misconception tag across submission', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'q2', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'q3', isCorrect: false, misconceptionTags: ['amount-error'] }),
                makePart({ partId: 'q4', isCorrect: false, misconceptionTags: ['normal-balance-error', 'amount-error'] }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    const ev = phase4.evidence?.[0] as PracticeEvidence;
    const parts = (ev.submissionData as Record<string, unknown>).parts as Record<string, unknown>[];

    const tagCounts = new Map<string, number>();
    for (const part of parts) {
      const tags = (part.misconceptionTags as string[]) ?? [];
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    expect(tagCounts.get('normal-balance-error')).toBe(3);
    expect(tagCounts.get('amount-error')).toBe(2);
  });

  it('handles submissions with no misconception tags gracefully', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: true, misconceptionTags: [] }),
                makePart({ partId: 'q2', isCorrect: true, misconceptionTags: [] }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    const ev = phase4.evidence?.[0] as PracticeEvidence;
    const parts = (ev.submissionData as Record<string, unknown>).parts as Record<string, unknown>[];

    const allTags = parts.flatMap((p) => (p.misconceptionTags as string[]) ?? []);
    expect(allTags).toHaveLength(0);
  });

  it('aggregates scaffold usage metrics across all parts', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'guided_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                { partId: 'q1', rawAnswer: 'Cash', hintsUsed: 2, revealStepsSeen: 1, changedCount: 3 },
                { partId: 'q2', rawAnswer: 'Revenue', hintsUsed: 0, revealStepsSeen: 0, changedCount: 1 },
                { partId: 'q3', rawAnswer: 'Expense', hintsUsed: 1, revealStepsSeen: 2, changedCount: 0 },
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    const ev = phase4.evidence?.[0] as PracticeEvidence;
    const parts = (ev.submissionData as Record<string, unknown>).parts as Record<string, unknown>[];

    const totalHints = parts.reduce((sum, p) => sum + ((p.hintsUsed as number) ?? 0), 0);
    const totalReveals = parts.reduce((sum, p) => sum + ((p.revealStepsSeen as number) ?? 0), 0);
    const totalEdits = parts.reduce((sum, p) => sum + ((p.changedCount as number) ?? 0), 0);

    expect(totalHints).toBe(3);
    expect(totalReveals).toBe(3);
    expect(totalEdits).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// AI-Summary Fallback Behavior Tests
// ---------------------------------------------------------------------------

describe('AI-summary fallback behavior', () => {
  it('teacher evidence works when AI analysis is unavailable', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);

    expect(result.phases).toHaveLength(5);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    expect(phase4.evidence).toHaveLength(1);
    expect(phase4.evidence?.[0]).toMatchObject({
      kind: 'practice',
      activityId: 'activity-1',
    });

    // Deterministic summary should still work
    const summary = buildLessonErrorSummary(result);
    expect(summary.totalParts).toBe(1);
    expect(summary.topMisconceptions).toHaveLength(1);
  });

  it('AI output never replaces raw evidence access', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: { q1: 'Cash' },
              parts: [
                makePart({ partId: 'q1', rawAnswer: 'Cash', isCorrect: true }),
              ],
              teacherSummary: 'Student demonstrates understanding of basic entries.',
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    const ev = phase4.evidence?.[0] as PracticeEvidence;
    const submissionData = ev.submissionData as Record<string, unknown>;

    expect(submissionData.answers).toHaveProperty('q1', 'Cash');
    expect(submissionData.parts).toHaveLength(1);
    expect((submissionData.parts as Record<string, unknown>[])[0]).toHaveProperty('rawAnswer', 'Cash');
    expect(submissionData.teacherSummary).toBe('Student demonstrates understanding of basic entries.');
  });

  it('handles missing teacherSummary field gracefully', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        4,
        [
          makePracticeEvidence({
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'activity-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:30:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'q1', isCorrect: false }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map(), evidenceMap);
    const phase4 = result.phases.find((p) => p.phaseNumber === 4)!;
    const ev = phase4.evidence?.[0] as PracticeEvidence;
    const submissionData = ev.submissionData as Record<string, unknown>;

    expect(submissionData.teacherSummary).toBeUndefined();
    expect(submissionData.parts).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Lesson-Level and Student-Level Access Boundary Tests
// ---------------------------------------------------------------------------

describe('lesson-level and student-level teacher access boundaries', () => {
  it('assembles lesson-level summary across multiple phases', () => {
    const evidenceMap = new Map<number, SubmissionEvidence[]>([
      [
        3,
        [
          makePracticeEvidence({
            activityId: 'guided-1',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'guided-1',
              mode: 'guided_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T10:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'g1', isCorrect: true }),
                makePart({ partId: 'g2', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
              ],
            },
          }),
        ],
      ],
      [
        4,
        [
          makePracticeEvidence({
            activityId: 'indep-1',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'indep-1',
              mode: 'independent_practice',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T11:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'i1', isCorrect: false, misconceptionTags: ['normal-balance-error'] }),
                makePart({ partId: 'i2', isCorrect: false, misconceptionTags: ['amount-error'] }),
              ],
            },
          }),
        ],
      ],
      [
        5,
        [
          makePracticeEvidence({
            activityId: 'assess-1',
            submissionData: {
              contractVersion: 'practice.v1',
              activityId: 'assess-1',
              mode: 'assessment',
              status: 'submitted',
              attemptNumber: 1,
              submittedAt: '2026-03-19T12:00:00.000Z',
              answers: {},
              parts: [
                makePart({ partId: 'a1', isCorrect: true }),
                makePart({ partId: 'a2', isCorrect: true }),
              ],
            },
          }),
        ],
      ],
    ]);

    const result = assembleSubmissionDetail('Alice', 'Lesson 1: Accounting Equation', PHASES, [], new Map(), evidenceMap);
    const summary = buildLessonErrorSummary(result);

    expect(summary.totalParts).toBe(6);
    expect(summary.correctParts).toBe(3);
    expect(summary.topMisconceptions.some((m) => m.tag === 'normal-balance-error')).toBe(true);
    expect(summary.topMisconceptions.some((m) => m.tag === 'amount-error')).toBe(true);
  });

  it('preserves student identity in submission detail', () => {
    const result = assembleSubmissionDetail('Alice Brown', 'Lesson 1', PHASES, [], new Map());
    expect(result.studentName).toBe('Alice Brown');
    expect(result.lessonTitle).toBe('Lesson 1');
  });
});
