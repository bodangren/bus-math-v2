import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { lessons, phases } from '@/lib/db/schema';
import type {
  LessonMetadata as SchemaLessonMetadata,
  UnitAssessment as SchemaUnitAssessment,
  UnitContent as SchemaUnitContent,
  UnitDifferentiation as SchemaUnitDifferentiation,
  UnitDrivingQuestion as SchemaUnitDrivingQuestion,
  UnitResource as SchemaUnitResource,
  UnitLearningSequence as SchemaUnitLearningSequence,
  UnitObjectives as SchemaUnitObjectives,
  UnitPrerequisites as SchemaUnitPrerequisites,
  UnitStudentChoices as SchemaUnitStudentChoices,
  UnitIntroduction as SchemaUnitIntroduction,
} from '@/lib/db/schema/lessons';
import type {
  ContentBlock as SchemaContentBlock,
  PhaseMetadata as SchemaPhaseMetadata,
} from '@/lib/db/schema/phases';
import { contentBlockSchema as schemaContentBlockSchema } from '@/lib/db/schema/phases';

export const CURRICULUM_PHASE_COUNT = 6;
export const contentBlockSchema = schemaContentBlockSchema;

export type LessonRow = InferSelectModel<typeof lessons>;
export type NewLessonRow = InferInsertModel<typeof lessons>;
export type PhaseRow = InferSelectModel<typeof phases>;
export type NewPhaseRow = InferInsertModel<typeof phases>;

export type LessonMetadata = SchemaLessonMetadata;
export type UnitContent = SchemaUnitContent;
export type UnitAssessment = SchemaUnitAssessment;
export type UnitDrivingQuestion = SchemaUnitDrivingQuestion;
export type UnitDifferentiation = SchemaUnitDifferentiation;
export type UnitIntroduction = SchemaUnitIntroduction;
export type UnitLearningSequence = SchemaUnitLearningSequence;
export type UnitObjectives = SchemaUnitObjectives;
export type UnitPrerequisites = SchemaUnitPrerequisites;
export type UnitResource = SchemaUnitResource;
export type UnitStudentChoices = SchemaUnitStudentChoices;
export type ContentBlock = SchemaContentBlock;
export type PhaseMetadata = SchemaPhaseMetadata;
