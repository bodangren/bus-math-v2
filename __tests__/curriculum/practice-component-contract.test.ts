import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { submissionDataSchema } from '@/lib/db/schema/activity-submissions';

const contractDocPath = path.resolve(
  process.cwd(),
  'conductor/curriculum/practice-component-contract.md',
);

describe('practice component contract foundation', () => {
  it('declares the canonical practice.v1 contract in the curriculum docs', () => {
    const doc = fs.readFileSync(contractDocPath, 'utf8');

    expect(doc).toContain('practice.v1');
    expect(doc).toContain('worked_example');
    expect(doc).toContain('guided_practice');
    expect(doc).toContain('independent_practice');
    expect(doc).toContain('assessment');
  });

  it('preserves the normalized practice submission envelope in storage validation', () => {
    const canonicalSubmission = {
      contractVersion: 'practice.v1',
      activityId: '7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b',
      mode: 'guided_practice',
      status: 'submitted',
      attemptNumber: 2,
      submittedAt: '2026-03-19T12:00:00.000Z',
      answers: {
        q1: 'A',
      },
      parts: [
        {
          partId: 'q1',
          rawAnswer: 'A',
          normalizedAnswer: 'a',
          isCorrect: true,
          score: 1,
          maxScore: 1,
          misconceptionTags: [],
          hintsUsed: 0,
          revealStepsSeen: 0,
          changedCount: 1,
        },
      ],
      artifact: {
        kind: 'spreadsheet_snapshot',
      },
      interactionHistory: [
        {
          type: 'submit',
          at: '2026-03-19T12:00:00.000Z',
        },
      ],
      analytics: {
        source: 'student_runtime',
      },
      studentFeedback: 'Nice work',
      teacherSummary: 'Student demonstrated correct reasoning.',
    };

    const parsed = submissionDataSchema.safeParse(canonicalSubmission);

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected canonical practice submission to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.mode).toBe('guided_practice');
    expect(parsed.data.status).toBe('submitted');
    expect(parsed.data.parts).toHaveLength(1);
    expect(parsed.data.parts[0]).toMatchObject({
      partId: 'q1',
      rawAnswer: 'A',
      normalizedAnswer: 'a',
      isCorrect: true,
    });
  });

  it('rejects the legacy answers-only payload once the practice envelope is enforced', () => {
    const parsed = submissionDataSchema.safeParse({
      answers: {
        q1: 'A',
      },
    });

    expect(parsed.success).toBe(false);
  });

  it('uses a typed Convex validator for practice submissions', () => {
    const convexSchema = fs.readFileSync(path.resolve(process.cwd(), 'convex/schema.ts'), 'utf8');
    const convexActivities = fs.readFileSync(path.resolve(process.cwd(), 'convex/activities.ts'), 'utf8');

    expect(convexSchema).toContain('practiceSubmissionEnvelopeValidator');
    expect(convexActivities).toContain('practiceSubmissionEnvelopeValidator');
    expect(convexSchema).not.toContain('submissionData: v.any()');
  });
});
