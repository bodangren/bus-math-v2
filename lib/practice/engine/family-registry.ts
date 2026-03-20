import { adjustmentEffectsFamily } from './families/adjustment-effects';
import { classificationFamily } from './families/classification';
import { journalEntryFamily } from './families/journal-entry';
import { normalBalanceFamily } from './families/normal-balance';
import { transactionEffectsFamily } from './families/transaction-effects';
import { transactionMatrixFamily } from './families/transaction-matrix';
import { referenceAccountingEquationFamily } from './reference-family';
import type { ProblemFamily } from './types';

export const practiceFamilyRegistry = {
  'accounting-equation': referenceAccountingEquationFamily,
  'adjustment-effects': adjustmentEffectsFamily,
  classification: classificationFamily,
  'journal-entry': journalEntryFamily,
  'normal-balance': normalBalanceFamily,
  'transaction-effects': transactionEffectsFamily,
  'transaction-matrix': transactionMatrixFamily,
} as const satisfies Record<string, ProblemFamily<unknown, unknown, unknown>>;

export type PracticeFamilyRegistryKey = keyof typeof practiceFamilyRegistry;

export function getPracticeFamily(familyKey: string): ProblemFamily<unknown, unknown, unknown> | null {
  return practiceFamilyRegistry[familyKey as PracticeFamilyRegistryKey] ?? null;
}
