import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { practiceSubmissionEnvelopeValidator } from "./practice_submission";

const spreadsheetCellValidator = v.object({
  value: v.union(v.string(), v.number()),
  readOnly: v.optional(v.boolean()),
  className: v.optional(v.string()),
});

const spreadsheetDataValidator = v.array(v.array(spreadsheetCellValidator));

const cellFeedbackValidator = v.object({
  cell: v.string(),
  isCorrect: v.boolean(),
  message: v.optional(v.string()),
  expectedValue: v.optional(v.union(v.string(), v.number())),
  actualValue: v.optional(v.union(v.string(), v.number())),
});

const validationResultValidator = v.object({
  isComplete: v.boolean(),
  totalCells: v.number(),
  correctCells: v.number(),
  feedback: v.array(cellFeedbackValidator),
  timestamp: v.string(),
});

const fsrsStateValidator = v.record(v.string(), v.any());

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(), // Must be unique
    settings: v.optional(v.any()), // JSONB
    createdAt: v.number(), // Using Unix timestamps (milliseconds)
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  profiles: defineTable({
    organizationId: v.id("organizations"),
    username: v.string(), // Must be unique
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    metadata: v.optional(v.any()), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_username", ["username"]),

  auth_credentials: defineTable({
    profileId: v.id("profiles"),
    username: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
    organizationId: v.id("organizations"),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_profile", ["profileId"]),

  classes: defineTable({
    teacherId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    archived: v.boolean(),
    metadata: v.optional(v.any()), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_teacher", ["teacherId"]),

  class_enrollments: defineTable({
    classId: v.id("classes"),
    studentId: v.id("profiles"),
    enrolledAt: v.number(),
    status: v.union(v.literal("active"), v.literal("withdrawn"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_class", ["classId"])
    .index("by_student", ["studentId"])
    .index("by_class_and_student", ["classId", "studentId"]), // Enforce uniqueness in mutations

  lessons: defineTable({
    unitNumber: v.number(),
    title: v.string(),
    slug: v.string(), // Must be unique
    description: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    orderIndex: v.number(),
    metadata: v.optional(v.any()), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_unit_and_order", ["unitNumber", "orderIndex"]),

  lesson_versions: defineTable({
    lessonId: v.id("lessons"),
    version: v.number(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived")),
    createdAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_status", ["status"])
    .index("by_lesson_and_version", ["lessonId", "version"]),

  phase_versions: defineTable({
    lessonVersionId: v.id("lesson_versions"),
    phaseNumber: v.number(),
    title: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_lesson_version", ["lessonVersionId"])
    .index("by_lesson_version_and_phase", ["lessonVersionId", "phaseNumber"]),

  phase_sections: defineTable({
    phaseVersionId: v.id("phase_versions"),
    sequenceOrder: v.number(),
    sectionType: v.union(
      v.literal("text"),
      v.literal("callout"),
      v.literal("activity"),
      v.literal("video"),
      v.literal("image")
    ),
    content: v.any(), // JSONB
    createdAt: v.number(),
  })
    .index("by_phase_version", ["phaseVersionId"])
    .index("by_phase_version_and_sequence", ["phaseVersionId", "sequenceOrder"]),

  competency_standards: defineTable({
    code: v.string(), // Must be unique
    description: v.string(),
    studentFriendlyDescription: v.optional(v.string()),
    category: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  lesson_standards: defineTable({
    lessonVersionId: v.id("lesson_versions"),
    standardId: v.id("competency_standards"),
    isPrimary: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_lesson_version", ["lessonVersionId"])
    .index("by_standard", ["standardId"])
    .index("by_lesson_version_and_standard", ["lessonVersionId", "standardId"]),

  activities: defineTable({
    componentKey: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    props: v.any(), // JSONB
    gradingConfig: v.optional(v.any()), // JSONB
    standardId: v.optional(v.id("competency_standards")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_standard", ["standardId"]),

  student_competency: defineTable({
    studentId: v.id("profiles"),
    standardId: v.id("competency_standards"),
    masteryLevel: v.number(),
    evidenceActivityId: v.optional(v.id("activities")),
    lastUpdated: v.number(),
    createdAt: v.number(),
    updatedBy: v.optional(v.id("profiles")),
  })
    .index("by_student", ["studentId"])
    .index("by_standard", ["standardId"])
    .index("by_student_and_standard", ["studentId", "standardId"]),

  resources: defineTable({
    lessonId: v.optional(v.id("lessons")),
    phaseId: v.optional(v.id("phase_versions")),
    title: v.string(),
    description: v.optional(v.string()),
    resourceType: v.union(
      v.literal("dataset"),
      v.literal("pdf"),
      v.literal("excel"),
      v.literal("link"),
      v.literal("video")
    ),
    filePath: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    metadata: v.optional(v.any()), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_phase", ["phaseId"]),

  student_progress: defineTable({
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    timeSpentSeconds: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phase", ["phaseId"])
    .index("by_user_and_phase", ["userId", "phaseId"]),

  activity_submissions: defineTable({
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: practiceSubmissionEnvelopeValidator,
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    feedback: v.optional(v.string()),
    submittedAt: v.number(),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.id("profiles")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_activity", ["activityId"])
    .index("by_user_and_activity", ["userId", "activityId"]),

  live_sessions: defineTable({
    activityId: v.id("activities"),
    classId: v.id("classes"),
    hostId: v.id("profiles"),
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("completed")),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    settings: v.optional(v.any()), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_activity", ["activityId"])
    .index("by_class", ["classId"])
    .index("by_host", ["hostId"]),

  live_responses: defineTable({
    sessionId: v.id("live_sessions"),
    userId: v.id("profiles"),
    questionId: v.string(),
    answer: v.any(), // JSONB
    isCorrect: v.boolean(),
    responseTimeMs: v.number(),
    respondedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  session_leaderboard: defineTable({
    sessionId: v.id("live_sessions"),
    userId: v.id("profiles"),
    score: v.number(),
    totalQuestions: v.number(),
    avgResponseTimeMs: v.optional(v.number()),
    rank: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_session_and_user", ["sessionId", "userId"]),

  content_revisions: defineTable({
    entityType: v.union(v.literal("lesson"), v.literal("phase"), v.literal("activity")),
    entityId: v.string(), // Abstract ID since it could point to different tables
    proposedChanges: v.any(), // JSONB
    validationStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    validationErrors: v.optional(v.any()), // JSONB
    proposedBy: v.id("profiles"),
    reviewedBy: v.optional(v.id("profiles")),
    reviewedAt: v.optional(v.number()),
    comment: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_proposed_by", ["proposedBy"])
    .index("by_entity_type_and_id", ["entityType", "entityId"]),

  student_spreadsheet_responses: defineTable({
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
    spreadsheetData: spreadsheetDataValidator, // JSONB
    isCompleted: v.boolean(),
    maxAttempts: v.optional(v.number()),
    lastValidationResult: v.optional(validationResultValidator), // JSONB
    submittedAt: v.optional(v.number()),
    draftData: v.optional(spreadsheetDataValidator), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_activity", ["activityId"])
    .index("by_student_and_activity", ["studentId", "activityId"]),

  spreadsheet_submission_attempts: defineTable({
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
    attemptNumber: v.number(),
    spreadsheetData: spreadsheetDataValidator, // JSONB
    validationResult: validationResultValidator, // JSONB
    aiFeedback: v.optional(v.object({
      preliminaryScore: v.number(),
      strengths: v.array(v.string()),
      improvements: v.array(v.string()),
      nextSteps: v.array(v.string()),
      rawAiResponse: v.string(),
    })),
    teacherScoreOverride: v.optional(v.number()),
    teacherFeedbackOverride: v.optional(v.string()),
    gradedBy: v.optional(v.id("profiles")),
    gradedAt: v.optional(v.number()),
    submittedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_activity", ["activityId"])
    .index("by_student_and_activity", ["studentId", "activityId"])
    .index("by_student_activity_attempt", ["studentId", "activityId", "attemptNumber"]),

  activity_completions: defineTable({
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
    lessonId: v.id("lessons"),
    phaseNumber: v.number(),
    completedAt: v.number(),
    idempotencyKey: v.string(), // Must be unique
    completionData: v.optional(v.any()), // JSONB
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_activity", ["activityId"])
    .index("by_lesson", ["lessonId"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_student_and_activity", ["studentId", "activityId"]),

  study_preferences: defineTable({
    userId: v.id("profiles"),
    languageMode: v.union(
      v.literal("en_to_en"),
      v.literal("en_to_zh"),
      v.literal("zh_to_en"),
      v.literal("zh_to_zh")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  term_mastery: defineTable({
    userId: v.id("profiles"),
    termSlug: v.string(),
    masteryScore: v.number(), // 0-1
    proficiencyBand: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("familiar"),
      v.literal("mastered")
    ),
    seenCount: v.number(),
    correctCount: v.number(),
    incorrectCount: v.number(),
    lastReviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_term", ["userId", "termSlug"]),

  due_reviews: defineTable({
    userId: v.id("profiles"),
    termSlug: v.string(),
    scheduledFor: v.number(), // Unix timestamp (ms)
    fsrsState: fsrsStateValidator, // JSONB: serialized FSRS scheduler state
    isDue: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_term", ["userId", "termSlug"])
    .index("by_user_and_due", ["userId", "isDue"]),

  study_sessions: defineTable({
    userId: v.id("profiles"),
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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_activity", ["userId", "activityType"])
    .index("by_user_and_started", ["userId", "startedAt"]),

  practice_test_results: defineTable({
    userId: v.id("profiles"),
    unitNumber: v.number(),
    lessonsTested: v.array(v.string()),
    questionCount: v.number(),
    score: v.number(),
    perLessonBreakdown: v.array(v.object({
      lessonId: v.string(),
      correct: v.number(),
      total: v.number(),
    })),
    completedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_unit", ["userId", "unitNumber"])
    .index("by_user_and_completed", ["userId", "completedAt"]),
});
