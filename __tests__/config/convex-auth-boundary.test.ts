import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function readFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function expectInternalExport(
  source: string,
  name: string,
  expectedKind: 'internalQuery' | 'internalMutation',
) {
  expect(source).toMatch(new RegExp(`export const ${name} = ${expectedKind}\\(`));
}

describe('Convex authorization boundary', () => {
  it('keeps identity-sensitive Convex functions internal-only', () => {
    const apiSource = readFile('convex/api.ts');
    const activitiesSource = readFile('convex/activities.ts');
    const studentSource = readFile('convex/student.ts');
    const teacherSource = readFile('convex/teacher.ts');

    expectInternalExport(apiSource, 'getProfile', 'internalQuery');
    expectInternalExport(apiSource, 'checkNextPhaseExists', 'internalQuery');
    expectInternalExport(apiSource, 'getPhaseContext', 'internalQuery');
    expectInternalExport(apiSource, 'getStudentProgressByPhase', 'internalQuery');
    expectInternalExport(apiSource, 'getStudentProgressByIdempotencyKey', 'internalQuery');
    expectInternalExport(apiSource, 'completePhaseMutation', 'internalMutation');
    expectInternalExport(apiSource, 'canAccessPhase', 'internalQuery');

    expectInternalExport(activitiesSource, 'getSpreadsheetDraft', 'internalQuery');
    expectInternalExport(activitiesSource, 'saveSpreadsheetDraft', 'internalMutation');
    expectInternalExport(activitiesSource, 'getSpreadsheetResponse', 'internalQuery');
    expectInternalExport(activitiesSource, 'getActivityForValidation', 'internalQuery');
    expectInternalExport(activitiesSource, 'submitSpreadsheet', 'internalMutation');
    expectInternalExport(activitiesSource, 'updateCompetency', 'internalMutation');
    expectInternalExport(activitiesSource, 'getProfileByUserId', 'internalQuery');
    expectInternalExport(activitiesSource, 'getProfileByUsername', 'internalQuery');
    expectInternalExport(activitiesSource, 'getProfileById', 'internalQuery');
    expectInternalExport(activitiesSource, 'getActivityById', 'internalQuery');
    expectInternalExport(activitiesSource, 'submitAssessment', 'internalMutation');

    expectInternalExport(studentSource, 'getDashboardData', 'internalQuery');
    expectInternalExport(studentSource, 'getLessonProgress', 'internalQuery');

    expectInternalExport(teacherSource, 'getTeacherDashboardData', 'internalQuery');
    expectInternalExport(teacherSource, 'getTeacherCourseOverviewData', 'internalQuery');
    expectInternalExport(teacherSource, 'getTeacherGradebookData', 'internalQuery');
    expectInternalExport(teacherSource, 'getTeacherStudentDetail', 'internalQuery');
    expectInternalExport(teacherSource, 'getSubmissionDetail', 'internalQuery');
    expectInternalExport(teacherSource, 'getProfileWithOrg', 'internalQuery');

    expect(apiSource).not.toMatch(/export const getActivity = query\(/);
    expect(apiSource).not.toMatch(/export const getProfileByAuthId = query\(/);
  });

  it('uses internal Convex helpers for sensitive server access', () => {
    const teacherDashboardPage = readFile('app/teacher/page.tsx');
    const teacherGradebookPage = readFile('app/teacher/gradebook/page.tsx');
    const teacherUnitPage = readFile('app/teacher/units/[unitNumber]/page.tsx');
    const teacherStudentPage = readFile('app/teacher/students/[studentId]/page.tsx');
    const studentDashboardPage = readFile('app/student/dashboard/page.tsx');
    const spreadsheetDraftRoute = readFile('app/api/activities/spreadsheet/[activityId]/draft/route.ts');
    const spreadsheetSubmitRoute = readFile('app/api/activities/spreadsheet/[activityId]/submit/route.ts');
    const assessmentRoute = readFile('app/api/progress/assessment/route.ts');
    const lessonProgressRoute = readFile('app/api/lessons/[lessonId]/progress/route.ts');
    const phaseCompleteRoute = readFile('app/api/phases/complete/route.ts');
    const teacherSubmissionRoute = readFile('app/api/teacher/submission-detail/route.ts');
    const authSessionRoute = readFile('app/api/auth/session/route.ts');
    const lessonPage = readFile('app/student/lesson/[lessonSlug]/page.tsx');
    const activityRoute = readFile('app/api/activities/[activityId]/route.ts');

    expect(teacherDashboardPage).toContain('fetchInternalQuery');
    expect(teacherDashboardPage).toContain('internal.teacher.getTeacherDashboardData');
    expect(teacherDashboardPage).toContain('internal.teacher.getTeacherCourseOverviewData');
    expect(teacherGradebookPage).toContain('fetchInternalQuery');
    expect(teacherGradebookPage).toContain('internal.teacher.getTeacherCourseOverviewData');
    expect(teacherUnitPage).toContain('fetchInternalQuery');
    expect(teacherUnitPage).toContain('internal.teacher.getTeacherGradebookData');
    expect(teacherStudentPage).toContain('fetchInternalQuery');
    expect(teacherStudentPage).toContain('internal.teacher.getTeacherStudentDetail');

    expect(studentDashboardPage).toContain('fetchInternalQuery');

    expect(spreadsheetDraftRoute).toContain('fetchInternalQuery');
    expect(spreadsheetDraftRoute).toContain('fetchInternalMutation');

    expect(spreadsheetSubmitRoute).toContain('fetchInternalQuery');
    expect(spreadsheetSubmitRoute).toContain('fetchInternalMutation');

    expect(assessmentRoute).toContain('fetchInternalQuery');
    expect(assessmentRoute).toContain('fetchInternalMutation');

    expect(lessonProgressRoute).toContain('fetchInternalQuery');
    expect(phaseCompleteRoute).toContain('fetchInternalQuery');
    expect(phaseCompleteRoute).toContain('fetchInternalMutation');
    expect(phaseCompleteRoute).toContain('requireStudentRequestClaims');
    expect(spreadsheetDraftRoute).toContain('requireStudentRequestClaims');
    expect(spreadsheetSubmitRoute).toContain('requireStudentRequestClaims');
    expect(assessmentRoute).toContain('requireStudentRequestClaims');

    expect(teacherSubmissionRoute).toContain('fetchInternalQuery');
    expect(authSessionRoute).toContain('fetchInternalQuery');
    expect(lessonPage).toContain('fetchInternalQuery');
    expect(activityRoute).toContain('internal.activities.getActivityById');
  });
});
