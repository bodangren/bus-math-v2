import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { resolveActivityComponentKey } from '../../activities/component-keys';
import { activities, activityPropsSchemas, gradingConfigSchema } from './activities';
import { activitySubmissions, submissionDataSchema } from './activity-submissions';
import { classEnrollments } from './class-enrollments';
import { classes, classMetadataSchema } from './classes';
import { contentRevisions, validationErrorSchema } from './content-revisions';
import { lessons, lessonMetadataSchema } from './lessons';
import { liveResponses, liveResponseAnswerSchema } from './live-responses';
import { liveSessions, sessionSettingsSchema } from './live-sessions';
import { contentBlockSchema, phaseMetadataSchema } from './phase-content';
import { profiles, profileMetadataSchema } from './profiles';
import { resources, resourceMetadataSchema } from './resources';
import { sessionLeaderboard } from './session-leaderboard';
import { studentProgress } from './student-progress';

const jsonRecordSchema = z.record(z.string(), z.unknown());

function addActivityPropsIssues(
  ctx: z.RefinementCtx,
  componentKey: string,
  props: unknown,
) {
  const canonicalComponentKey = resolveActivityComponentKey(componentKey);

  if (!canonicalComponentKey || !(canonicalComponentKey in activityPropsSchemas)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['componentKey'],
      message: `Unknown activity component: ${componentKey}`,
    });
    return;
  }

  const result = activityPropsSchemas[canonicalComponentKey].safeParse(props);
  if (result.success) {
    return;
  }

  result.error.issues.forEach((issue) => {
    ctx.addIssue({
      ...issue,
      path: ['props', ...issue.path],
    });
  });
}

export const insertLessonSchema = createInsertSchema(lessons, {
  learningObjectives: z.array(z.string()).nullable().optional(),
  metadata: lessonMetadataSchema.nullable().optional()
});

export const selectLessonSchema = createSelectSchema(lessons, {
  learningObjectives: z.array(z.string()).nullable(),
  metadata: lessonMetadataSchema.nullable()
});

export type Lesson = z.infer<typeof selectLessonSchema>;
export type NewLesson = z.infer<typeof insertLessonSchema>;

const phaseShapeSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  phaseNumber: z.number().int(),
  title: z.string(),
  contentBlocks: z.array(contentBlockSchema),
  estimatedMinutes: z.number().int().nullable().optional(),
  metadata: phaseMetadataSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPhaseSchema = phaseShapeSchema;
export const selectPhaseSchema = phaseShapeSchema;

export type Phase = z.infer<typeof selectPhaseSchema>;
export type NewPhase = z.infer<typeof insertPhaseSchema>;

export const insertActivitySchema = createInsertSchema(activities, {
  props: z.unknown(),
  gradingConfig: gradingConfigSchema.nullable().optional()
}).superRefine((activity, ctx) => {
  addActivityPropsIssues(ctx, activity.componentKey, activity.props);
});

export const selectActivitySchema = createSelectSchema(activities, {
  props: z.unknown(),
  gradingConfig: gradingConfigSchema.nullable()
}).superRefine((activity, ctx) => {
  addActivityPropsIssues(ctx, activity.componentKey, activity.props);
});

export type Activity = z.infer<typeof selectActivitySchema>;
export type NewActivity = z.infer<typeof insertActivitySchema>;

export const insertResourceSchema = createInsertSchema(resources, {
  metadata: resourceMetadataSchema.nullable().optional()
});

export const selectResourceSchema = createSelectSchema(resources, {
  metadata: resourceMetadataSchema.nullable()
});

export type Resource = z.infer<typeof selectResourceSchema>;
export type NewResource = z.infer<typeof insertResourceSchema>;

export const insertProfileSchema = createInsertSchema(profiles, {
  metadata: profileMetadataSchema.nullable().optional()
});

export const selectProfileSchema = createSelectSchema(profiles, {
  metadata: profileMetadataSchema.nullable()
});

export type Profile = z.infer<typeof selectProfileSchema>;
export type NewProfile = z.infer<typeof insertProfileSchema>;

export const insertStudentProgressSchema = createInsertSchema(studentProgress);
export const selectStudentProgressSchema = createSelectSchema(studentProgress);

export type StudentProgress = z.infer<typeof selectStudentProgressSchema>;
export type NewStudentProgress = z.infer<typeof insertStudentProgressSchema>;

export const insertActivitySubmissionSchema = createInsertSchema(activitySubmissions, {
  submissionData: submissionDataSchema
});

export const selectActivitySubmissionSchema = createSelectSchema(activitySubmissions, {
  submissionData: submissionDataSchema
});

export type ActivitySubmission = z.infer<typeof selectActivitySubmissionSchema>;
export type NewActivitySubmission = z.infer<typeof insertActivitySubmissionSchema>;

export const insertClassSchema = createInsertSchema(classes, {
  metadata: classMetadataSchema.nullable().optional()
});

export const selectClassSchema = createSelectSchema(classes, {
  metadata: classMetadataSchema.nullable()
});

export type Class = z.infer<typeof selectClassSchema>;
export type NewClass = z.infer<typeof insertClassSchema>;

export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments);
export const selectClassEnrollmentSchema = createSelectSchema(classEnrollments);

export type ClassEnrollment = z.infer<typeof selectClassEnrollmentSchema>;
export type NewClassEnrollment = z.infer<typeof insertClassEnrollmentSchema>;

export const insertLiveSessionSchema = createInsertSchema(liveSessions, {
  settings: sessionSettingsSchema.nullable().optional()
});

export const selectLiveSessionSchema = createSelectSchema(liveSessions, {
  settings: sessionSettingsSchema.nullable()
});

export type LiveSession = z.infer<typeof selectLiveSessionSchema>;
export type NewLiveSession = z.infer<typeof insertLiveSessionSchema>;

export const insertLiveResponseSchema = createInsertSchema(liveResponses, {
  answer: liveResponseAnswerSchema
});

export const selectLiveResponseSchema = createSelectSchema(liveResponses, {
  answer: liveResponseAnswerSchema
});

export type LiveResponse = z.infer<typeof selectLiveResponseSchema>;
export type NewLiveResponse = z.infer<typeof insertLiveResponseSchema>;

export const insertSessionLeaderboardEntrySchema = createInsertSchema(sessionLeaderboard);
export const selectSessionLeaderboardEntrySchema = createSelectSchema(sessionLeaderboard);

export type SessionLeaderboardEntry = z.infer<typeof selectSessionLeaderboardEntrySchema>;
export type NewSessionLeaderboardEntry = z.infer<typeof insertSessionLeaderboardEntrySchema>;

export const insertContentRevisionSchema = createInsertSchema(contentRevisions, {
  proposedChanges: jsonRecordSchema,
  validationErrors: validationErrorSchema.array().nullable().optional()
});

export const selectContentRevisionSchema = createSelectSchema(contentRevisions, {
  proposedChanges: jsonRecordSchema,
  validationErrors: validationErrorSchema.array().nullable()
});

export type ContentRevision = z.infer<typeof selectContentRevisionSchema>;
export type NewContentRevision = z.infer<typeof insertContentRevisionSchema>;
