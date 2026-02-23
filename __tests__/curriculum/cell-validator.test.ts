import { describe, expect, it } from 'vitest';

import { validateCellValues } from '@/lib/curriculum/cell-validator';

describe('curriculum/cell-validator', () => {
  it('passes exact matches', () => {
    const result = validateCellValues(
      [
        { cellRef: 'B2', expectedValue: 1200, tolerance: 0 },
        { cellRef: 'B3', expectedValue: 'Asset', tolerance: 0 },
      ],
      {
        B2: 1200,
        B3: 'Asset',
      },
    );

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('passes numeric values within tolerance', () => {
    const result = validateCellValues(
      [{ cellRef: 'C5', expectedValue: 500, tolerance: 1 }],
      { C5: 500.75 },
    );

    expect(result.passed).toBe(true);
  });

  it('fails when value is outside tolerance', () => {
    const result = validateCellValues(
      [{ cellRef: 'C5', expectedValue: 500, tolerance: 1 }],
      { C5: 503 },
    );

    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
  });

  it('fails missing cells', () => {
    const result = validateCellValues(
      [{ cellRef: 'D8', expectedValue: 700, tolerance: 0 }],
      {},
    );

    expect(result.passed).toBe(false);
    expect(result.perCell[0]?.reason).toContain('Missing');
  });

  it('handles strings as exact match and numeric cells with tolerance', () => {
    const result = validateCellValues(
      [
        { cellRef: 'A1', expectedValue: 'Liability', tolerance: 0 },
        { cellRef: 'A2', expectedValue: 1000, tolerance: 5 },
      ],
      {
        A1: 'Liability',
        A2: 1004,
      },
    );

    expect(result.passed).toBe(true);
    expect(result.perCell).toHaveLength(2);
  });
});
