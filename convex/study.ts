import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { scheduleNewTerm, processReview as processFsrsReview } from "@/lib/study/srs";

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
  handler: async (ctx) => {
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

    return mastery;
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

    const dueReviews = await ctx.db
      .query("due_reviews")
      .withIndex("by_user_and_due", (q) =>
        q.eq("userId", profile._id).eq("isDue", true)
      )
      .collect();

    return dueReviews.filter((review) => review.scheduledFor <= now);
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
          fsrsState: dueReview.fsrsState,
          scheduledFor: dueReview.scheduledFor,
        },
        args.rating
      );
    }

    const delta = fsrsResult.masteryDelta;

    if (!mastery) {
      await ctx.db.insert("term_mastery", {
        userId: profile._id,
        termSlug: args.termSlug,
        masteryScore: 0.5 + delta,
        proficiencyBand: "learning",
        seenCount: 1,
        correctCount: args.rating !== "again" ? 1 : 0,
        incorrectCount: args.rating === "again" ? 1 : 0,
        lastReviewedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      let newScore = mastery.masteryScore + delta;
      newScore = Math.max(0, Math.min(1, newScore));

      let newBand: "new" | "learning" | "familiar" | "mastered" =
        mastery.proficiencyBand;
      if (newScore < 0.3) newBand = "learning";
      else if (newScore < 0.7) newBand = "familiar";
      else newBand = "mastered";

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
      v.literal("speed_round"),
      v.literal("srs_review"),
      v.literal("practice_test")
    ),
    curriculumScope: v.object({
      type: v.union(v.literal("all_units"), v.literal("unit")),
      unitNumber: v.optional(v.number()),
    }),
    results: v.object({
      itemsSeen: v.number(),
      itemsCorrect: v.number(),
      itemsIncorrect: v.number(),
      durationSeconds: v.number(),
    }),
    startedAt: v.number(),
    endedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", identity.email!))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const session = await ctx.db.insert("study_sessions", {
      userId: profile._id,
      activityType: args.activityType,
      curriculumScope: args.curriculumScope,
      results: args.results,
      startedAt: args.startedAt,
      endedAt: args.endedAt,
      createdAt: Date.now(),
    });

    return { sessionId: session };
  },
});
