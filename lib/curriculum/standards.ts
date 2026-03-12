export const COMPETENCY_STANDARD_CODE_PATTERN = /^[A-Z]+-\d+(?:\.\d+)*$/;

export function isCompetencyStandardCode(value: string): boolean {
  return COMPETENCY_STANDARD_CODE_PATTERN.test(value.trim());
}
