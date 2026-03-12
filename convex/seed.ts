/**
 * Convex curriculum + demo account seed helpers.
 *
 * Usage:
 *   npx convex run seed:seedPublishedCurriculum
 *   npx convex run seed:seedDemoAccounts
 *
 * `seedUnit1Lesson1` is kept as a compatibility alias, but it now seeds the
 * full published curriculum manifest rather than a one-off lesson.
 */

import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  buildPublishedCurriculumSeedPlan,
  type PublishedActivity,
  type PublishedCurriculumLesson,
  type PublishedSection,
} from "../lib/curriculum/published-manifest";

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function pbkdf2Hash(password: string, salt: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations },
    keyMaterial,
    256,
  );
  return base64UrlEncodeBytes(new Uint8Array(derived));
}

function activitySignature(activity: Pick<PublishedActivity, "componentKey" | "displayName" | "description">) {
  return [
    activity.componentKey,
    activity.displayName,
    activity.description ?? "",
  ].join("::");
}

async function ensureCompetencyStandard(
  ctx: MutationCtx,
  code: string,
  now: number,
  cache: Map<string, Id<"competency_standards">>,
) {
  const cached = cache.get(code);
  if (cached) {
    return cached;
  }

  const existing = await ctx.db
    .query("competency_standards")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();

  if (existing) {
    cache.set(code, existing._id);
    return existing._id;
  }

  const standardId = await ctx.db.insert("competency_standards", {
    code,
    description: `Published curriculum standard ${code}`,
    studentFriendlyDescription: `Demonstrate mastery for ${code}.`,
    category: "Curriculum",
    isActive: true,
    createdAt: now,
  });

  cache.set(code, standardId);
  return standardId;
}

async function ensureActivity(
  ctx: MutationCtx,
  activity: PublishedActivity,
  now: number,
  existingActivities: Doc<"activities">[],
  cache: Map<string, Id<"activities">>,
) {
  const signature = activitySignature(activity);
  const cached = cache.get(signature);
  if (cached) {
    return cached;
  }

  const existing = existingActivities.find(
    (candidate) =>
      candidate.componentKey === activity.componentKey &&
      candidate.displayName === activity.displayName &&
      (candidate.description ?? null) === (activity.description ?? null),
  );

  if (existing) {
    await ctx.db.patch(existing._id, {
      description: activity.description,
      props: activity.props,
      gradingConfig: activity.gradingConfig,
      updatedAt: now,
    });
    cache.set(signature, existing._id);
    return existing._id;
  }

  const activityId = await ctx.db.insert("activities", {
    componentKey: activity.componentKey,
    displayName: activity.displayName,
    description: activity.description,
    props: activity.props,
    gradingConfig: activity.gradingConfig,
    createdAt: now,
    updatedAt: now,
  });

  const inserted = await ctx.db.get(activityId);
  if (inserted) {
    existingActivities.push(inserted);
  }

  cache.set(signature, activityId);
  return activityId;
}

async function replaceLessonVersionPhases(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
) {
  const existingPhases = await ctx.db
    .query("phase_versions")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersionId))
    .collect();

  for (const phase of existingPhases) {
    const sections = await ctx.db
      .query("phase_sections")
      .withIndex("by_phase_version", (q) => q.eq("phaseVersionId", phase._id))
      .collect();

    for (const section of sections) {
      await ctx.db.delete!(section._id);
    }

    await ctx.db.delete!(phase._id);
  }
}

async function replaceLessonStandards(
  ctx: MutationCtx,
  lessonVersionId: Id<"lesson_versions">,
  standardIds: Array<{ standardId: Id<"competency_standards">; isPrimary: boolean }>,
  now: number,
) {
  const existingLinks = await ctx.db
    .query("lesson_standards")
    .withIndex("by_lesson_version", (q) => q.eq("lessonVersionId", lessonVersionId))
    .collect();

  for (const link of existingLinks) {
    await ctx.db.delete!(link._id);
  }

  for (const standard of standardIds) {
    await ctx.db.insert("lesson_standards", {
      lessonVersionId,
      standardId: standard.standardId,
      isPrimary: standard.isPrimary,
      createdAt: now,
    });
  }
}

function normalizeSectionContent(
  section: PublishedSection,
  activityIdByLogicalKey: Map<string, Id<"activities">>,
) {
  if (
    section.sectionType === "activity" &&
    typeof section.content.activityId === "string"
  ) {
    const resolvedActivityId = activityIdByLogicalKey.get(section.content.activityId);
    if (!resolvedActivityId) {
      throw new Error(`Missing activity mapping for ${section.content.activityId}`);
    }

    return {
      ...section.content,
      activityId: resolvedActivityId,
    };
  }

  return section.content;
}

async function upsertPublishedLesson(
  ctx: MutationCtx,
  lesson: PublishedCurriculumLesson,
  now: number,
  existingActivities: Doc<"activities">[],
  standardCache: Map<string, Id<"competency_standards">>,
  activityCache: Map<string, Id<"activities">>,
) {
  let lessonRow = await ctx.db
    .query("lessons")
    .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
    .unique();

  if (lessonRow) {
    await ctx.db.patch(lessonRow._id, {
      unitNumber: lesson.unitNumber,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      learningObjectives: lesson.learningObjectives,
      orderIndex: lesson.orderIndex,
      metadata: lesson.metadata,
      updatedAt: now,
    });
    lessonRow = await ctx.db.get(lessonRow._id);
  } else {
    const lessonId = await ctx.db.insert("lessons", {
      unitNumber: lesson.unitNumber,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      learningObjectives: lesson.learningObjectives,
      orderIndex: lesson.orderIndex,
      metadata: lesson.metadata,
      createdAt: now,
      updatedAt: now,
    });
    lessonRow = await ctx.db.get(lessonId);
  }

  if (!lessonRow) {
    throw new Error(`Unable to upsert lesson ${lesson.slug}`);
  }

  let lessonVersion = await ctx.db
    .query("lesson_versions")
    .withIndex("by_lesson_and_version", (q) =>
      q.eq("lessonId", lessonRow._id).eq("version", lesson.version.version),
    )
    .unique();

  if (lessonVersion) {
    await ctx.db.patch(lessonVersion._id, {
      title: lesson.version.title,
      description: lesson.version.description,
      status: lesson.version.status,
    });
    lessonVersion = await ctx.db.get(lessonVersion._id);
  } else {
    const lessonVersionId = await ctx.db.insert("lesson_versions", {
      lessonId: lessonRow._id,
      version: lesson.version.version,
      title: lesson.version.title,
      description: lesson.version.description,
      status: lesson.version.status,
      createdAt: now,
    });
    lessonVersion = await ctx.db.get(lessonVersionId);
  }

  if (!lessonVersion) {
    throw new Error(`Unable to upsert lesson version for ${lesson.slug}`);
  }

  const standardIds = [];
  for (const standard of lesson.standards) {
    const standardId = await ensureCompetencyStandard(ctx, standard.code, now, standardCache);
    standardIds.push({ standardId, isPrimary: standard.isPrimary });
  }

  await replaceLessonStandards(ctx, lessonVersion._id, standardIds, now);
  await replaceLessonVersionPhases(ctx, lessonVersion._id);

  const activityIdByLogicalKey = new Map<string, Id<"activities">>();
  for (const activity of lesson.activities) {
    const activityId = await ensureActivity(ctx, activity, now, existingActivities, activityCache);
    activityIdByLogicalKey.set(activity.key, activityId);
  }

  for (const phase of lesson.phases) {
    const phaseId = await ctx.db.insert("phase_versions", {
      lessonVersionId: lessonVersion._id,
      phaseNumber: phase.phaseNumber,
      title: phase.title,
      estimatedMinutes: phase.estimatedMinutes,
      createdAt: now,
    });

    for (const [index, section] of phase.sections.entries()) {
      await ctx.db.insert("phase_sections", {
        phaseVersionId: phaseId,
        sequenceOrder: index + 1,
        sectionType: section.sectionType,
        content: normalizeSectionContent(section, activityIdByLogicalKey),
        createdAt: now,
      });
    }
  }

  return lessonRow._id;
}

async function seedPublishedCurriculumHandler(ctx: MutationCtx) {
  const now = Date.now();
  const seedPlan = buildPublishedCurriculumSeedPlan();
  const existingActivities = await ctx.db.query("activities").collect();
  const standardCache = new Map<string, Id<"competency_standards">>();
  const activityCache = new Map<string, Id<"activities">>();

  const lessonIds: Id<"lessons">[] = [];
  for (const lesson of seedPlan.lessons) {
    lessonIds.push(
      await upsertPublishedLesson(
        ctx,
        lesson,
        now,
        existingActivities,
        standardCache,
        activityCache,
      ),
    );
  }

  return {
    status: "seeded",
    lessonCount: seedPlan.lessons.length,
    instructionalUnitCount: seedPlan.instructionalUnitCount,
    capstoneLessonCount: seedPlan.capstoneLessonCount,
    lessonIds,
  };
}

export const seedPublishedCurriculum = mutation({
  args: {},
  handler: seedPublishedCurriculumHandler,
});

export const seedUnit1Lesson1 = mutation({
  args: {},
  handler: seedPublishedCurriculumHandler,
});

export const seedDemoAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const DEV_ITERATIONS = 10_000;

    let org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", "demo-org"))
      .unique();

    if (!org) {
      const orgId = await ctx.db.insert("organizations", {
        name: "Demo Organization",
        slug: "demo-org",
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      org = await ctx.db.get(orgId);
    }

    if (!org) {
      throw new Error("Failed to create or retrieve demo-org");
    }

    const demoUsers = [
      {
        username: "demo_teacher",
        role: "teacher" as const,
        displayName: "Demo Teacher",
        password: "demo123",
      },
      {
        username: "demo_student",
        role: "student" as const,
        displayName: "Demo Student",
        password: "demo123",
      },
      {
        username: "demo_admin",
        role: "admin" as const,
        displayName: "Demo Admin",
        password: "demo123",
      },
    ];

    const results: Array<{ username: string; status: string }> = [];

    for (const user of demoUsers) {
      let profile = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (!profile) {
        const profileId = await ctx.db.insert("profiles", {
          organizationId: org._id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          createdAt: now,
          updatedAt: now,
        });
        profile = await ctx.db.get(profileId);
      }

      if (!profile) {
        results.push({ username: user.username, status: "profile_error" });
        continue;
      }

      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const salt = base64UrlEncodeBytes(saltBytes);
      const passwordHash = await pbkdf2Hash(user.password, salt, DEV_ITERATIONS);

      const existingCredential = await ctx.db
        .query("auth_credentials")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (existingCredential) {
        await ctx.db.patch(existingCredential._id, {
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: DEV_ITERATIONS,
          isActive: true,
          updatedAt: now,
        });
        results.push({ username: user.username, status: "updated" });
      } else {
        await ctx.db.insert("auth_credentials", {
          profileId: profile._id,
          username: user.username,
          role: user.role,
          organizationId: org._id,
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: DEV_ITERATIONS,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ username: user.username, status: "created" });
      }
    }

    return {
      status: "seeded",
      orgId: org._id,
      results,
    };
  },
});
