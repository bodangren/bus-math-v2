import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { practiceSubmissionEnvelopeValidator } from "./practice_submission";
import {
  spreadsheetDataValidator,
  validationResultValidator,
} from "./spreadsheet_validators";

export const getSpreadsheetDraft = internalQuery({
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

export const saveSpreadsheetDraft = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    draftData: spreadsheetDataValidator,
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
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, updatedAt: now };
  },
});

export const getSpreadsheetResponse = internalQuery({
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

    // Get attempt count from the attempts table
    const attempts = await ctx.db
      .query("spreadsheet_submission_attempts")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId)
      )
      .collect();

    return {
      studentId: response.studentId,
      spreadsheetData: response.spreadsheetData,
      draftData: response.draftData,
      isCompleted: response.isCompleted,
      attempts: attempts.length,
      maxAttempts: response.maxAttempts,
      lastValidationResult: response.lastValidationResult,
      submittedAt: response.submittedAt,
      updatedAt: response.updatedAt,
    };
  },
});

export const getActivityForValidation = internalQuery({
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

export const submitSpreadsheet = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    spreadsheetData: spreadsheetDataValidator,
    isCompleted: v.boolean(),
    validationResult: validationResultValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check existing response for attempt limit
    const existingResponse = await ctx.db
      .query("student_spreadsheet_responses")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .unique();

    const maxAttempts = existingResponse?.maxAttempts ?? 3;

    // Get existing attempts to compute attempt number
    const existingAttempts = await ctx.db
      .query("spreadsheet_submission_attempts")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.userId).eq("activityId", args.activityId)
      )
      .collect();

    if (existingAttempts.length >= maxAttempts) {
      throw new Error(`Maximum attempts (${maxAttempts}) reached for this activity.`);
    }

    const attemptNumber = existingAttempts.length + 1;

    // Create the attempt record
    const attemptId = await ctx.db.insert("spreadsheet_submission_attempts", {
      studentId: args.userId,
      activityId: args.activityId,
      attemptNumber,
      spreadsheetData: args.spreadsheetData,
      validationResult: args.validationResult,
      submittedAt: now,
      createdAt: now,
    });

    // Update or create the student_spreadsheet_responses record
    if (existingResponse) {
      await ctx.db.patch(existingResponse._id, {
        spreadsheetData: args.spreadsheetData,
        isCompleted: args.isCompleted,
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
        lastValidationResult: args.validationResult,
        maxAttempts: 3,
        submittedAt: args.isCompleted ? now : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, attemptId, attemptNumber };
  },
});

export const updateCompetency = internalMutation({
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

export const getProfileByUserId = internalQuery({
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

export const getProfileByUsername = internalQuery({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!profile) return null;

    return {
      id: profile._id,
      role: profile.role,
      organizationId: profile.organizationId,
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});

export const getProfileById = internalQuery({
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
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});

export const getActivityById = internalQuery({
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

export const getSpreadsheetAttempts = internalQuery({
  args: {
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("spreadsheet_submission_attempts")
      .withIndex("by_student_and_activity", (q) =>
        q.eq("studentId", args.studentId).eq("activityId", args.activityId)
      )
      .order("asc")
      .collect();

    return attempts;
  },
});

export const updateAttemptWithAiFeedback = internalMutation({
  args: {
    attemptId: v.id("spreadsheet_submission_attempts"),
    aiFeedback: v.object({
      preliminaryScore: v.number(),
      strengths: v.array(v.string()),
      improvements: v.array(v.string()),
      nextSteps: v.array(v.string()),
      rawAiResponse: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attemptId, {
      aiFeedback: args.aiFeedback,
    });

    return { success: true };
  },
});

export const updateAttemptWithTeacherOverride = internalMutation({
  args: {
    attemptId: v.id("spreadsheet_submission_attempts"),
    teacherScoreOverride: v.optional(v.number()),
    teacherFeedbackOverride: v.optional(v.string()),
    gradedBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.attemptId, {
      teacherScoreOverride: args.teacherScoreOverride,
      teacherFeedbackOverride: args.teacherFeedbackOverride,
      gradedBy: args.gradedBy,
      gradedAt: now,
    });

    return { success: true };
  },
});

export const submitAssessment = internalMutation({
  args: {
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: practiceSubmissionEnvelopeValidator,
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
