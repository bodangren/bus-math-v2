import { describe, expect, it } from 'vitest';

import { parseProblemTemplate, parseSpreadsheetProblemTemplate } from '@/lib/curriculum/problem-template';

describe('curriculum/problem-template schema', () => {
  it('accepts a valid base problem template', () => {
    const parsed = parseProblemTemplate({
      parameters: {
        cash: { min: 1000, max: 5000, step: 500 },
        liabilities: { min: 200, max: 2000, step: 100 },
      },
      answerFormula: 'cash - liabilities',
      questionTemplate: 'If cash is {{cash}} and liabilities are {{liabilities}}, find equity.',
      tolerance: 1,
    });

    expect(parsed.answerFormula).toBe('cash - liabilities');
  });

  it('rejects an invalid template with inverted parameter bounds', () => {
    expect(() =>
      parseProblemTemplate({
        parameters: {
          cash: { min: 5000, max: 1000, step: 100 },
        },
        answerFormula: 'cash',
        questionTemplate: 'Value: {{cash}}',
      }),
    ).toThrow();
  });

  it('accepts spreadsheet template with cell expectations', () => {
    const parsed = parseSpreadsheetProblemTemplate({
      parameters: {
        assets: { min: 1000, max: 9000, step: 100 },
        liabilities: { min: 500, max: 5000, step: 100 },
      },
      answerFormula: 'assets - liabilities',
      questionTemplate: 'Compute equity for assets {{assets}} and liabilities {{liabilities}}.',
      cellExpectations: [
        { cellRef: 'B2', expectedFormula: 'assets', tolerance: 0 },
        { cellRef: 'B3', expectedFormula: 'liabilities', tolerance: 0 },
        { cellRef: 'B4', expectedFormula: 'assets - liabilities', tolerance: 1 },
      ],
    });

    expect(parsed.cellExpectations).toHaveLength(3);
  });
});
