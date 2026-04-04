import { describe, expect, it } from 'vitest';

import { practiceSubmissionEnvelopeSchema } from '@/lib/practice/contract';
import {
  buildJournalEntryReviewFeedback,
  journalEntryFamily,
  journalEntryScenarioCatalog,
  type JournalEntryDefinition,
  type JournalEntryResponse,
} from '@/lib/practice/engine/families/journal-entry';

describe('journal entry family', () => {
  it('covers the journal-entry scenario catalog and stays deterministic across seeds', () => {
    const expectedKinds = [
      'service-revenue',
      'owner-contribution',
      'asset-purchase',
      'liability-settlement',
      'accrual-adjustment',
      'depreciation-adjustment',
      'closing-entry',
      'correcting-entry',
      'reversing-entry',
      'merchandising-sale',
      'merchandising-purchase',
      'return-allowance',
      'discount-settlement',
    ] as const;

    expect(journalEntryScenarioCatalog.map((scenario) => scenario.kind)).toEqual(expectedKinds);

    for (const [index, kind] of expectedKinds.entries()) {
      const seed = index + 1;
      const definition: JournalEntryDefinition = journalEntryFamily.generate(seed, {
        scenarioKey: kind,
        mode: 'guided_practice',
      });
      const repeat = journalEntryFamily.generate(seed, {
        scenarioKey: kind,
        mode: 'guided_practice',
      });

      expect(definition).toEqual(repeat);
      expect(definition.familyKey).toBe('journal-entry');
      expect(definition.scenario.kind).toBe(kind);
      expect(definition.journalLines.length).toBeGreaterThan(0);
      expect(definition.parts).toHaveLength(definition.journalLines.length);
    }
  });

  it('scores equivalent ordering, flags mistakes, and round-trips the practice envelope', () => {
    const definition: JournalEntryDefinition = journalEntryFamily.generate(2026, {
      scenarioKey: 'correcting-entry',
      mode: 'assessment',
    });

    const solution = journalEntryFamily.solve(definition);
    const studentResponse: JournalEntryResponse = [solution[1], solution[0], ...solution.slice(2)];

    const gradeResult = journalEntryFamily.grade(definition, studentResponse);
    const reviewed = buildJournalEntryReviewFeedback(definition, studentResponse, gradeResult);
    const envelope = journalEntryFamily.toEnvelope(definition, studentResponse, gradeResult);

    expect(gradeResult.score).toBe(gradeResult.maxScore);
    expect(reviewed['line-1']).toMatchObject({
      status: 'partial',
      message: expect.stringContaining('Accepted equivalent'),
    });
    expect(reviewed['line-2']).toMatchObject({
      status: 'partial',
      message: expect.stringContaining('Accepted equivalent'),
    });

    const parsed = practiceSubmissionEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error('Expected journal-entry envelope to parse');
    }

    expect(parsed.data.contractVersion).toBe('practice.v1');
    expect(parsed.data.answers).toEqual(
      Object.fromEntries(studentResponse.map((line, index) => [`line-${index + 1}`, line])),
    );
    expect(parsed.data.artifact).toMatchObject({
      kind: 'journal-entry-recording',
      family: 'journal-entry',
      scenario: expect.objectContaining({
        kind: 'correcting-entry',
      }),
    });
  });

  it('emits omission and wrong-account-type tags for incorrect lines', () => {
    const definition: JournalEntryDefinition = journalEntryFamily.generate(200, {
      scenarioKey: 'service-revenue',
      mode: 'assessment',
    });

    const solution = journalEntryFamily.solve(definition);
    // Submit with wrong account on first line (replaces correct account)
    const wrongLine = { ...solution[0], accountId: 'rent-expense' };
    const studentResponse: JournalEntryResponse = [wrongLine, ...solution.slice(1)];

    const gradeResult = journalEntryFamily.grade(definition, studentResponse);
    const partResult = gradeResult.parts[0];

    expect(partResult.isCorrect).toBe(false);
    expect(partResult.misconceptionTags).toContain('wrong-account-type');
  });

  it('emits incomplete-entry tag when student submits a blank line', () => {
    const definition: JournalEntryDefinition = journalEntryFamily.generate(201, {
      scenarioKey: 'service-revenue',
      mode: 'assessment',
    });

    const solution = journalEntryFamily.solve(definition);
    const studentResponse: JournalEntryResponse = [...solution];
    studentResponse[0] = { id: '', date: '', accountId: '', debit: 0, credit: 0, memo: '' };

    const gradeResult = journalEntryFamily.grade(definition, studentResponse);
    const partResult = gradeResult.parts[0];

    expect(partResult.isCorrect).toBe(false);
    expect(partResult.misconceptionTags).toContain('incomplete-entry');
  });

  it('emits debit-credit-reversal tag when student swaps debit and credit on correct account', () => {
    const definition: JournalEntryDefinition = journalEntryFamily.generate(300, {
      scenarioKey: 'service-revenue',
      mode: 'assessment',
    });

    const solution = journalEntryFamily.solve(definition);
    const expectedLine = solution[0];
    const reversedLine = {
      ...expectedLine,
      debit: expectedLine.credit,
      credit: expectedLine.debit,
    };
    const studentResponse: JournalEntryResponse = [reversedLine, ...solution.slice(1)];

    const gradeResult = journalEntryFamily.grade(definition, studentResponse);
    const partResult = gradeResult.parts[0];

    expect(partResult.isCorrect).toBe(false);
    expect(partResult.misconceptionTags).toContain('debit-credit-reversal');
  });
});
