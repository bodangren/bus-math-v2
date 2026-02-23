export type CellExpectation = {
  cellRef: string;
  expectedValue: string | number;
  tolerance: number;
};

export type PerCellValidationResult = {
  cellRef: string;
  passed: boolean;
  expectedValue: string | number;
  submittedValue: unknown;
  reason?: string;
};

export type CellValidationResult = {
  passed: boolean;
  score: number;
  perCell: PerCellValidationResult[];
};

function normalizeString(value: unknown): string {
  return String(value).trim().toLowerCase();
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function validateCellValues(
  expected: CellExpectation[],
  submitted: Record<string, unknown>,
): CellValidationResult {
  if (expected.length === 0) {
    return {
      passed: false,
      score: 0,
      perCell: [],
    };
  }

  const perCell = expected.map((expectation): PerCellValidationResult => {
    if (!(expectation.cellRef in submitted)) {
      return {
        cellRef: expectation.cellRef,
        passed: false,
        expectedValue: expectation.expectedValue,
        submittedValue: undefined,
        reason: `Missing submitted value for ${expectation.cellRef}`,
      };
    }

    const submittedValue = submitted[expectation.cellRef];

    if (typeof expectation.expectedValue === 'number') {
      const parsed = parseNumeric(submittedValue);
      if (parsed === null) {
        return {
          cellRef: expectation.cellRef,
          passed: false,
          expectedValue: expectation.expectedValue,
          submittedValue,
          reason: 'Submitted value is not numeric',
        };
      }

      const delta = Math.abs(parsed - expectation.expectedValue);
      const passed = delta <= expectation.tolerance;
      return {
        cellRef: expectation.cellRef,
        passed,
        expectedValue: expectation.expectedValue,
        submittedValue,
        ...(passed
          ? {}
          : {
              reason: `Value out of tolerance (delta ${delta}, tolerance ${expectation.tolerance})`,
            }),
      };
    }

    const passed = normalizeString(submittedValue) === normalizeString(expectation.expectedValue);
    return {
      cellRef: expectation.cellRef,
      passed,
      expectedValue: expectation.expectedValue,
      submittedValue,
      ...(passed
        ? {}
        : {
            reason: 'String values do not match',
          }),
    };
  });

  const passingCount = perCell.filter((result) => result.passed).length;
  const score = Math.round((passingCount / perCell.length) * 100);

  return {
    passed: passingCount === perCell.length,
    score,
    perCell,
  };
}
