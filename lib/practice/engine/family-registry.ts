import { adjustmentEffectsFamily } from './families/adjustment-effects';
import { cvpAnalysisFamily } from './families/cvp-analysis';
import { adjustingCalculationsFamily } from './families/adjusting-calculations';
import { cycleDecisionsFamily } from './families/cycle-decisions';
import { classificationFamily } from './families/classification';
import { depreciationPresentationFamily } from './families/depreciation-presentation';
import { depreciationSchedulesFamily } from './families/depreciation-schedules';
import { financialAnalysisFamily } from './families/financial-analysis';
import { interestSchedulesFamily } from './families/interest-schedules';
import { journalEntryFamily } from './families/journal-entry';
import { merchandisingEntriesFamily } from './families/merchandising-entries';
import { normalBalanceFamily } from './families/normal-balance';
import { postingBalancesFamily } from './families/posting-balances';
import { statementConstructionFamily } from './families/statement-construction';
import { statementSubtotalsFamily } from './families/statement-subtotals';
import { transactionEffectsFamily } from './families/transaction-effects';
import { transactionMatrixFamily } from './families/transaction-matrix';
import { trialBalanceErrorFamily } from './families/trial-balance-errors';
import { referenceAccountingEquationFamily } from './reference-family';
import type { ProblemFamily } from './types';

export const practiceFamilyRegistry = {
  'accounting-equation': referenceAccountingEquationFamily,
  'adjustment-effects': adjustmentEffectsFamily,
  'adjusting-calculations': adjustingCalculationsFamily,
  classification: classificationFamily,
  'cvp-analysis': cvpAnalysisFamily,
  'cycle-decisions': cycleDecisionsFamily,
  'depreciation-presentation': depreciationPresentationFamily,
  'depreciation-schedules': depreciationSchedulesFamily,
  'financial-analysis': financialAnalysisFamily,
  'interest-schedules': interestSchedulesFamily,
  'journal-entry': journalEntryFamily,
  'merchandising-entries': merchandisingEntriesFamily,
  'normal-balance': normalBalanceFamily,
  'posting-balances': postingBalancesFamily,
  'statement-construction': statementConstructionFamily,
  'statement-subtotals': statementSubtotalsFamily,
  'transaction-effects': transactionEffectsFamily,
  'transaction-matrix': transactionMatrixFamily,
  'trial-balance-errors': trialBalanceErrorFamily,
} as const satisfies Record<string, ProblemFamily<unknown, unknown, unknown>>;

export type PracticeFamilyRegistryKey = keyof typeof practiceFamilyRegistry;

export function getPracticeFamily(familyKey: string): ProblemFamily<unknown, unknown, unknown> | null {
  return practiceFamilyRegistry[familyKey as PracticeFamilyRegistryKey] ?? null;
}
