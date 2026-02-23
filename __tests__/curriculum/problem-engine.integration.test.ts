import { describe, expect, it } from 'vitest';

import { generateProblemInstance } from '@/lib/curriculum/problem-generator';
import { parseSpreadsheetProblemTemplate } from '@/lib/curriculum/problem-template';
import { validateCellValues } from '@/lib/curriculum/cell-validator';

describe('curriculum/problem-engine integration', () => {
  it('generates an instance and grades a matching spreadsheet submission', () => {
    const template = parseSpreadsheetProblemTemplate({
      parameters: {
        assets: { min: 1000, max: 2000, step: 100 },
        liabilities: { min: 300, max: 900, step: 100 },
      },
      answerFormula: 'assets - liabilities',
      questionTemplate: 'Compute equity with assets {{assets}} and liabilities {{liabilities}}.',
      cellExpectations: [
        { cellRef: 'B2', expectedFormula: 'assets', tolerance: 0 },
        { cellRef: 'B3', expectedFormula: 'liabilities', tolerance: 0 },
        { cellRef: 'B4', expectedFormula: 'assets - liabilities', tolerance: 1 },
      ],
    });

    const instance = generateProblemInstance(template, 123);
    const submission = {
      B2: instance.parameters.assets,
      B3: instance.parameters.liabilities,
      B4: instance.parameters.assets - instance.parameters.liabilities,
    };

    const expected = (instance.cellExpectations ?? []).map((expectation) => ({
      cellRef: expectation.cellRef,
      expectedValue: expectation.expectedValue,
      tolerance: expectation.tolerance,
    }));

    const graded = validateCellValues(expected, submission);

    expect(graded.passed).toBe(true);
    expect(graded.score).toBe(100);
  });
});
