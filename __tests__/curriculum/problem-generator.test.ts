import { describe, expect, it } from 'vitest';

import { generateProblemInstance } from '@/lib/curriculum/problem-generator';
import { parseProblemTemplate } from '@/lib/curriculum/problem-template';

const template = parseProblemTemplate({
  parameters: {
    cash: { min: 1000, max: 99000, step: 500 },
    liabilities: { min: 500, max: 2500, step: 500 },
  },
  answerFormula: 'cash - liabilities',
  questionTemplate: 'TechStart has cash {{cash}} and liabilities {{liabilities}}. Find equity.',
});

describe('curriculum/problem-generator', () => {
  it('is deterministic for a provided seed', () => {
    const a = generateProblemInstance(template, 42);
    const b = generateProblemInstance(template, 42);

    expect(a).toEqual(b);
  });

  it('produces varied results without a seed', () => {
    const a = generateProblemInstance(template, 1);
    const b = generateProblemInstance(template, 2);

    expect(a.parameters).not.toEqual(b.parameters);
  });

  it('keeps parameter values aligned to min/max/step', () => {
    const result = generateProblemInstance(template, 99);

    for (const [name, value] of Object.entries(result.parameters)) {
      const def = template.parameters[name];
      expect(value).toBeGreaterThanOrEqual(def.min);
      expect(value).toBeLessThanOrEqual(def.max);
      expect((value - def.min) % def.step).toBe(0);
    }
  });

  it('replaces placeholders and computes the correct answer', () => {
    const result = generateProblemInstance(template, 7);

    expect(result.questionText).not.toMatch(/{{\w+}}/);
    expect(result.correctAnswer).toBe(result.parameters.cash - result.parameters.liabilities);
  });
});
