import {
  query,
  mutation,
} from "./_generated/server";
import { v } from "convex/values";
import {
  componentTypeValidator,
  approvalStatusValidator,
  issueCategoryValidator,
} from "./component_approval_validators";
import { getUserProfile } from "./auth";

export const getComponentApproval = query({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
  },
  handler: async (ctx, args) => {
    const approval = await ctx.db
      .query("componentApprovals")
      .withIndex("by_component", (q) =>
        q.eq("componentType", args.componentType).eq("componentId", args.componentId)
      )
      .first();
    return approval;
  },
});

export const getReviewQueue = query({
  args: {
    componentType: v.optional(componentTypeValidator),
    approvalStatus: v.optional(approvalStatusValidator),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("componentApprovals");

    if (args.componentType) {
      query = query.withIndex("by_component", (q) =>
        q.eq("componentType", args.componentType)
      );
    }

    if (args.approvalStatus) {
      query = query.withIndex("by_status", (q) =>
        q.eq("approvalStatus", args.approvalStatus)
      );
    }

    const approvals = await query.collect();
    return approvals;
  },
});

export const getComponentReviews = query({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("componentReviews")
      .withIndex("by_component_and_created", (q) =>
        q.eq("componentType", args.componentType).eq("componentId", args.componentId)
      )
      .order("desc")
      .collect();
    return reviews;
  },
});

export const submitComponentReview = mutation({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
    componentVersionHash: v.string(),
    status: approvalStatusValidator,
    reviewSummary: v.optional(v.string()),
    improvementNotes: v.optional(v.string()),
    issueCategories: v.array(issueCategoryValidator),
  },
  handler: async (ctx, args) => {
    const profile = await getUserProfile(ctx);
    if (!profile) {
      throw new Error("Not authenticated");
    }
    if (profile.role === "student" || profile.role === "teacher") {
      throw new Error("Not authorized");
    }

    if (
      (args.status === "changes_requested" || args.status === "rejected") &&
      !args.improvementNotes
    ) {
      throw new Error("Improvement notes are required for changes_requested or rejected status");
    }

    const now = Date.now();

    const reviewId = await ctx.db.insert("componentReviews", {
      componentType: args.componentType,
      componentId: args.componentId,
      componentVersionHash: args.componentVersionHash,
      status: args.status,
      reviewerId: profile._id,
      reviewSummary: args.reviewSummary,
      improvementNotes: args.improvementNotes,
      issueCategories: args.issueCategories,
      createdAt: now,
    });

    const existingApproval = await ctx.db
      .query("componentApprovals")
      .withIndex("by_component", (q) =>
        q.eq("componentType", args.componentType).eq("componentId", args.componentId)
      )
      .first();

    if (existingApproval) {
      await ctx.db.patch(existingApproval._id, {
        approvalStatus: args.status,
        approvalVersionHash: args.componentVersionHash,
        approvalReviewedAt: now,
        approvalReviewedBy: profile._id,
        latestReviewId: reviewId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("componentApprovals", {
        componentType: args.componentType,
        componentId: args.componentId,
        approvalStatus: args.status,
        approvalVersionHash: args.componentVersionHash,
        approvalReviewedAt: now,
        approvalReviewedBy: profile._id,
        latestReviewId: reviewId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { reviewId };
  },
});

export const getUnresolvedReviews = query({
  args: {
    componentType: v.optional(componentTypeValidator),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("componentReviews");

    if (args.componentType) {
      query = query.withIndex("by_component", (q) =>
        q.eq("componentType", args.componentType)
      );
    }

    const reviews = await query
      .filter((q) => q.eq(q.field("resolvedAt"), undefined))
      .collect();
    return reviews;
  },
});
