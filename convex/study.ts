import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { scheduleNewTerm, processReview as processFsrsReview, proficiencyBand, updateMastery } from "../lib/study/srs";
import { getGlossaryTermsByUnit } from "../lib/study/glossary";
import type { Card } from "ts-fsrs";

export const getStudyPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const preferences = await ctx.db
      .query("study_preferences")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .unique();

    return preferences ?? {
      languageMode: "en_to_en",
    };
  },
});

export const updatePreferences = mutation({
  args: {
    languageMode: v.union(
      v.literal("en_to_en"),
      v.literal("en_to_zh"),
      v.literal("zh_to_en"),
      v.literal("zh_to_zh")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const now = Date.now();

    const existing = await ctx.db
      .query("study_preferences")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        languageMode: args.languageMode,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("study_preferences", {
        userId: profile._id,
        languageMode: args.languageMode,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const getTermMasteryByUnit = query({
  args: { unitNumber: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const mastery = await ctx.db
      .query("term_mastery")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .collect();

    if (args.unitNumber === undefined) return mastery;

    const unitTerms = getGlossaryTermsByUnit(args.unitNumber);
    const unitSlugs = new Set(unitTerms.map(t => t.slug));
    return mastery.filter(m => unitSlugs.has(m.termSlug));
  },
});

export const getDueTerms = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const now = Date.now();

    const allReviews = await ctx.db
      .query("due_reviews")
      .withIndex("by_user", (q) =>
        q.eq("userId", profile._id)
      )
      .collect();

    return allReviews.filter((review) => review.scheduledFor <= now);
  },
});

export const getRecentSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const sessions = await ctx.db
      .query("study_sessions")
      .withIndex("by_user_and_started", (q) => q.eq("userId", profile._id))
      .order("desc")
      .take(args.limit ?? 10);

    return sessions;
  },
});

export const processReview = mutation({
  args: {
    termSlug: v.string(),
    rating: v.union(
      v.literal("again"),
      v.literal("hard"),
      v.literal("good"),
      v.literal("easy")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const now = Date.now();

    const mastery = await ctx.db
      .query("term_mastery")
      .withIndex("by_user_and_term", (q) =>
        q.eq("userId", profile._id).eq("termSlug", args.termSlug)
      )
      .unique();

    const dueReview = await ctx.db
      .query("due_reviews")
      .withIndex("by_user_and_term", (q) =>
        q.eq("userId", profile._id).eq("termSlug", args.termSlug)
      )
      .unique();

    let fsrsResult;
    if (!dueReview) {
      const scheduled = scheduleNewTerm(args.termSlug);
      fsrsResult = processFsrsReview(scheduled, args.rating);
    } else {
      fsrsResult = processFsrsReview(
        {
          termSlug: args.termSlug,
          fsrsState: dueReview.fsrsState as Card,
          scheduledFor: dueReview.scheduledFor,
        },
        args.rating
      );
    }

    const delta = fsrsResult.masteryDelta;

    if (!mastery) {
      const newScore = updateMastery(0.5, delta);
      await ctx.db.insert("term_mastery", {
        userId: profile._id,
        termSlug: args.termSlug,
        masteryScore: newScore,
        proficiencyBand: proficiencyBand(newScore),
        seenCount: 1,
        correctCount: args.rating !== "again" ? 1 : 0,
        incorrectCount: args.rating === "again" ? 1 : 0,
        lastReviewedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const newScore = updateMastery(mastery.masteryScore, delta);
      const newBand = proficiencyBand(newScore);

      await ctx.db.patch(mastery._id, {
        masteryScore: newScore,
        proficiencyBand: newBand,
        seenCount: mastery.seenCount + 1,
        correctCount:
          mastery.correctCount + (args.rating !== "again" ? 1 : 0),
        incorrectCount:
          mastery.incorrectCount + (args.rating === "again" ? 1 : 0),
        lastReviewedAt: now,
        updatedAt: now,
      });
    }

    if (!dueReview) {
      await ctx.db.insert("due_reviews", {
        userId: profile._id,
        termSlug: args.termSlug,
        scheduledFor: fsrsResult.scheduledFor,
        fsrsState: fsrsResult.fsrsState,
        isDue: false,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(dueReview._id, {
        scheduledFor: fsrsResult.scheduledFor,
        fsrsState: fsrsResult.fsrsState,
        isDue: false,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const recordSession = mutation({
  args: {
    activityType: v.union(
      v.literal("flashcards"),
      v.literal("matching"),
      v.literal("matching_game"),
      v.literal("speed_round"),
      v.literal("srs_review"),
      v.literal("practice_test")
    ),
    termCount: v.optional(v.number()),
    correctCount: v.optional(v.number()),
    totalCount: v.optional(v.number()),
    maxStreak: v.optional(v.number()),
    curriculumScope: v.optional(v.object({
      type: v.union(v.literal("all_units"), v.literal("unit")),
      unitNumber: v.optional(v.number()),
    })),
    results: v.optional(v.object({
      itemsSeen: v.number(),
      itemsCorrect: v.number(),
      itemsIncorrect: v.number(),
      durationSeconds: v.number(),
    })),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const now = Date.now();
    const session = await ctx.db.insert("study_sessions", {
      userId: profile._id,
      activityType: args.activityType === "matching_game" ? "matching" : args.activityType,
      curriculumScope: args.curriculumScope ?? { type: "all_units" },
      results: args.results ?? {
        itemsSeen: args.termCount ?? args.totalCount ?? 0,
        itemsCorrect: args.correctCount ?? 0,
        itemsIncorrect: (args.totalCount ?? 0) - (args.correctCount ?? 0),
        durationSeconds: 0,
      },
      startedAt: args.startedAt ?? now,
      endedAt: args.endedAt ?? now,
      createdAt: now,
    });

    return { sessionId: session };
  },
});

export const getExportData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const [preferences, termMastery, dueReviews, studySessions, practiceTestResults] = await Promise.all([
      ctx.db.query("study_preferences").withIndex("by_user", (q) => q.eq("userId", profile._id)).unique(),
      ctx.db.query("term_mastery").withIndex("by_user", (q) => q.eq("userId", profile._id)).collect(),
      ctx.db.query("due_reviews").withIndex("by_user", (q) => q.eq("userId", profile._id)).collect(),
      ctx.db.query("study_sessions").withIndex("by_user_and_started", (q) => q.eq("userId", profile._id)).order("desc").collect(),
      ctx.db.query("practice_test_results").withIndex("by_user", (q) => q.eq("userId", profile._id)).collect(),
    ]);

    return {
      preferences,
      termMastery,
      dueReviews,
      studySessions,
      practiceTestResults,
      exportedAt: Date.now(),
    };
  },
});

export const getPracticeTestResults = query({
  args: { unitNumber: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    let resultsQuery = ctx.db
      .query("practice_test_results")
      .withIndex("by_user", (q) => q.eq("userId", profile._id));

    if (args.unitNumber !== undefined) {
      const unitNumber = args.unitNumber;
      resultsQuery = ctx.db
        .query("practice_test_results")
        .withIndex("by_user_and_unit", (q) =>
          q.eq("userId", profile._id).eq("unitNumber", unitNumber)
        );
    }

    const results = await resultsQuery.order("desc").collect();
    return results;
  },
});

export const savePracticeTestResult = mutation({
  args: {
    unitNumber: v.number(),
    lessonsTested: v.array(v.string()),
    questionCount: v.number(),
    score: v.number(),
    perLessonBreakdown: v.array(
      v.object({
        lessonId: v.string(),
        correct: v.number(),
        total: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const now = Date.now();

    if (args.score < 0 || args.score > args.questionCount) {
      throw new Error("Invalid score: must be between 0 and questionCount");
    }
    if (args.questionCount <= 0) {
      throw new Error("Invalid question count: must be positive");
    }
    if (args.unitNumber < 1 || args.unitNumber > 8) {
      throw new Error("Invalid unit number: must be between 1 and 8");
    }

    const resultId = await ctx.db.insert("practice_test_results", {
      userId: profile._id,
      unitNumber: args.unitNumber,
      lessonsTested: args.lessonsTested,
      questionCount: args.questionCount,
      score: args.score,
      perLessonBreakdown: args.perLessonBreakdown,
      completedAt: now,
      createdAt: now,
    });

    return { resultId };
  },
});
