/**
 * Course overview DB fetch layer — Level 1 teacher view.
 * Server-only. Delegates assembly to course-overview.ts (pure).
 */

import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  lessons,
  lessonVersions,
  lessonStandards,
  profiles,
  studentCompetency,
} from '@/lib/db/schema';
import {
  assembleCourseOverviewRows,
  type CourseOverviewRow,
  type UnitColumn,
} from './course-overview';

export async function fetchCourseOverviewData(
  orgId: string,
): Promise<{ rows: CourseOverviewRow[]; units: UnitColumn[] }> {
  const [students, rawLessons] = await Promise.all([
    db
      .select({ id: profiles.id, username: profiles.username, displayName: profiles.displayName })
      .from(profiles)
      .where(and(eq(profiles.organizationId, orgId), eq(profiles.role, 'student')))
      .orderBy(asc(profiles.displayName)),
    db
      .select({ id: lessons.id, unitNumber: lessons.unitNumber })
      .from(lessons)
      .orderBy(asc(lessons.unitNumber)),
  ]);

  if (students.length === 0 || rawLessons.length === 0) {
    const unitNumbers = [...new Set(rawLessons.map(l => l.unitNumber))].sort((a, b) => a - b);
    return { rows: [], units: unitNumbers.map(n => ({ unitNumber: n })) };
  }

  const lessonIds = rawLessons.map(l => l.id);
  const rawLessonVersions = await db
    .select({ id: lessonVersions.id, lessonId: lessonVersions.lessonId })
    .from(lessonVersions)
    .where(and(inArray(lessonVersions.lessonId, lessonIds), eq(lessonVersions.status, 'published')));

  if (rawLessonVersions.length === 0) {
    return assembleCourseOverviewRows(students, rawLessons, [], [], []);
  }

  const lessonVersionIds = rawLessonVersions.map(lv => lv.id);
  const rawPrimaryStandards = await db
    .select({
      lessonVersionId: lessonStandards.lessonVersionId,
      standardId: lessonStandards.standardId,
      isPrimary: lessonStandards.isPrimary,
    })
    .from(lessonStandards)
    .where(and(
      inArray(lessonStandards.lessonVersionId, lessonVersionIds),
      eq(lessonStandards.isPrimary, true),
    ));

  if (rawPrimaryStandards.length === 0) {
    return assembleCourseOverviewRows(students, rawLessons, rawLessonVersions, [], []);
  }

  const standardIds  = rawPrimaryStandards.map(ls => ls.standardId);
  const studentIds   = students.map(s => s.id);

  const competencyRows = await db
    .select({
      studentId: studentCompetency.studentId,
      standardId: studentCompetency.standardId,
      masteryLevel: studentCompetency.masteryLevel,
    })
    .from(studentCompetency)
    .where(and(
      inArray(studentCompetency.studentId, studentIds),
      inArray(studentCompetency.standardId, standardIds),
    ));

  return assembleCourseOverviewRows(
    students, rawLessons, rawLessonVersions, rawPrimaryStandards, competencyRows,
  );
}
