const knownWorkbooks = new Set([
  // Unit 1
  'unit_01_lesson_04_student.xlsx',
  'unit_01_lesson_04_teacher.xlsx',
  'unit_01_lesson_05_student.xlsx',
  'unit_01_lesson_05_teacher.xlsx',
  'unit_01_lesson_06_student.xlsx',
  'unit_01_lesson_06_teacher.xlsx',
  'unit_01_lesson_07_student.xlsx',
  'unit_01_lesson_07_teacher.xlsx',
  // Unit 2
  'unit_02_lesson_04_student.xlsx',
  'unit_02_lesson_04_teacher.xlsx',
  'unit_02_lesson_05_student.xlsx',
  'unit_02_lesson_05_teacher.xlsx',
  'unit_02_lesson_06_student.xlsx',
  'unit_02_lesson_06_teacher.xlsx',
  'unit_02_lesson_07_student.xlsx',
  'unit_02_lesson_07_teacher.xlsx',
  // Unit 3
  'unit_03_lesson_04_student.xlsx',
  'unit_03_lesson_04_teacher.xlsx',
  'unit_03_lesson_05_student.xlsx',
  'unit_03_lesson_05_teacher.xlsx',
  'unit_03_lesson_06_student.xlsx',
  'unit_03_lesson_06_teacher.xlsx',
  'unit_03_lesson_07_student.xlsx',
  'unit_03_lesson_07_teacher.xlsx',
  // Unit 4
  'unit_04_lesson_04_student.xlsx',
  'unit_04_lesson_04_teacher.xlsx',
  'unit_04_lesson_05_student.xlsx',
  'unit_04_lesson_05_teacher.xlsx',
  'unit_04_lesson_06_student.xlsx',
  'unit_04_lesson_06_teacher.xlsx',
  'unit_04_lesson_07_student.xlsx',
  'unit_04_lesson_07_teacher.xlsx',
  // Unit 5
  'unit_05_lesson_04_student.xlsx',
  'unit_05_lesson_04_teacher.xlsx',
  'unit_05_lesson_05_student.xlsx',
  'unit_05_lesson_05_teacher.xlsx',
  'unit_05_lesson_06_student.xlsx',
  'unit_05_lesson_06_teacher.xlsx',
  'unit_05_lesson_07_student.xlsx',
  'unit_05_lesson_07_teacher.xlsx',
  // Unit 6
  'unit_06_lesson_04_student.xlsx',
  'unit_06_lesson_04_teacher.xlsx',
  'unit_06_lesson_05_student.xlsx',
  'unit_06_lesson_05_teacher.xlsx',
  'unit_06_lesson_06_student.xlsx',
  'unit_06_lesson_06_teacher.xlsx',
  'unit_06_lesson_07_student.xlsx',
  'unit_06_lesson_07_teacher.xlsx',
  // Unit 7
  'unit_07_lesson_04_student.xlsx',
  'unit_07_lesson_04_teacher.xlsx',
  'unit_07_lesson_05_student.xlsx',
  'unit_07_lesson_05_teacher.xlsx',
  'unit_07_lesson_06_student.xlsx',
  'unit_07_lesson_06_teacher.xlsx',
  'unit_07_lesson_07_student.xlsx',
  'unit_07_lesson_07_teacher.xlsx',
  // Unit 8
  'unit_08_lesson_04_student.xlsx',
  'unit_08_lesson_04_teacher.xlsx',
  'unit_08_lesson_05_student.xlsx',
  'unit_08_lesson_05_teacher.xlsx',
  'unit_08_lesson_06_student.xlsx',
  'unit_08_lesson_06_teacher.xlsx',
  'unit_08_lesson_07_student.xlsx',
  'unit_08_lesson_07_teacher.xlsx'
]);

function workbookFileName(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  const unitStr = String(unitNumber).padStart(2, '0');
  const lessonStr = String(lessonNumber).padStart(2, '0');
  return `unit_${unitStr}_lesson_${lessonStr}_${type}.xlsx`;
}

export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  return `/workbooks/${workbookFileName(unitNumber, lessonNumber, type)}`;
}

export function hasStudentWorkbook(unitNumber: number, lessonNumber: number): boolean {
  return knownWorkbooks.has(workbookFileName(unitNumber, lessonNumber, 'student'));
}

export function hasTeacherWorkbook(unitNumber: number, lessonNumber: number): boolean {
  return knownWorkbooks.has(workbookFileName(unitNumber, lessonNumber, 'teacher'));
}

export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return hasStudentWorkbook(unitNumber, lessonNumber) || hasTeacherWorkbook(unitNumber, lessonNumber);
}
