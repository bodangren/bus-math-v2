import { describe, it, expect, vi } from 'vitest';
import { fetchInternalQuery } from '@/lib/convex/server';

vi.mock('@/lib/convex/server');

describe('SubmissionDetailModal integration', () => {
  it('shows submission detail modal when gradebook cell is clicked', async () => {
    const mockSubmissions = {
      phases: [
        {
          phaseId: 'phase1',
          title: 'Introduction',
          status: 'completed',
          evidence: [
            {
              kind: 'practice',
              activityId: 'activity1',
              activityTitle: 'Practice Activity',
              componentKey: 'some-component',
              submittedAt: '2026-04-10T00:00:00.000Z',
              submissionData: {
                contractVersion: 'practice.v1',
                mode: 'independent_practice',
                status: 'graded',
                attemptNumber: 1,
                submittedAt: '2026-04-10T00:00:00.000Z',
                answers: { answer1: 'value1' },
                parts: [
                  {
                    partId: 'part1',
                    rawAnswer: 'answer',
                    normalizedAnswer: 'answer',
                    isCorrect: true,
                    score: 10,
                    maxScore: 10,
                  },
                ],
              },
              score: 10,
              maxScore: 10,
            },
          ],
        },
      ],
    };

    vi.mocked(fetchInternalQuery).mockResolvedValue(mockSubmissions);

    const { getTeacherSubmissionDetail } = await import('@/convex/teacher');
    const result = await getTeacherSubmissionDetail({
      userId: 'user1',
      lessonId: 'lesson1',
    });

    expect(result).not.toBeNull();
    if (result && 'phases' in result) {
      expect(result.phases).toHaveLength(1);
      expect(result.phases[0]?.evidence).toHaveLength(1);
      const evidence = result.phases[0]?.evidence?.[0];
      expect(evidence?.submissionData.mode).toBe('independent_practice');
      expect(evidence?.score).toBe(10);
    }
  });

  it('filters submissions by activityId and userId', async () => {
    vi.mocked(fetchInternalQuery).mockImplementation(async (query, args) => {
      if (query.name === 'getTeacherSubmissionDetail') {
        return {
          phases: [],
        };
      }
      return null;
    });

    const { getTeacherSubmissionDetail } = await import('@/convex/teacher');
    const result = await getTeacherSubmissionDetail({
      userId: 'user1',
      lessonId: 'lesson1',
    });

    expect(result).toEqual({ phases: [] });
  });

  it('distinguishes independent practice from assessment in same lesson', async () => {
    const mockMultiModeSubmissions = {
      phases: [
        {
          phaseId: 'phase1',
          title: 'Practice Phase',
          status: 'completed',
          evidence: [
            {
              kind: 'practice',
              activityId: 'activity1',
              activityTitle: 'Independent Practice',
              componentKey: 'practice-component',
              submittedAt: '2026-04-10T00:00:00.000Z',
              submissionData: {
                contractVersion: 'practice.v1',
                mode: 'independent_practice',
                status: 'graded',
                attemptNumber: 1,
                submittedAt: '2026-04-10T00:00:00.000Z',
                answers: {},
                parts: [],
              },
              score: 85,
              maxScore: 100,
            },
            {
              kind: 'practice',
              activityId: 'activity2',
              activityTitle: 'Assessment',
              componentKey: 'assessment-component',
              submittedAt: '2026-04-10T00:00:00.000Z',
              submissionData: {
                contractVersion: 'practice.v1',
                mode: 'assessment',
                status: 'graded',
                attemptNumber: 1,
                submittedAt: '2026-04-10T00:00:00.000Z',
                answers: {},
                parts: [],
              },
              score: 90,
              maxScore: 100,
            },
          ],
        },
      ],
    };

    vi.mocked(fetchInternalQuery).mockResolvedValue(mockMultiModeSubmissions);

    const { getTeacherSubmissionDetail } = await import('@/convex/teacher');
    const result = await getTeacherSubmissionDetail({
      userId: 'user1',
      lessonId: 'lesson1',
    });

    expect(result).not.toBeNull();
    if (result && 'phases' in result) {
      const evidence = result.phases[0]?.evidence || [];
      expect(evidence).toHaveLength(2);
      
      const ipSubmission = evidence.find(e => 
        e.submissionData.mode === 'independent_practice'
      );
      const assessmentSubmission = evidence.find(e => 
        e.submissionData.mode === 'assessment'
      );

      expect(ipSubmission?.score).toBe(85);
      expect(assessmentSubmission?.score).toBe(90);
    }
  });
});
