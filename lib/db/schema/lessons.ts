import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

const stringArray = z.array(z.string());

export const unitResourceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  type: z.enum(['download', 'link', 'external'])
});

export const unitDrivingQuestionSchema = z.object({
  question: z.string(),
  context: z.string(),
  scenario: z.string().optional()
});

export const unitObjectivesSchema = z.object({
  content: stringArray,
  skills: stringArray,
  deliverables: stringArray
});

export const unitPerformanceTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  requirements: stringArray,
  context: z.string().optional()
});

export const unitMilestoneSchema = z.object({
  id: z.string(),
  day: z.number(),
  title: z.string(),
  description: z.string(),
  criteria: stringArray
});

export const unitRubricCriteriaSchema = z.object({
  name: z.string(),
  weight: z.string(),
  exemplary: z.string(),
  proficient: z.string(),
  developing: z.string()
});

export const unitAssessmentSchema = z.object({
  performanceTask: unitPerformanceTaskSchema,
  milestones: z.array(unitMilestoneSchema),
  rubric: z.array(unitRubricCriteriaSchema)
});

export const unitLearningSequenceDaySchema = z.object({
  day: z.number(),
  focus: z.string(),
  activities: stringArray,
  resources: stringArray,
  milestone: z.string().optional()
});

export const unitLearningSequenceWeekSchema = z.object({
  weekNumber: z.number(),
  title: z.string(),
  description: z.string(),
  days: z.array(unitLearningSequenceDaySchema)
});

export const unitLearningSequenceSchema = z.object({
  weeks: z.array(unitLearningSequenceWeekSchema)
});

export const unitStudentChoicesSchema = z.object({
  ventures: stringArray.optional(),
  roles: stringArray.optional(),
  presentationFormats: stringArray.optional()
});

export const unitPrerequisitesSchema = z.object({
  knowledge: stringArray,
  technology: stringArray,
  resources: z.array(unitResourceSchema)
});

export const unitDifferentiationSchema = z.object({
  struggling: stringArray.default([]),
  advanced: stringArray.default([]),
  ell: stringArray.default([])
});

const videoContentSchema = z.object({
  youtubeId: z.string(),
  title: z.string(),
  duration: z.string().optional(),
  description: z.string().optional(),
  transcript: z.string()
});

const unitEntryEventSchema = z.object({
  title: z.string(),
  description: z.string(),
  activities: stringArray,
  resources: stringArray.optional()
});

const unitProjectOverviewSchema = z.object({
  scenario: z.string(),
  teamStructure: z.string(),
  deliverable: z.string(),
  timeline: z.string()
});

export const unitIntroductionSchema = z.object({
  unitNumber: z.string(),
  unitTitle: z.string(),
  drivingQuestion: z.string(),
  introVideo: videoContentSchema.optional(),
  entryEvent: unitEntryEventSchema,
  projectOverview: unitProjectOverviewSchema,
  learningObjectives: unitObjectivesSchema,
  nextSectionHref: z.string().optional()
});

export const unitContentSchema = z.object({
  drivingQuestion: unitDrivingQuestionSchema,
  objectives: unitObjectivesSchema,
  assessment: unitAssessmentSchema,
  learningSequence: unitLearningSequenceSchema,
  studentChoices: unitStudentChoicesSchema.optional(),
  prerequisites: unitPrerequisitesSchema,
  differentiation: unitDifferentiationSchema.optional(),
  introduction: unitIntroductionSchema.optional()
});

export type UnitResource = z.infer<typeof unitResourceSchema>;
export type UnitDrivingQuestion = z.infer<typeof unitDrivingQuestionSchema>;
export type UnitObjectives = z.infer<typeof unitObjectivesSchema>;
export type UnitAssessment = z.infer<typeof unitAssessmentSchema>;
export type UnitMilestone = z.infer<typeof unitMilestoneSchema>;
export type UnitRubricCriteria = z.infer<typeof unitRubricCriteriaSchema>;
export type UnitLearningSequence = z.infer<typeof unitLearningSequenceSchema>;
export type UnitStudentChoices = z.infer<typeof unitStudentChoicesSchema>;
export type UnitPrerequisites = z.infer<typeof unitPrerequisitesSchema>;
export type UnitDifferentiation = z.infer<typeof unitDifferentiationSchema>;
export type UnitIntroduction = z.infer<typeof unitIntroductionSchema>;
export type UnitContent = z.infer<typeof unitContentSchema>;

export const lessonMetadataSchema = z.object({
  duration: z.number().optional(),
  durationLabel: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
  unitContent: unitContentSchema.optional()
});

export type LessonMetadata = z.infer<typeof lessonMetadataSchema>;

export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitNumber: integer('unit_number').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  learningObjectives: jsonb('learning_objectives').$type<string[] | null>(),
  orderIndex: integer('order_index').notNull(),
  metadata: jsonb('metadata').$type<LessonMetadata | null>(),
  // Temporarily commented out until migration is applied to production
  // currentVersionId: uuid('current_version_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
