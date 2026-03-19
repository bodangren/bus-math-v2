import { classificationFamily } from './families/classification';
import { referenceAccountingEquationFamily } from './reference-family';
import type { ProblemFamily } from './types';

export const practiceFamilyRegistry = {
  'accounting-equation': referenceAccountingEquationFamily,
  classification: classificationFamily,
} as const satisfies Record<string, ProblemFamily<unknown, unknown, unknown>>;

export type PracticeFamilyRegistryKey = keyof typeof practiceFamilyRegistry;

export function getPracticeFamily(familyKey: string): ProblemFamily<unknown, unknown, unknown> | null {
  return practiceFamilyRegistry[familyKey as PracticeFamilyRegistryKey] ?? null;
}
