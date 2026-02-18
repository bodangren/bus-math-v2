/**
 * Gradebook DB fetch layer.
 *
 * Queries the database for all data needed to render the Level 2 GradebookGrid,
 * then delegates assembly to the pure assembleGradebookRows function in
 * gradebook.ts. This file is intentionally impure (DB access) and is only
 * imported from server components / API routes.
 */

import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  lessons,
  lessonVersions,
  phaseVersions,
  lessonStandards,
  profiles,
  studentProgress,
  studentCompetency,
} from '@/lib/db/schema';
import {
  assembleGradebookRows,
  type GradebookLesson,
  type GradebookRow,
} from './gradebook';

// ---------------------------------------------------------------------------
// fetchGradebookData
// ---------------------------------------------------------------------------

/**
 * Fetches all data required for the Level 2 GradebookGrid for a given unit,
 * scoped to the teacher's organization.
 *
 * Executes queries in three parallel batches to minimise round-trips:
 *   1. Lessons for the unit
 *   2. Lesson versions + phase versions + primary standards + org students
 *   3. Student progress + student competency
 */
export async function fetchGradebookData(
  unitNumber: number,
  orgId: string,
): Promise<{ rows: GradebookRow[]; lessons: GradebookLesson[] }> {
  // Batch 1 — lessons for this unit
  const rawLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      orderIndex: lessons.orderIndex,
      unitNumber: lessons.unitNumber,
    })
    .from(lessons)
    .where(eq(lessons.unitNumber, unitNumber))
    .orderBy(asc(lessons.orderIndex));

  if (rawLessons.length === 0) {
    return { rows: [], lessons: [] };
  }

  const lessonIds = rawLessons.map(l => l.id);

  // Batch 2 — published lesson versions for those lessons
  const rawLessonVersions = await db
    .select({ id: lessonVersions.id, lessonId: lessonVersions.lessonId })
    .from(lessonVersions)
    .where(
      and(
        inArray(lessonVersions.lessonId, lessonIds),
        eq(lessonVersions.status, 'published'),
      ),
    );

  const lessonVersionIds = rawLessonVersions.map(lv => lv.id);

  if (lessonVersionIds.length === 0) {
    const gradebookLessons: GradebookLesson[] = rawLessons.map(l => ({
      lessonId: l.id,
      lessonTitle: l.title,
      orderIndex: l.orderIndex,
      isUnitTest: l.orderIndex === 11,
    }));
    return { rows: [], lessons: gradebookLessons };
  }

  // Batch 3 — phase versions, primary standards, and org students (parallel)
  const [rawPhaseVersions, rawPrimaryStandards, students] = await Promise.all([
    db
      .select({
        id: phaseVersions.id,
        lessonVersionId: phaseVersions.lessonVersionId,
        phaseNumber: phaseVersions.phaseNumber,
      })
      .from(phaseVersions)
      .where(inArray(phaseVersions.lessonVersionId, lessonVersionIds)),

    db
      .select({
        lessonVersionId: lessonStandards.lessonVersionId,
        standardId: lessonStandards.standardId,
        isPrimary: lessonStandards.isPrimary,
      })
      .from(lessonStandards)
      .where(
        and(
          inArray(lessonStandards.lessonVersionId, lessonVersionIds),
          eq(lessonStandards.isPrimary, true),
        ),
      ),

    db
      .select({
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.organizationId, orgId),
          eq(profiles.role, 'student'),
        ),
      )
      .orderBy(asc(profiles.displayName)),
  ]);

  if (students.length === 0) {
    return assembleGradebookRows([], rawLessons, rawLessonVersions, rawPhaseVersions, rawPrimaryStandards, [], []);
  }

  const studentIds = students.map(s => s.id);
  const phaseIds = rawPhaseVersions.map(pv => pv.id);
  const standardIds = rawPrimaryStandards.map(ls => ls.standardId);

  // Batch 4 — student progress and competency (parallel)
  const [progressRows, competencyRows] = await Promise.all([
    phaseIds.length > 0
      ? db
          .select({
            userId: studentProgress.userId,
            phaseId: studentProgress.phaseId,
            status: studentProgress.status,
          })
          .from(studentProgress)
          .where(
            and(
              inArray(studentProgress.userId, studentIds),
              inArray(studentProgress.phaseId, phaseIds),
            ),
          )
      : Promise.resolve([]),

    standardIds.length > 0
      ? db
          .select({
            studentId: studentCompetency.studentId,
            standardId: studentCompetency.standardId,
            masteryLevel: studentCompetency.masteryLevel,
          })
          .from(studentCompetency)
          .where(
            and(
              inArray(studentCompetency.studentId, studentIds),
              inArray(studentCompetency.standardId, standardIds),
            ),
          )
      : Promise.resolve([]),
  ]);

  return assembleGradebookRows(
    students,
    rawLessons,
    rawLessonVersions,
    rawPhaseVersions,
    rawPrimaryStandards,
    progressRows,
    competencyRows,
  );
}
