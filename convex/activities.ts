import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSpreadsheetDraft = query({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    if (!response?.draftData) {
      return { draftData: null, updatedAt: null };
    }

    return {
      draftData: response.draftData,
      updatedAt: response.updatedAt,
    };
  },
});

export const saveSpreadsheetDraft = mutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    draftData: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        draftData: args.draftData,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("student_spreadsheet_responses", {
        studentId: args.userId,
        activityId: args.activityId,
        spreadsheetData: args.draftData,
        draftData: args.draftData,
        isCompleted: false,
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, updatedAt: now };
  },
});

export const getSpreadsheetResponse = query({
  args: {
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const response = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId)
      )
      .unique();

    if (!response) {
      return null;
    }

    return {
      studentId: response.studentId,
      spreadsheetData: response.spreadsheetData,
      draftData: response.draftData,
      isCompleted: response.isCompleted,
      attempts: response.attempts,
      lastValidationResult: response.lastValidationResult,
      submittedAt: response.submittedAt,
      updatedAt: response.updatedAt,
    };
  },
});

export const getActivityForValidation = query({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);

    if (!activity) {
      return null;
    }

    return {
      componentKey: activity.componentKey,
      props: activity.props,
      standardId: activity.standardId,
    };
  },
});

export const submitSpreadsheet = mutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    spreadsheetData: v.any(),
    isCompleted: v.boolean(),
    validationResult: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        spreadsheetData: args.spreadsheetData,
        isCompleted: args.isCompleted,
        attempts: existingResponse.attempts + 1,
        lastValidationResult: args.validationResult,
        submittedAt: args.isCompleted ? now : existingResponse.submittedAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("student_spreadsheet_responses", {
        studentId: args.userId,
        activityId: args.activityId,
        spreadsheetData: args.spreadsheetData,
        isCompleted: args.isCompleted,
        attempts: 1,
        lastValidationResult: args.validationResult,
        submittedAt: args.isCompleted ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const updateCompetency = mutation({
  args: {
    studentId: v.id("profiles"),
    standardId: v.id("competency_standards"),
    activityId: v.id("activities"),
    masteryIncrement: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const existingCompetency = await ctx.db
      .query("student_competency")
      .withIndex("by_student_and_standard", (q) =>
        q.eq("studentId", args.studentId).eq("standardId", args.standardId)
      )
      .unique();

    if (existingCompetency) {
      const newLevel = Math.min(existingCompetency.masteryLevel + args.masteryIncrement, 100);
      await ctx.db.patch(existingCompetency._id, {
        masteryLevel: newLevel,
        evidenceActivityId: args.activityId,
        lastUpdated: now,
        updatedBy: args.studentId,
      });
      return { newLevel };
    } else {
      await ctx.db.insert("student_competency", {
        studentId: args.studentId,
        standardId: args.standardId,
        masteryLevel: args.masteryIncrement,
        evidenceActivityId: args.activityId,
        lastUpdated: now,
        createdAt: now,
        updatedBy: args.studentId,
      });
      return { newLevel: args.masteryIncrement };
    }
  },
});

export const getProfileByUserId = query({
  args: {
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
    };
  },
});

export const getProfileById = query({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
    };
  },
});

export const getActivityById = query({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.activityId);
    if (!activity) return null;

    return {
      id: activity._id,
      componentKey: activity.componentKey,
      displayName: activity.displayName,
      description: activity.description,
      props: activity.props,
      gradingConfig: activity.gradingConfig,
      standardId: activity.standardId,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };
  },
});

export const submitAssessment = mutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: v.any(),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const id = await ctx.db.insert("activity_submissions", {
      userId: args.userId,
      activityId: args.activityId,
      submissionData: args.submissionData,
      score: args.score,
      maxScore: args.maxScore,
      feedback: args.feedback,
      submittedAt: now,
      gradedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  },
});
