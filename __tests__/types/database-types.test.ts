import { describe, expect, expectTypeOf, it } from 'vitest';
import { DATABASE_TABLE_NAMES } from '@/types/database';
import type {
  ActivityRow,
  DatabaseTableName,
  LessonRow,
  LessonVersionRow,
  OrganizationRow,
  PhaseSectionRow,
  PhaseVersionRow,
  ProfileRow,
  StudentProgressRow,
} from '@/types/database';

describe('types/database exports', () => {
  it('exports core row types derived from schema tables', () => {
    expect(DATABASE_TABLE_NAMES).toEqual([
      'organizations',
      'lessons',
      'lesson_versions',
      'phase_versions',
      'phase_sections',
      'profiles',
      'activities',
      'student_progress',
    ]);

    expectTypeOf<OrganizationRow>().toMatchTypeOf<{ id: string; name: string; slug: string }>();
    expectTypeOf<LessonRow>().toMatchTypeOf<{ id: string; slug: string; title: string }>();
    expectTypeOf<LessonVersionRow>().toMatchTypeOf<{ id: string; lessonId: string; version: number }>();
    expectTypeOf<PhaseVersionRow>().toMatchTypeOf<{ id: string; lessonVersionId: string; phaseNumber: number }>();
    expectTypeOf<PhaseSectionRow>().toMatchTypeOf<{ id: string; phaseVersionId: string; sequenceOrder: number }>();
    expectTypeOf<ProfileRow>().toMatchTypeOf<{ id: string; organizationId: string; username: string }>();
    expectTypeOf<ActivityRow>().toMatchTypeOf<{ id: string; componentKey: string }>();
    expectTypeOf<StudentProgressRow>().toMatchTypeOf<{ id: string; userId: string; phaseId: string }>();

    expectTypeOf<DatabaseTableName>().toMatchTypeOf<
      | 'organizations'
      | 'lessons'
      | 'lesson_versions'
      | 'phase_versions'
      | 'phase_sections'
      | 'profiles'
      | 'activities'
      | 'student_progress'
    >();

    expect(true).toBe(true);
  });
});
