import workbookManifest from '@/lib/workbooks-manifest.json';

function workbookFileName(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  const unitStr = String(unitNumber).padStart(2, '0');
  const lessonStr = String(lessonNumber).padStart(2, '0');
  return `unit_${unitStr}_lesson_${lessonStr}_${type}.xlsx`;
}

export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return `/workbooks/${workbookFileName(unitNumber, lessonNumber, type)}`;
}

export function hasStudentWorkbook(unitNumber: number, lessonNumber: number): boolean {
  const key = `${unitNumber}-${lessonNumber}`;
  const entry = workbookManifest.byUnitAndLesson[key];
  return entry?.student ?? false;
}

export function hasTeacherWorkbook(unitNumber: number, lessonNumber: number): boolean {
  const key = `${unitNumber}-${lessonNumber}`;
  const entry = workbookManifest.byUnitAndLesson[key];
  return entry?.teacher ?? false;
}

export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return hasStudentWorkbook(unitNumber, lessonNumber) || hasTeacherWorkbook(unitNumber, lessonNumber);
}

export function hasCapstoneStudentWorkbook(): boolean {
  return workbookManifest.byCapstone.student;
}

export function hasCapstoneTeacherWorkbook(): boolean {
  return workbookManifest.byCapstone.teacher;
}

export function getCapstoneWorkbookPath(type: 'student' | 'teacher'): string {
  if (type === 'teacher') {
    return '/workbooks/capstone_investor_ready_workbook_teacher.xlsx';
  }
  return '/workbooks/capstone_investor_ready_workbook.xlsx';
}