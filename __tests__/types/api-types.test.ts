import { describe, expect, expectTypeOf, it } from 'vitest';
import { API_PHASE_STATUSES } from '@/types/api';
import type {
  CompleteActivityRequest,
  CompleteActivityResponse,
  CompletePhaseRequest,
  CompletePhaseResponse,
  LessonProgressResponse,
  PhaseProgressResponse,
  PhaseStatus,
} from '@/types/api';

describe('types/api exports', () => {
  it('exports canonical phase status values and shared route contracts', () => {
    expect(API_PHASE_STATUSES).toEqual(['completed', 'current', 'available', 'locked']);

    expectTypeOf<PhaseStatus>().toMatchTypeOf<'completed' | 'current' | 'available' | 'locked'>();

    expectTypeOf<CompletePhaseRequest>().toMatchTypeOf<{
      lessonId: string;
      phaseNumber: number;
      timeSpent: number;
      idempotencyKey: string;
    }>();

    expectTypeOf<CompletePhaseResponse>().toMatchTypeOf<{
      success: boolean;
      nextPhaseUnlocked: boolean;
      message?: string;
      error?: string;
      phaseId?: string;
      completedAt?: string;
    }>();

    expectTypeOf<CompleteActivityRequest>().toMatchTypeOf<{
      activityId: string;
      lessonId: string;
      phaseNumber: number;
      linkedStandardId?: string | null;
      completionData?: Record<string, unknown> | null;
      idempotencyKey: string;
    }>();

    expectTypeOf<CompleteActivityResponse>().toMatchTypeOf<{
      success: boolean;
      nextPhaseUnlocked: boolean;
      message: string;
      completionId?: string;
      completedAt?: string;
      completedPhases?: number;
      totalPhases?: number;
      errorCode?: string;
    }>();

    expectTypeOf<PhaseProgressResponse>().toMatchTypeOf<{
      phaseNumber: number;
      phaseId: string;
      status: PhaseStatus;
      startedAt: string | null;
      completedAt: string | null;
      timeSpentSeconds: number | null;
    }>();

    expectTypeOf<LessonProgressResponse>().toMatchTypeOf<{
      phases: PhaseProgressResponse[];
    }>();

    expect(true).toBe(true);
  });
});
