import { practiceFamilyRegistry } from '../practice/engine/family-registry';

export function getProblemFamilyId(familyKey: string): string {
  return familyKey;
}

export function getFamilyForProblemFamilyId(problemFamilyId: string): string | null {
  const key = problemFamilyId as keyof typeof practiceFamilyRegistry;
  return key in practiceFamilyRegistry ? key : null;
}

export function getAllProblemFamilyIds(): string[] {
  return Object.keys(practiceFamilyRegistry);
}