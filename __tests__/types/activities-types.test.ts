import { describe, expect, expectTypeOf, it } from 'vitest';
import { ACTIVITY_SUBMISSION_REQUIRED_FIELDS } from '@/types/activities';
import type {
  ActivityComponentKey,
  ActivityProps,
  ActivitySubmissionData,
  GradingConfig,
} from '@/types/activities';

describe('types/activities exports', () => {
  it('exports canonical activity config and submission contracts', () => {
    expect(ACTIVITY_SUBMISSION_REQUIRED_FIELDS).toEqual([
      'contractVersion',
      'activityId',
      'mode',
      'status',
      'attemptNumber',
      'submittedAt',
      'answers',
      'parts',
    ]);

    expectTypeOf<ActivityComponentKey>().toMatchTypeOf<string>();

    expectTypeOf<ActivityProps>().toMatchTypeOf<Record<string, unknown>>();

    expectTypeOf<ActivitySubmissionData>().toMatchTypeOf<{
      contractVersion: 'practice.v1';
      activityId: string;
      mode: 'worked_example' | 'guided_practice' | 'independent_practice' | 'assessment' | 'teaching';
      status: string;
      attemptNumber: number;
      submittedAt: string;
      answers: Record<string, unknown>;
      parts: Array<{
        partId: string;
        rawAnswer: unknown;
      }>;
      artifact?: Record<string, unknown>;
      interactionHistory?: unknown[];
      analytics?: Record<string, unknown>;
      studentFeedback?: string;
      teacherSummary?: string;
    }>();

    expectTypeOf<GradingConfig>().toMatchTypeOf<{
      autoGrade: boolean;
      passingScore?: number;
      partialCredit: boolean;
      rubric?: Array<{ criteria: string; points: number }>;
    }>();

    expect(true).toBe(true);
  });
});
