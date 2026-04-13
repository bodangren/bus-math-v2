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
import { computeComponentVersionHash } from "@/lib/component-approval/version-hashes";

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

export const getComponentVersionHash = query({
  args: {
    componentType: componentTypeValidator,
    componentId: v.string(),
  },
  handler: async (_ctx, args) => {
    return computeComponentVersionHash(args.componentType, args.componentId);
  },
});

export const getReviewQueue = query({
  args: {
    componentType: v.optional(componentTypeValidator),
    approvalStatus: v.optional(approvalStatusValidator),
    includeStale: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let approvals;

    if (args.componentType && args.approvalStatus) {
      // Both filters: use by_status index, then filter in memory
      approvals = await ctx.db
        .query("componentApprovals")
        .withIndex("by_status", (q) => q.eq("approvalStatus", args.approvalStatus!))
        .filter((q) => q.eq(q.field("componentType"), args.componentType!))
        .collect();
    } else if (args.componentType) {
      approvals = await ctx.db
        .query("componentApprovals")
        .withIndex("by_component", (q) => q.eq("componentType", args.componentType!))
        .collect();
    } else if (args.approvalStatus) {
      approvals = await ctx.db
        .query("componentApprovals")
        .withIndex("by_status", (q) => q.eq("approvalStatus", args.approvalStatus!))
        .collect();
    } else {
      approvals = await ctx.db.query("componentApprovals").collect();
    }

    if (args.includeStale) {
      return approvals.map((approval) => {
        const currentHash = computeComponentVersionHash(approval.componentType, approval.componentId);
        const effectiveStatus =
          approval.approvalStatus !== "unreviewed" && approval.approvalVersionHash !== currentHash
            ? "stale"
            : approval.approvalStatus;
        return {
          ...approval,
          effectiveStatus,
          currentVersionHash: currentHash,
        };
      });
    }

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) {
      throw new Error("Profile not found");
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

    const serverHash = computeComponentVersionHash(args.componentType, args.componentId);
    if (serverHash !== args.componentVersionHash) {
      throw new Error("Component version hash mismatch");
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

export const getAuditSummary = query({
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

    const unresolved = await query
      .filter((q) => q.eq(q.field("resolvedAt"), undefined))
      .collect();

    const summary: Record<
      string,
      Record<string, { count: number; notes: string[]; componentIds: string[] }>
    > = {};

    for (const review of unresolved) {
      const type = review.componentType;
      for (const category of review.issueCategories) {
        if (!summary[type]) summary[type] = {};
        if (!summary[type][category]) {
          summary[type][category] = { count: 0, notes: [], componentIds: [] };
        }
        summary[type][category].count++;
        if (review.improvementNotes) {
          summary[type][category].notes.push(review.improvementNotes);
        }
        if (!summary[type][category].componentIds.includes(review.componentId)) {
          summary[type][category].componentIds.push(review.componentId);
        }
      }
    }

    return summary;
  },
});

export const resolveReview = mutation({
  args: {
    reviewId: v.id("componentReviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) {
      throw new Error("Profile not found");
    }
    if (profile.role === "student" || profile.role === "teacher") {
      throw new Error("Not authorized");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.patch(args.reviewId, {
      resolvedAt: Date.now(),
      resolvedBy: profile._id,
    });

    return { success: true };
  },
});
