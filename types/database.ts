import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  activities,
  lessonVersions,
  lessons,
  organizations,
  phaseSections,
  phaseVersions,
  profiles,
  studentProgress,
} from '@/lib/db/schema';

export const DATABASE_TABLE_NAMES = [
  'organizations',
  'lessons',
  'lesson_versions',
  'phase_versions',
  'phase_sections',
  'profiles',
  'activities',
  'student_progress',
] as const;

export type DatabaseTableName = (typeof DATABASE_TABLE_NAMES)[number];

export type OrganizationRow = InferSelectModel<typeof organizations>;
export type NewOrganizationRow = InferInsertModel<typeof organizations>;

export type LessonRow = InferSelectModel<typeof lessons>;
export type NewLessonRow = InferInsertModel<typeof lessons>;

export type LessonVersionRow = InferSelectModel<typeof lessonVersions>;
export type NewLessonVersionRow = InferInsertModel<typeof lessonVersions>;

export type PhaseVersionRow = InferSelectModel<typeof phaseVersions>;
export type NewPhaseVersionRow = InferInsertModel<typeof phaseVersions>;

export type PhaseSectionRow = InferSelectModel<typeof phaseSections>;
export type NewPhaseSectionRow = InferInsertModel<typeof phaseSections>;

export type ProfileRow = InferSelectModel<typeof profiles>;
export type NewProfileRow = InferInsertModel<typeof profiles>;

export type ActivityRow = InferSelectModel<typeof activities>;
export type NewActivityRow = InferInsertModel<typeof activities>;

export type StudentProgressRow = InferSelectModel<typeof studentProgress>;
export type NewStudentProgressRow = InferInsertModel<typeof studentProgress>;

export interface DatabaseTables {
  organizations: { row: OrganizationRow; insert: NewOrganizationRow };
  lessons: { row: LessonRow; insert: NewLessonRow };
  lesson_versions: { row: LessonVersionRow; insert: NewLessonVersionRow };
  phase_versions: { row: PhaseVersionRow; insert: NewPhaseVersionRow };
  phase_sections: { row: PhaseSectionRow; insert: NewPhaseSectionRow };
  profiles: { row: ProfileRow; insert: NewProfileRow };
  activities: { row: ActivityRow; insert: NewActivityRow };
  student_progress: { row: StudentProgressRow; insert: NewStudentProgressRow };
}

export type TableRow<T extends DatabaseTableName> = DatabaseTables[T]['row'];
export type TableInsert<T extends DatabaseTableName> = DatabaseTables[T]['insert'];
