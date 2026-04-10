export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  const unitStr = String(unitNumber).padStart(2, '0');
  const lessonStr = String(lessonNumber).padStart(2, '0');
  return `/workbooks/unit_${unitStr}_lesson_${lessonStr}_${type}.xlsx`;
}

export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  const unitStr = String(unitNumber).padStart(2, '0');
  const lessonStr = String(lessonNumber).padStart(2, '0');
  const studentFileName = `unit_${unitStr}_lesson_${lessonStr}_student.xlsx`;
  const teacherFileName = `unit_${unitStr}_lesson_${lessonStr}_teacher.xlsx`;
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
    'unit_04_lesson_07_teacher.xlsx'
  ]);
  return knownWorkbooks.has(studentFileName) || knownWorkbooks.has(teacherFileName);
}
