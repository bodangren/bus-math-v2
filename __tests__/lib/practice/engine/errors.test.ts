import { describe, expect, it } from 'vitest';

import {
  buildTrialBalanceErrorScenario,
  generateTrialBalanceErrorScenarios,
  trialBalanceErrorArchetypes,
} from '@/lib/practice/engine/errors';

describe('trial balance error pattern library', () => {
  it('builds internally consistent scenarios for every archetype', () => {
    const baseSeed = 2026;

    trialBalanceErrorArchetypes.forEach((archetype, index) => {
      const scenario = buildTrialBalanceErrorScenario(baseSeed + index, {
        archetypeId: archetype.id,
      });

      expect(scenario.archetypeId).toBe(archetype.id);
      expect(scenario.correctEntry.amount).toBeGreaterThan(0);
      expect(scenario.correctEntry.debitAccount.label).toBeTruthy();
      expect(scenario.correctEntry.creditAccount.label).toBeTruthy();
      expect(scenario.balance.difference).toBeGreaterThanOrEqual(0);

      if (archetype.id === 'both-sides-wrong') {
        expect(scenario.balance.balanced).toBe(true);
        expect(scenario.balance.difference).toBe(0);
        expect(scenario.balance.largerColumn).toBe('neither');
      } else {
        expect(scenario.balance.balanced).toBe(false);
        expect(scenario.balance.difference).toBeGreaterThan(0);
        expect(['debit', 'credit']).toContain(scenario.balance.largerColumn);
      }

      if (archetype.id === 'transposition') {
        expect(scenario.balance.difference % 9).toBe(0);
      }

      if (archetype.id === 'slide') {
        expect(scenario.erroneousAmount).toBeLessThan(scenario.correctEntry.amount);
      }
    });
  });

  it('includes the error side in transposition and slide narratives', () => {
    const transposition = buildTrialBalanceErrorScenario(2026, {
      archetypeId: 'transposition',
    });
    const slide = buildTrialBalanceErrorScenario(2027, {
      archetypeId: 'slide',
    });

    expect(transposition.narrative).toMatch(/\b(debit|credit)\b/i);
    expect(slide.narrative).toMatch(/\b(debit|credit)\b/i);
  });

  it('generates deterministic scenario batches within the requested bounds', () => {
    const first = generateTrialBalanceErrorScenarios(17, {
      scenarioCount: 5,
      amountRange: { min: 120, max: 540 },
      includeBalancedScenarios: true,
      errorTypeWeights: {
        'wrong-side': 2,
        'wrong-amount': 2,
        'double-post': 1,
        'both-sides-wrong': 1,
        omission: 2,
        transposition: 2,
        slide: 2,
      },
    });
    const second = generateTrialBalanceErrorScenarios(17, {
      scenarioCount: 5,
      amountRange: { min: 120, max: 540 },
      includeBalancedScenarios: true,
      errorTypeWeights: {
        'wrong-side': 2,
        'wrong-amount': 2,
        'double-post': 1,
        'both-sides-wrong': 1,
        omission: 2,
        transposition: 2,
        slide: 2,
      },
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(5);
    expect(first.every((scenario) => scenario.correctEntry.amount >= 120 && scenario.correctEntry.amount <= 540)).toBe(
      true,
    );
    expect(first.some((scenario) => scenario.balance.balanced)).toBe(true);
  });
});
