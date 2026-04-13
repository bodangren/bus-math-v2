import { v } from 'convex/values';

export const componentTypeValidator = v.union(
  v.literal('example'),
  v.literal('activity'),
  v.literal('practice'),
);

export const approvalStatusValidator = v.union(
  v.literal('unreviewed'),
  v.literal('approved'),
  v.literal('changes_requested'),
  v.literal('rejected'),
  v.literal('stale'),
);

export const issueCategoryValidator = v.union(
  v.literal('math_correctness'),
  v.literal('pedagogy'),
  v.literal('wording'),
  v.literal('ui_bug'),
  v.literal('accessibility'),
  v.literal('algorithmic_variation'),
  v.literal('missing_feedback'),
  v.literal('too_easy'),
  v.literal('too_hard'),
  v.literal('completion_behavior'),
  v.literal('evidence_quality'),
);

export const componentApprovalValidator = v.object({
  componentType: componentTypeValidator,
  componentId: v.string(),
  approvalStatus: approvalStatusValidator,
  approvalVersionHash: v.string(),
  approvalReviewedAt: v.optional(v.number()),
  approvalReviewedBy: v.optional(v.id('profiles')),
  latestReviewId: v.optional(v.id('componentReviews')),
});

export const componentReviewValidator = v.object({
  componentType: componentTypeValidator,
  componentId: v.string(),
  componentVersionHash: v.string(),
  status: approvalStatusValidator,
  reviewerId: v.id('profiles'),
  reviewSummary: v.optional(v.string()),
  improvementNotes: v.optional(v.string()),
  issueCategories: v.array(issueCategoryValidator),
  createdAt: v.number(),
  resolvedAt: v.optional(v.number()),
  resolvedBy: v.optional(v.id('profiles')),
});
