import { describe, expect, it } from 'vitest';

import { adjustmentEffectsFamily } from '@/lib/practice/engine/families/adjustment-effects';
import { cycleDecisionsFamily } from '@/lib/practice/engine/families/cycle-decisions';
import { classificationFamily } from '@/lib/practice/engine/families/classification';
import { journalEntryFamily } from '@/lib/practice/engine/families/journal-entry';
import { merchandisingEntriesFamily } from '@/lib/practice/engine/families/merchandising-entries';
import { normalBalanceFamily } from '@/lib/practice/engine/families/normal-balance';
import { postingBalancesFamily } from '@/lib/practice/engine/families/posting-balances';
import { statementConstructionFamily } from '@/lib/practice/engine/families/statement-construction';
import { statementCompletionFamily } from '@/lib/practice/engine/families/statement-completion';
import { statementSubtotalsFamily } from '@/lib/practice/engine/families/statement-subtotals';
import { transactionEffectsFamily } from '@/lib/practice/engine/families/transaction-effects';
import { transactionMatrixFamily } from '@/lib/practice/engine/families/transaction-matrix';
import { getPracticeFamily, practiceFamilyRegistry } from '@/lib/practice/engine/family-registry';

describe('practice family registry', () => {
  it('registers the classification family by familyKey', () => {
    expect(practiceFamilyRegistry.classification).toBe(classificationFamily);
    expect(getPracticeFamily('classification')).toBe(classificationFamily);
  });

  it('registers the journal-entry family by familyKey', () => {
    expect(practiceFamilyRegistry['journal-entry']).toBe(journalEntryFamily);
    expect(getPracticeFamily('journal-entry')).toBe(journalEntryFamily);
  });

  it('registers the cycle-decisions family by familyKey', () => {
    expect(practiceFamilyRegistry['cycle-decisions']).toBe(cycleDecisionsFamily);
    expect(getPracticeFamily('cycle-decisions')).toBe(cycleDecisionsFamily);
  });

  it('registers the merchandising-entries family by familyKey', () => {
    expect(practiceFamilyRegistry['merchandising-entries']).toBe(merchandisingEntriesFamily);
    expect(getPracticeFamily('merchandising-entries')).toBe(merchandisingEntriesFamily);
  });

  it('registers the adjustment-effects family by familyKey', () => {
    expect(practiceFamilyRegistry['adjustment-effects']).toBe(adjustmentEffectsFamily);
    expect(getPracticeFamily('adjustment-effects')).toBe(adjustmentEffectsFamily);
  });

  it('registers the normal-balance family by familyKey', () => {
    expect(practiceFamilyRegistry['normal-balance']).toBe(normalBalanceFamily);
    expect(getPracticeFamily('normal-balance')).toBe(normalBalanceFamily);
  });

  it('registers the posting-balances family by familyKey', () => {
    expect(practiceFamilyRegistry['posting-balances']).toBe(postingBalancesFamily);
    expect(getPracticeFamily('posting-balances')).toBe(postingBalancesFamily);
  });

  it('registers the statement-construction family by familyKey', () => {
    expect(practiceFamilyRegistry['statement-construction']).toBe(statementConstructionFamily);
    expect(getPracticeFamily('statement-construction')).toBe(statementConstructionFamily);
  });

  it('registers the statement-completion family by familyKey', () => {
    expect(practiceFamilyRegistry['statement-completion']).toBe(statementCompletionFamily);
    expect(getPracticeFamily('statement-completion')).toBe(statementCompletionFamily);
  });

  it('registers the statement-subtotals family by familyKey', () => {
    expect(practiceFamilyRegistry['statement-subtotals']).toBe(statementSubtotalsFamily);
    expect(getPracticeFamily('statement-subtotals')).toBe(statementSubtotalsFamily);
  });

  it('registers the transaction-effects family by familyKey', () => {
    expect(practiceFamilyRegistry['transaction-effects']).toBe(transactionEffectsFamily);
    expect(getPracticeFamily('transaction-effects')).toBe(transactionEffectsFamily);
  });

  it('registers the transaction-matrix family by familyKey', () => {
    expect(practiceFamilyRegistry['transaction-matrix']).toBe(transactionMatrixFamily);
    expect(getPracticeFamily('transaction-matrix')).toBe(transactionMatrixFamily);
  });
});
