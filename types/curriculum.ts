import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { lessons, phases } from '@/lib/db/schema';
import type {
  LessonMetadata as SchemaLessonMetadata,
  UnitContent as SchemaUnitContent,
} from '@/lib/db/schema/lessons';
import type {
  ContentBlock as SchemaContentBlock,
  PhaseMetadata as SchemaPhaseMetadata,
} from '@/lib/db/schema/phases';

export const CURRICULUM_PHASE_COUNT = 6;

export type LessonRow = InferSelectModel<typeof lessons>;
export type NewLessonRow = InferInsertModel<typeof lessons>;
export type PhaseRow = InferSelectModel<typeof phases>;
export type NewPhaseRow = InferInsertModel<typeof phases>;

export type LessonMetadata = SchemaLessonMetadata;
export type UnitContent = SchemaUnitContent;
export type ContentBlock = SchemaContentBlock;
export type PhaseMetadata = SchemaPhaseMetadata;
