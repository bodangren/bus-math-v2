import { query } from "./_generated/server";

export const getCurriculumStats = query({
  args: {},
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    const activities = await ctx.db.query("activities").collect();

    const uniqueUnits = new Set(lessons.map((l) => l.unitNumber));

    return {
      unitCount: uniqueUnits.size,
      lessonCount: lessons.length,
      activityCount: activities.length,
    };
  },
});

export const getUnits = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all lessons where orderIndex is 1
    const lessons = await ctx.db
      .query("lessons")
      .filter((q) => q.eq(q.field("orderIndex"), 1))
      .collect();

    // Sort by unit number ascending
    lessons.sort((a, b) => a.unitNumber - b.unitNumber);

    // Map _id to id so the frontend doesn't need to change its React keys
    return lessons.map((l) => ({
      ...l,
      id: l._id,
      unit_number: l.unitNumber,
      order_index: l.orderIndex,
    }));
  },
});
