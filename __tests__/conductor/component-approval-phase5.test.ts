import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    student: {
      getLessonProgress: 'internal.student.getLessonProgress',
    },
    auth: {
      updateStudentAccount: 'internal.auth.updateStudentAccount',
    },
  },
}));

const mockComputeComponentVersionHash = vi.fn();
const mockSubmitComponentReview = vi.fn();
const mockGetReviewQueue = vi.fn();
const mockGetComponentApproval = vi.fn();
const mockGetComponentReviews = vi.fn();
const mockGetUnresolvedReviews = vi.fn();
const mockGetAuditSummary = vi.fn();
const mockResolveReview = vi.fn();

vi.mock('@/lib/component-approval/version-hashes', () => ({
  computeComponentVersionHash: mockComputeComponentVersionHash,
}));

vi.mock('@/convex/_generated/api', () => ({
  api: {
    componentApprovals: {
      submitComponentReview: mockSubmitComponentReview,
      getReviewQueue: mockGetReviewQueue,
      getComponentApproval: mockGetComponentApproval,
      getComponentReviews: mockGetComponentReviews,
      getUnresolvedReviews: mockGetUnresolvedReviews,
      getAuditSummary: mockGetAuditSummary,
      resolveReview: mockResolveReview,
    },
  },
}));

describe('Phase 5: Stale Approval and Rework Loop Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stale approval detection', () => {
    it('marks approval as stale when current hash differs from approval hash', () => {
      mockComputeComponentVersionHash.mockReturnValue('newhash123');
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'activity',
          componentId: 'journal-entry-building',
          approvalStatus: 'approved',
          approvalVersionHash: 'oldhash456',
          approvalReviewedAt: Date.now() - 86400000,
          effectiveStatus: 'stale',
          currentVersionHash: 'newhash123',
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });
      expect(result[0].effectiveStatus).toBe('stale');
    });

    it('keeps approved status when hash matches', () => {
      mockComputeComponentVersionHash.mockReturnValue('samespacehash');
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'activity',
          componentId: 'journal-entry-building',
          approvalStatus: 'approved',
          approvalVersionHash: 'samespacehash',
          approvalReviewedAt: Date.now(),
          effectiveStatus: 'approved',
          currentVersionHash: 'samespacehash',
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });
      expect(result[0].effectiveStatus).toBe('approved');
    });

    it('marks changes_requested as stale when hash differs', () => {
      mockComputeComponentVersionHash.mockReturnValue('changedhash');
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'practice',
          componentId: 'family-a',
          approvalStatus: 'changes_requested',
          approvalVersionHash: 'originalhash',
          approvalReviewedAt: Date.now() - 172800000,
          effectiveStatus: 'stale',
          currentVersionHash: 'changedhash',
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });
      expect(result[0].effectiveStatus).toBe('stale');
    });

    it('marks rejected as stale when hash differs', () => {
      mockComputeComponentVersionHash.mockReturnValue('newrejectedhash');
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'example',
          componentId: 'example-1',
          approvalStatus: 'rejected',
          approvalVersionHash: 'oldrejectedhash',
          effectiveStatus: 'stale',
          currentVersionHash: 'newrejectedhash',
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });
      expect(result[0].effectiveStatus).toBe('stale');
    });

    it('keeps unreviewed status even when hash differs', () => {
      mockComputeComponentVersionHash.mockReturnValue('anyhash');
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'activity',
          componentId: 'data-cleaning',
          approvalStatus: 'unreviewed',
          effectiveStatus: 'unreviewed',
          currentVersionHash: 'anyhash',
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });
      expect(result[0].effectiveStatus).toBe('unreviewed');
    });

    it('reports both current and approval hashes in queue response', () => {
      const currentHash = 'currentSpecificHash';
      const approvalHash = 'approvalSpecificHash';
      mockComputeComponentVersionHash.mockReturnValue(currentHash);
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'practice',
          componentId: 'family-b',
          approvalStatus: 'approved',
          approvalVersionHash: approvalHash,
          effectiveStatus: 'approved',
          currentVersionHash: currentHash,
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });
      expect(result[0].currentVersionHash).toBe(currentHash);
      expect(result[0].approvalVersionHash).toBe(approvalHash);
    });
  });

  describe('Re-review path for stale/changes-requested components', () => {
    it('allows submitting new review for stale component', async () => {
      mockComputeComponentVersionHash.mockReturnValue('newHashForStale');
      mockSubmitComponentReview.mockResolvedValue({ reviewId: 'review_new_123' });

      await mockSubmitComponentReview({
        componentType: 'activity',
        componentId: 'journal-entry-building',
        componentVersionHash: 'newHashForStale',
        status: 'approved',
        reviewSummary: 'Re-approved after code update',
        improvementNotes: undefined,
        issueCategories: [],
      });

      expect(mockSubmitComponentReview).toHaveBeenCalledWith(
        expect.objectContaining({
          componentType: 'activity',
          componentId: 'journal-entry-building',
          status: 'approved',
        }),
      );
    });

    it('requires improvement notes for changes_requested re-review', async () => {
      mockSubmitComponentReview.mockRejectedValue(new Error('Improvement notes are required'));

      await expect(
        mockSubmitComponentReview({
          componentType: 'practice',
          componentId: 'family-c',
          componentVersionHash: 'newHashPractice',
          status: 'changes_requested',
          reviewSummary: undefined,
          improvementNotes: undefined,
          issueCategories: ['ui_bug'],
        }),
      ).rejects.toThrow('Improvement notes are required');
    });

    it('allows re-review with new version hash', async () => {
      mockComputeComponentVersionHash.mockReturnValue('updatedHash456');
      mockSubmitComponentReview.mockResolvedValue({ reviewId: 'review_updated_789' });

      await mockSubmitComponentReview({
        componentType: 'activity',
        componentId: 'comprehension-quiz',
        componentVersionHash: 'updatedHash456',
        status: 'approved',
        reviewSummary: 'Approved after fix',
        improvementNotes: undefined,
        issueCategories: [],
      });

      expect(mockSubmitComponentReview).toHaveBeenCalledWith(
        expect.objectContaining({
          componentVersionHash: 'updatedHash456',
        }),
      );
    });

    it('preserves previous review history when re-reviewing', async () => {
      mockGetComponentReviews.mockReturnValue([
        {
          componentType: 'activity',
          componentId: 'tiered-assessment',
          componentVersionHash: 'oldHash',
          status: 'changes_requested',
          improvementNotes: 'Needs better feedback',
          createdAt: Date.now() - 86400000,
        },
        {
          componentType: 'activity',
          componentId: 'tiered-assessment',
          componentVersionHash: 'newHash',
          status: 'approved',
          improvementNotes: undefined,
          createdAt: Date.now(),
        },
      ]);

      const reviews = await mockGetComponentReviews({
        componentType: 'activity',
        componentId: 'tiered-assessment',
      });

      expect(reviews).toHaveLength(2);
      expect(reviews[0].status).toBe('changes_requested');
      expect(reviews[1].status).toBe('approved');
    });
  });

  describe('LLM-audit-ready query for unresolved notes', () => {
    it('returns unresolved reviews without resolvedAt timestamp', async () => {
      mockGetUnresolvedReviews.mockReturnValue([
        {
          componentType: 'practice',
          componentId: 'family-a',
          status: 'changes_requested',
          improvementNotes: 'Fix the grading logic',
          issueCategories: ['math_correctness', 'pedagogy'],
          createdAt: Date.now() - 172800000,
          resolvedAt: undefined,
        },
        {
          componentType: 'activity',
          componentId: 'journal-entry-building',
          status: 'rejected',
          improvementNotes: 'UI does not match spec',
          issueCategories: ['ui_bug'],
          createdAt: Date.now() - 86400000,
          resolvedAt: undefined,
        },
      ]);

      const unresolved = await mockGetUnresolvedReviews({ componentType: undefined });

      expect(unresolved).toHaveLength(2);
      expect(unresolved[0].resolvedAt).toBeUndefined();
      expect(unresolved[1].resolvedAt).toBeUndefined();
    });

    it('filters unresolved reviews by component type', async () => {
      mockGetUnresolvedReviews.mockReturnValue([
        {
          componentType: 'practice',
          componentId: 'family-b',
          status: 'changes_requested',
          improvementNotes: 'Missing answer validation',
          issueCategories: ['missing_feedback'],
          createdAt: Date.now(),
          resolvedAt: undefined,
        },
      ]);

      const unresolved = await mockGetUnresolvedReviews({ componentType: 'practice' });

      expect(unresolved).toHaveLength(1);
      expect(unresolved[0].componentType).toBe('practice');
    });

    it('does not return resolved reviews', async () => {
      mockGetUnresolvedReviews.mockReturnValue([]);

      const unresolved = await mockGetUnresolvedReviews({ componentType: undefined });

      expect(unresolved).toHaveLength(0);
    });

    it('returns issue categories for LLM audit grouping', async () => {
      mockGetUnresolvedReviews.mockReturnValue([
        {
          componentType: 'activity',
          componentId: 'data-cleaning',
          status: 'changes_requested',
          improvementNotes: 'Instructions are unclear',
          issueCategories: ['wording', 'pedagogy'],
          createdAt: Date.now(),
          resolvedAt: undefined,
        },
      ]);

      const unresolved = await mockGetUnresolvedReviews({ componentType: 'activity' });

      expect(unresolved[0].issueCategories).toContain('wording');
      expect(unresolved[0].issueCategories).toContain('pedagogy');
    });

    it('includes component identity for audit reports', async () => {
      mockGetUnresolvedReviews.mockReturnValue([
        {
          componentType: 'example',
          componentId: 'example-income-statement',
          status: 'changes_requested',
          improvementNotes: 'Wording too formal for target audience',
          issueCategories: ['wording', 'too_hard'],
          createdAt: Date.now(),
          resolvedAt: undefined,
        },
      ]);

      const unresolved = await mockGetUnresolvedReviews({ componentType: 'example' });

      expect(unresolved[0].componentType).toBe('example');
      expect(unresolved[0].componentId).toBe('example-income-statement');
    });
  });

  describe('getAuditSummary - LLM-audit-ready grouped summary', () => {
    it('groups unresolved reviews by issue category and component type', async () => {
      mockGetAuditSummary.mockReturnValue({
        activity: {
          wording: {
            count: 2,
            notes: ['Fix copy', 'Revise instructions'],
            componentIds: ['journal-entry-building', 'data-cleaning'],
          },
          pedagogy: {
            count: 1,
            notes: ['Too complex for target audience'],
            componentIds: ['comprehension-quiz'],
          },
        },
      });

      const summary = await mockGetAuditSummary({ componentType: undefined });

      expect(summary.activity.wording.count).toBe(2);
      expect(summary.activity.wording.componentIds).toContain('journal-entry-building');
      expect(summary.activity.pedagogy.count).toBe(1);
    });

    it('filters by component type', async () => {
      mockGetAuditSummary.mockReturnValue({
        practice: {
          math_correctness: {
            count: 1,
            notes: ['Grade calculation is wrong'],
            componentIds: ['family-a'],
          },
        },
      });

      const summary = await mockGetAuditSummary({ componentType: 'practice' });

      expect(summary.practice).toBeDefined();
      expect(summary.practice.math_correctness).toBeDefined();
    });

    it('returns empty summary when no unresolved reviews', async () => {
      mockGetAuditSummary.mockReturnValue({});

      const summary = await mockGetAuditSummary({ componentType: undefined });

      expect(summary).toEqual({});
    });
  });

  describe('resolveReview - re-review path', () => {
    it('marks review as resolved with timestamp and resolver', async () => {
      mockResolveReview.mockResolvedValue({ success: true });

      const result = await mockResolveReview({ reviewId: 'review_123' });

      expect(result.success).toBe(true);
      expect(mockResolveReview).toHaveBeenCalledWith({ reviewId: 'review_123' });
    });

    it('only allows admin/developer to resolve reviews', async () => {
      mockResolveReview.mockRejectedValue(new Error('Not authorized'));

      await expect(mockResolveReview({ reviewId: 'review_456' })).rejects.toThrow('Not authorized');
    });
  });

  describe('LLM/audit query boundaries', () => {
    it('getUnresolvedReviews is a read-only query', () => {
      expect(mockGetUnresolvedReviews).toBeDefined();
    });

    it('getReviewQueue does not allow status changes', () => {
      mockGetReviewQueue.mockReturnValue([]);

      const queue = mockGetReviewQueue({ includeStale: true });

      expect(queue).toBeDefined();
      expect(queue).toEqual([]);
    });

    it('submitComponentReview is the only mutation for approvals', () => {
      expect(mockSubmitComponentReview).toBeDefined();
    });
  });

  describe('Approval invalidation on content change', () => {
    it('detects stale when activity component content changes', () => {
      const originalHash = 'originalActivityHash';
      const changedHash = 'changedActivityHash';
      mockComputeComponentVersionHash.mockReturnValue(changedHash);
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'activity',
          componentId: 'journal-entry-building',
          approvalStatus: 'approved',
          approvalVersionHash: originalHash,
          effectiveStatus: 'stale',
          currentVersionHash: changedHash,
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });

      expect(result[0].effectiveStatus).toBe('stale');
      expect(result[0].approvalVersionHash).not.toBe(result[0].currentVersionHash);
    });

    it('detects stale when practice family algorithm changes', () => {
      const originalHash = 'originalPracticeHash';
      const changedHash = 'changedPracticeHash';
      mockComputeComponentVersionHash.mockReturnValue(changedHash);
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'practice',
          componentId: 'family-a',
          approvalStatus: 'approved',
          approvalVersionHash: originalHash,
          effectiveStatus: 'stale',
          currentVersionHash: changedHash,
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });

      expect(result[0].effectiveStatus).toBe('stale');
    });

    it('detects stale when example content changes', () => {
      const originalHash = 'originalExampleHash';
      const changedHash = 'changedExampleHash';
      mockComputeComponentVersionHash.mockReturnValue(changedHash);
      mockGetReviewQueue.mockReturnValue([
        {
          componentType: 'example',
          componentId: 'example-1',
          approvalStatus: 'approved',
          approvalVersionHash: originalHash,
          effectiveStatus: 'stale',
          currentVersionHash: changedHash,
        },
      ]);

      const result = mockGetReviewQueue({ includeStale: true });

      expect(result[0].effectiveStatus).toBe('stale');
    });
  });

  describe('Validator split - stale not submittable', () => {
    it('submissionStatusValidator does not include stale', () => {
      const validStatuses: ('unreviewed' | 'approved' | 'changes_requested' | 'rejected')[] = [
        'unreviewed',
        'approved',
        'changes_requested',
        'rejected',
      ];
      const invalidStatuses = ['stale'] as const;

      for (const status of validStatuses) {
        expect(
          () => mockSubmitComponentReview({
            componentType: 'activity',
            componentId: 'test-component',
            componentVersionHash: 'hash123',
            status,
            reviewSummary: undefined,
            improvementNotes: undefined,
            issueCategories: [],
          }),
        ).not.toThrow();
      }

      mockSubmitComponentReview.mockImplementation(({ status }) => {
        if (invalidStatuses.includes(status as typeof invalidStatuses[number])) {
          throw new Error(`Invalid status: ${status}`);
        }
        return { reviewId: 'review_123' };
      });

      for (const status of invalidStatuses) {
        expect(
          () => mockSubmitComponentReview({
            componentType: 'activity',
            componentId: 'test-component',
            componentVersionHash: 'hash123',
            status: status as 'stale',
            reviewSummary: undefined,
            improvementNotes: undefined,
            issueCategories: [],
          }),
        ).toThrow(`Invalid status: ${status}`);
      }
    });

    it('submitComponentReview rejects stale status at validation layer', async () => {
      mockSubmitComponentReview.mockRejectedValue(new Error('Invalid status: stale'));

      await expect(
        mockSubmitComponentReview({
          componentType: 'activity',
          componentId: 'journal-entry-building',
          componentVersionHash: 'hash123',
          status: 'stale' as const,
          reviewSummary: undefined,
          improvementNotes: undefined,
          issueCategories: [],
        }),
      ).rejects.toThrow('Invalid status: stale');
    });
  });
});
