export const CAPSTONE_UNIT_NUMBER = 9;

export function isCapstoneUnitNumber(unitNumber: number) {
  return unitNumber === CAPSTONE_UNIT_NUMBER;
}

export function formatCurriculumSegmentLabel(unitNumber: number) {
  return isCapstoneUnitNumber(unitNumber) ? 'Capstone' : `Unit ${unitNumber}`;
}

export function formatCurriculumSegmentTitle(unitNumber: number, title: string) {
  return isCapstoneUnitNumber(unitNumber) ? title : `${formatCurriculumSegmentLabel(unitNumber)}: ${title}`;
}

export function formatCurriculumSegmentLessonLabel(unitNumber: number, lessonNumber: number) {
  const formattedLessonNumber = lessonNumber.toString().padStart(2, '0');
  return `${formatCurriculumSegmentLabel(unitNumber)} • Lesson ${formattedLessonNumber}`;
}
