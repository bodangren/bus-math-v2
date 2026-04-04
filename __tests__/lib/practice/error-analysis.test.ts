import { describe, it, expect, vi } from 'vitest';

import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import {
  canTeacherAccessSubmission,
  canTeacherAccessLessonSummary,
  aggregateMisconceptionTags,
  summarizePartOutcomes,
  buildStudentProfiles,
  buildDeterministicSummary,
  generateAISummary,
  buildTeacherErrorView,
} from '@/lib/practice/error-analysis';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSubmission(overrides: Partial<PracticeSubmissionEnvelope> = {}): PracticeSubmissionEnvelope {
  return {
    contractVersion: 'practice.v1',
    activityId: 'test-activity',
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: new Date().toISOString(),
    answers: { q1: 'answer1', q2: 'answer2' },
    parts: [
      {
        partId: 'q1',
        rawAnswer: 'answer1',
        normalizedAnswer: 'answer1',
        isCorrect: true,
        score: 1,
        maxScore: 1,
        misconceptionTags: [],
      },
      {
        partId: 'q2',
        rawAnswer: 'wrong',
        normalizedAnswer: 'wrong',
        isCorrect: false,
        score: 0,
        maxScore: 1,
        misconceptionTags: ['debit-credit-confusion'],
      },
    ],
    ...overrides,
  };
}

function makeSubmissionWithMultipleTags(): PracticeSubmissionEnvelope {
  return makeSubmission({
    activityId: 'student-b',
    parts: [
      {
        partId: 'q1',
        rawAnswer: 'wrong1',
        normalizedAnswer: 'wrong1',
        isCorrect: false,
        score: 0,
        maxScore: 1,
        misconceptionTags: ['debit-credit-confusion', 'normal-balance-error'],
      },
      {
        partId: 'q2',
        rawAnswer: 'wrong2',
        normalizedAnswer: 'wrong2',
        isCorrect: false,
        score: 0,
        maxScore: 1,
        misconceptionTags: ['debit-credit-confusion'],
      },
    ],
  });
}

// ── Authorization Tests ────────────────────────────────────────────────────

describe('canTeacherAccessSubmission', () => {
  it('should allow access when org and teacher match', () => {
    expect(canTeacherAccessSubmission('org-1', 'org-1', 'teacher-1', 'teacher-1')).toBe(true);
  });

  it('should deny access when orgs differ', () => {
    expect(canTeacherAccessSubmission('org-1', 'org-2', 'teacher-1', 'teacher-1')).toBe(false);
  });

  it('should deny access when teacher IDs differ', () => {
    expect(canTeacherAccessSubmission('org-1', 'org-1', 'teacher-1', 'teacher-2')).toBe(false);
  });

  it('should allow access when submission has no teacher ID', () => {
    expect(canTeacherAccessSubmission('org-1', 'org-1', 'teacher-1')).toBe(true);
  });
});

describe('canTeacherAccessLessonSummary', () => {
  it('should allow access when org and teacher match', () => {
    expect(canTeacherAccessLessonSummary('org-1', 'org-1', 'teacher-1', 'teacher-1')).toBe(true);
  });

  it('should deny access when orgs differ', () => {
    expect(canTeacherAccessLessonSummary('org-1', 'org-2', 'teacher-1', 'teacher-1')).toBe(false);
  });

  it('should deny access when teacher IDs differ', () => {
    expect(canTeacherAccessLessonSummary('org-1', 'org-1', 'teacher-1', 'teacher-2')).toBe(false);
  });
});

// ── Deterministic Summary Tests ────────────────────────────────────────────

describe('aggregateMisconceptionTags', () => {
  it('should aggregate tags across submissions', () => {
    const submissions = [makeSubmission(), makeSubmissionWithMultipleTags()];
    const result = aggregateMisconceptionTags(submissions);

    expect(result.length).toBeGreaterThan(0);
    const debitCredit = result.find(r => r.tag === 'debit-credit-confusion');
    expect(debitCredit).toBeDefined();
    expect(debitCredit!.count).toBe(3); // 1 from first, 2 from second
  });

  it('should sort by count descending', () => {
    const submissions = [makeSubmission(), makeSubmissionWithMultipleTags()];
    const result = aggregateMisconceptionTags(submissions);

    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
    }
  });

  it('should track affected parts', () => {
    const submissions = [makeSubmission(), makeSubmissionWithMultipleTags()];
    const result = aggregateMisconceptionTags(submissions);

    const debitCredit = result.find(r => r.tag === 'debit-credit-confusion');
    expect(debitCredit!.affectedParts).toContain('q1');
    expect(debitCredit!.affectedParts).toContain('q2');
  });

  it('should return empty array for submissions with no tags', () => {
    const submission = makeSubmission({
      parts: [
        { partId: 'q1', rawAnswer: 'a', isCorrect: true, score: 1, maxScore: 1, misconceptionTags: [] },
      ],
    });
    const result = aggregateMisconceptionTags([submission]);
    expect(result).toEqual([]);
  });

  it('should handle submissions with undefined misconceptionTags', () => {
    const submission = makeSubmission({
      parts: [
        { partId: 'q1', rawAnswer: 'a', isCorrect: true, score: 1, maxScore: 1 },
      ],
    });
    const result = aggregateMisconceptionTags([submission]);
    expect(result).toEqual([]);
  });
});

describe('summarizePartOutcomes', () => {
  it('should summarize correctness per part', () => {
    const submissions = [makeSubmission(), makeSubmission()];
    const result = summarizePartOutcomes(submissions);

    const q1 = result.find(r => r.partId === 'q1');
    expect(q1).toBeDefined();
    expect(q1!.totalAttempts).toBe(2);
    expect(q1!.correctCount).toBe(2);
    expect(q1!.incorrectCount).toBe(0);
    expect(q1!.accuracyRate).toBe(1);
  });

  it('should calculate accuracy rate correctly', () => {
    const sub1 = makeSubmission();
    const sub2 = makeSubmission({
      parts: [
        { partId: 'q1', rawAnswer: 'wrong', isCorrect: false, score: 0, maxScore: 1, misconceptionTags: [] },
        { partId: 'q2', rawAnswer: 'correct', isCorrect: true, score: 1, maxScore: 1, misconceptionTags: [] },
      ],
    });
    const result = summarizePartOutcomes([sub1, sub2]);

    const q1 = result.find(r => r.partId === 'q1');
    expect(q1!.accuracyRate).toBe(0.5);
  });

  it('should aggregate misconception tags per part', () => {
    const submissions = [makeSubmission(), makeSubmissionWithMultipleTags()];
    const result = summarizePartOutcomes(submissions);

    const q1 = result.find(r => r.partId === 'q1');
    expect(q1!.commonMisconceptions.length).toBeGreaterThan(0);
  });
});

describe('buildStudentProfiles', () => {
  it('should build profiles with correct counts', () => {
    const submissions = [makeSubmission()];
    const result = buildStudentProfiles(submissions);

    expect(result.length).toBe(1);
    expect(result[0].totalParts).toBe(2);
    expect(result[0].correctParts).toBe(1);
    expect(result[0].incorrectParts).toBe(1);
  });

  it('should collect unique misconception tags', () => {
    const submissions = [makeSubmissionWithMultipleTags()];
    const result = buildStudentProfiles(submissions);

    expect(result[0].misconceptions).toContain('debit-credit-confusion');
    expect(result[0].misconceptions).toContain('normal-balance-error');
    expect(result[0].misconceptions.length).toBe(2);
  });

  it('should handle submissions with no misconceptions', () => {
    const submission = makeSubmission({
      parts: [
        { partId: 'q1', rawAnswer: 'a', isCorrect: true, score: 1, maxScore: 1, misconceptionTags: [] },
      ],
    });
    const result = buildStudentProfiles([submission]);

    expect(result[0].misconceptions).toEqual([]);
  });
});

describe('buildDeterministicSummary', () => {
  it('should build summary with lesson ID', () => {
    const submissions = [makeSubmission()];
    const result = buildDeterministicSummary('lesson-1', submissions);

    expect(result.type).toBe('deterministic');
    expect(result.lessonId).toBe('lesson-1');
    expect(result.studentCount).toBe(1);
  });

  it('should calculate average accuracy', () => {
    const sub1 = makeSubmission(); // 1/2 correct
    const sub2 = makeSubmission({
      parts: [
        { partId: 'q1', rawAnswer: 'a', isCorrect: true, score: 1, maxScore: 1, misconceptionTags: [] },
        { partId: 'q2', rawAnswer: 'a', isCorrect: true, score: 1, maxScore: 1, misconceptionTags: [] },
      ],
    }); // 2/2 correct
    const result = buildDeterministicSummary('lesson-1', [sub1, sub2]);

    expect(result.averageAccuracy).toBe(0.75);
  });

  it('should include top misconceptions', () => {
    const submissions = [makeSubmission(), makeSubmissionWithMultipleTags()];
    const result = buildDeterministicSummary('lesson-1', submissions);

    expect(result.topMisconceptions.length).toBeGreaterThan(0);
    expect(result.topMisconceptions[0].count).toBeGreaterThanOrEqual(
      result.topMisconceptions[result.topMisconceptions.length - 1].count
    );
  });

  it('should handle empty submissions', () => {
    const result = buildDeterministicSummary('lesson-1', []);

    expect(result.studentCount).toBe(0);
    expect(result.averageAccuracy).toBe(0);
    expect(result.partSummaries).toEqual([]);
  });
});

// ── AI Summary Tests ───────────────────────────────────────────────────────

describe('generateAISummary', () => {
  it('should return null when no AI provider is given', async () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);

    const result = await generateAISummary({
      submission,
      deterministicSummary,
      rawEvidence: { answers: submission.answers },
    });

    expect(result).toBeNull();
  });

  it('should return null when AI provider throws', async () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const failingProvider = vi.fn().mockRejectedValue(new Error('API error'));

    const result = await generateAISummary(
      {
        submission,
        deterministicSummary,
        rawEvidence: { answers: submission.answers },
      },
      failingProvider
    );

    expect(result).toBeNull();
  });

  it('should include source evidence references', async () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const provider = vi.fn().mockResolvedValue('Misunderstanding\nEvidence\nIntervention');

    const result = await generateAISummary(
      {
        submission,
        deterministicSummary,
        rawEvidence: { answers: submission.answers },
      },
      provider
    );

    expect(result).not.toBeNull();
    expect(result!.sourceSubmissionId).toBe('test-activity-1');
    expect(result!.sourceEvidence.partIds).toContain('q1');
    expect(result!.sourceEvidence.partIds).toContain('q2');
  });

  it('should include misconception tags in source evidence', async () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const provider = vi.fn().mockResolvedValue('Misunderstanding\nEvidence\nIntervention');

    const result = await generateAISummary(
      {
        submission,
        deterministicSummary,
        rawEvidence: { answers: submission.answers },
      },
      provider
    );

    expect(result!.sourceEvidence.misconceptionTags).toContain('debit-credit-confusion');
  });

  it('should never replace raw evidence access', async () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const provider = vi.fn().mockResolvedValue('Misunderstanding\nEvidence\nIntervention');

    const result = await generateAISummary(
      {
        submission,
        deterministicSummary,
        rawEvidence: { answers: submission.answers },
      },
      provider
    );

    // AI summary should reference evidence but not contain raw answers
    expect(result).not.toBeNull();
    expect(result!.type).toBe('ai-assisted');
    // The view builder should still expose raw parts
    const view = buildTeacherErrorView(submission, deterministicSummary, result);
    expect(view.rawParts).toEqual(submission.parts);
    expect(view.rawAnswers).toEqual(submission.answers);
  });
});

// ── Teacher Error View Tests ───────────────────────────────────────────────

describe('buildTeacherErrorView', () => {
  it('should build view with deterministic summary', () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);

    const view = buildTeacherErrorView(submission, deterministicSummary);

    expect(view.submissionId).toBe('test-activity-1');
    expect(view.studentId).toBe('test-activity');
    expect(view.deterministicSummary).toBe(deterministicSummary);
    expect(view.aiSummary).toBeNull();
  });

  it('should include raw parts and answers', () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);

    const view = buildTeacherErrorView(submission, deterministicSummary);

    expect(view.rawParts).toEqual(submission.parts);
    expect(view.rawAnswers).toEqual(submission.answers);
  });

  it('should include AI summary when provided', () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);
    const aiSummary = {
      type: 'ai-assisted' as const,
      likelyMisunderstanding: 'Test misunderstanding',
      evidenceObserved: 'Test evidence',
      suggestedIntervention: 'Test intervention',
      sourceSubmissionId: 'test-activity-1',
      sourceEvidence: { partIds: ['q1'], misconceptionTags: ['debit-credit-confusion'] },
      generatedAt: Date.now(),
    };

    const view = buildTeacherErrorView(submission, deterministicSummary, aiSummary);

    expect(view.aiSummary).toBe(aiSummary);
  });

  it('should include artifact when present', () => {
    const artifact = { spreadsheet: 'data' };
    const submission = makeSubmission({ artifact });
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);

    const view = buildTeacherErrorView(submission, deterministicSummary);

    expect(view.artifact).toEqual(artifact);
  });

  it('should work when AI summary is unavailable', () => {
    const submission = makeSubmission();
    const deterministicSummary = buildDeterministicSummary('lesson-1', [submission]);

    const view = buildTeacherErrorView(submission, deterministicSummary, null);

    expect(view.aiSummary).toBeNull();
    // Raw evidence should still be accessible
    expect(view.rawParts).toBeDefined();
    expect(view.rawAnswers).toBeDefined();
  });
});
