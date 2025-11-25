import { describe, expect, it } from 'vitest';
import {
  sanitizeFormula,
  validateSpreadsheetData,
  a1ToCoordinates,
  getCellValue,
  normalizeValue,
  validateSubmission,
  type TargetCell,
} from '@/lib/activities/spreadsheet-validation';
import type { SpreadsheetData } from '@/components/spreadsheet';

describe('sanitizeFormula', () => {
  describe('safe formulas', () => {
    it('allows simple arithmetic formulas', () => {
      expect(sanitizeFormula('=A1+B1').isValid).toBe(true);
      expect(sanitizeFormula('=A1-B1').isValid).toBe(true);
      expect(sanitizeFormula('=A1*B1').isValid).toBe(true);
      expect(sanitizeFormula('=A1/B1').isValid).toBe(true);
    });

    it('allows SUM function', () => {
      expect(sanitizeFormula('=SUM(A1:A10)').isValid).toBe(true);
      expect(sanitizeFormula('=SUM(A1,B1,C1)').isValid).toBe(true);
    });

    it('allows AVERAGE function', () => {
      expect(sanitizeFormula('=AVERAGE(B1:B5)').isValid).toBe(true);
    });

    it('allows COUNT function', () => {
      expect(sanitizeFormula('=COUNT(C1:C20)').isValid).toBe(true);
    });

    it('allows IF function', () => {
      expect(sanitizeFormula('=IF(A1>100, "High", "Low")').isValid).toBe(true);
    });

    it('allows MIN and MAX functions', () => {
      expect(sanitizeFormula('=MIN(A1:A10)').isValid).toBe(true);
      expect(sanitizeFormula('=MAX(B1:B10)').isValid).toBe(true);
    });

    it('allows ROUND function', () => {
      expect(sanitizeFormula('=ROUND(A1, 2)').isValid).toBe(true);
    });

    it('allows ABS, SQRT, and POWER functions', () => {
      expect(sanitizeFormula('=ABS(A1)').isValid).toBe(true);
      expect(sanitizeFormula('=SQRT(B1)').isValid).toBe(true);
      expect(sanitizeFormula('=POWER(C1, 2)').isValid).toBe(true);
    });

    it('allows complex nested formulas', () => {
      expect(sanitizeFormula('=SUM(A1:A5) + AVERAGE(B1:B5)').isValid).toBe(true);
      expect(sanitizeFormula('=IF(SUM(A1:A10)>100, MAX(B1:B10), MIN(B1:B10))').isValid).toBe(true);
    });

    it('allows non-formula values', () => {
      expect(sanitizeFormula('100').isValid).toBe(true);
      expect(sanitizeFormula('Revenue').isValid).toBe(true);
      expect(sanitizeFormula('').isValid).toBe(true);
      expect(sanitizeFormula('Total Sales').isValid).toBe(true);
    });
  });

  describe('dangerous patterns', () => {
    it('rejects formulas with eval', () => {
      const result = sanitizeFormula('=eval("malicious code")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous content');
    });

    it('rejects formulas with script keyword', () => {
      const result = sanitizeFormula('=script:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous content');
    });

    it('rejects formulas with javascript: protocol', () => {
      const result = sanitizeFormula('=javascript:alert("XSS")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous content');
    });

    it('rejects formulas with document reference', () => {
      const result = sanitizeFormula('=document.cookie');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous content');
    });

    it('rejects formulas with window reference', () => {
      const result = sanitizeFormula('=window.location');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous content');
    });

    it('rejects formulas with <script tags', () => {
      const result = sanitizeFormula('=<script>alert(1)</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('dangerous content');
    });

    it('rejects formulas with event handlers', () => {
      expect(sanitizeFormula('=onerror=alert(1)').isValid).toBe(false);
      expect(sanitizeFormula('=onclick=alert(1)').isValid).toBe(false);
      expect(sanitizeFormula('=onload=alert(1)').isValid).toBe(false);
    });

    it('rejects formulas with HTML attributes', () => {
      expect(sanitizeFormula('=href=malicious').isValid).toBe(false);
      expect(sanitizeFormula('=src=evil.com').isValid).toBe(false);
    });
  });

  describe('disallowed functions', () => {
    it('rejects HYPERLINK function', () => {
      const result = sanitizeFormula('=HYPERLINK("http://evil.com", "Click")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects IMPORTXML function', () => {
      const result = sanitizeFormula('=IMPORTXML("http://evil.com", "//data")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('IMPORTXML');
    });

    it('rejects IMPORTDATA function', () => {
      const result = sanitizeFormula('=IMPORTDATA("http://evil.com/data")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('IMPORTDATA');
    });

    it('rejects custom function names', () => {
      const result = sanitizeFormula('=CUSTOMFUNC(A1)');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects if even one function is disallowed', () => {
      const result = sanitizeFormula('=SUM(A1:A5) + EXEC("ls")');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('handles case-insensitive dangerous patterns', () => {
      expect(sanitizeFormula('=EVAL("test")').isValid).toBe(false);
      expect(sanitizeFormula('=eval("test")').isValid).toBe(false);
      expect(sanitizeFormula('=EvaL("test")').isValid).toBe(false);
    });

    it('handles multiple functions in one formula', () => {
      expect(sanitizeFormula('=SUM(A1:A5) / COUNT(A1:A5)').isValid).toBe(true);
    });

    it('handles formulas with parentheses but no functions', () => {
      expect(sanitizeFormula('=(A1+B1)/2').isValid).toBe(true);
    });
  });
});

describe('validateSpreadsheetData', () => {
  it('validates clean spreadsheet data', () => {
    const data: SpreadsheetData = [
      [{ value: 'Name' }, { value: 'Amount' }],
      [{ value: 'Sales' }, { value: 100 }],
      [{ value: 'Expenses' }, { value: 50 }],
      [{ value: 'Profit' }, { value: '=B2-B3' }],
    ];

    const result = validateSpreadsheetData(data);
    expect(result.isValid).toBe(true);
  });

  it('validates spreadsheet with allowed formulas', () => {
    const data: SpreadsheetData = [
      [{ value: '=SUM(A1:A10)' }, { value: '=AVERAGE(B1:B10)' }],
      [{ value: '=COUNT(C1:C10)' }, { value: '=MAX(D1:D10)' }],
    ];

    const result = validateSpreadsheetData(data);
    expect(result.isValid).toBe(true);
  });

  it('rejects spreadsheet with dangerous formulas', () => {
    const data: SpreadsheetData = [
      [{ value: 'Safe' }, { value: 100 }],
      [{ value: '=eval("dangerous")' }, { value: 200 }],
    ];

    const result = validateSpreadsheetData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects spreadsheet with disallowed functions', () => {
    const data: SpreadsheetData = [
      [{ value: '=HYPERLINK("http://evil.com", "Click")' }],
    ];

    const result = validateSpreadsheetData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('handles null cells gracefully', () => {
    const data: SpreadsheetData = [
      [{ value: 'Test' }, null, { value: '=SUM(A1:A5)' }],
    ];

    const result = validateSpreadsheetData(data);
    expect(result.isValid).toBe(true);
  });

  it('includes row and column information in error messages', () => {
    const data: SpreadsheetData = [
      [{ value: 'OK' }],
      [{ value: '=DANGEROUS()' }],
    ];

    const result = validateSpreadsheetData(data);
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/row \d+, col \d+/);
  });
});

describe('a1ToCoordinates', () => {
  it('converts single letter columns', () => {
    expect(a1ToCoordinates('A1')).toEqual({ row: 0, col: 0 });
    expect(a1ToCoordinates('B2')).toEqual({ row: 1, col: 1 });
    expect(a1ToCoordinates('Z10')).toEqual({ row: 9, col: 25 });
  });

  it('converts double letter columns', () => {
    expect(a1ToCoordinates('AA1')).toEqual({ row: 0, col: 26 });
    expect(a1ToCoordinates('AB5')).toEqual({ row: 4, col: 27 });
    expect(a1ToCoordinates('AZ10')).toEqual({ row: 9, col: 51 });
  });

  it('converts triple letter columns', () => {
    expect(a1ToCoordinates('AAA1')).toEqual({ row: 0, col: 702 });
  });

  it('throws error for invalid notation', () => {
    expect(() => a1ToCoordinates('1A')).toThrow('Invalid A1 notation');
    expect(() => a1ToCoordinates('A')).toThrow('Invalid A1 notation');
    expect(() => a1ToCoordinates('123')).toThrow('Invalid A1 notation');
    expect(() => a1ToCoordinates('')).toThrow('Invalid A1 notation');
  });
});

describe('getCellValue', () => {
  const testData: SpreadsheetData = [
    [{ value: 'A1' }, { value: 'B1' }, { value: 'C1' }],
    [{ value: 100 }, { value: 200 }, { value: 300 }],
    [{ value: '=SUM(A2:C2)' }, null, { value: '' }],
  ];

  it('retrieves cell values correctly', () => {
    expect(getCellValue(testData, 'A1')).toBe('A1');
    expect(getCellValue(testData, 'B2')).toBe(200);
    expect(getCellValue(testData, 'A3')).toBe('=SUM(A2:C2)');
  });

  it('returns empty string for null cells', () => {
    expect(getCellValue(testData, 'B3')).toBe('');
  });

  it('returns empty string for out of bounds cells', () => {
    expect(getCellValue(testData, 'Z99')).toBe('');
  });

  it('handles invalid cell references', () => {
    expect(getCellValue(testData, 'invalid')).toBe('');
  });
});

describe('normalizeValue', () => {
  it('normalizes string values', () => {
    expect(normalizeValue('  Hello  ')).toBe('hello');
    expect(normalizeValue('UPPERCASE')).toBe('uppercase');
    expect(normalizeValue('MixedCase')).toBe('mixedcase');
  });

  it('normalizes number values', () => {
    expect(normalizeValue(123)).toBe('123');
    expect(normalizeValue(0)).toBe('0');
    expect(normalizeValue(-456)).toBe('-456');
    expect(normalizeValue(3.14)).toBe('3.14');
  });

  it('trims whitespace', () => {
    expect(normalizeValue('   spaces   ')).toBe('spaces');
    expect(normalizeValue('\t\ttabs\t\t')).toBe('tabs');
  });

  it('handles empty strings', () => {
    expect(normalizeValue('')).toBe('');
    expect(normalizeValue('   ')).toBe('');
  });
});

describe('validateSubmission', () => {
  const testData: SpreadsheetData = [
    [{ value: 'Item' }, { value: 'Price' }, { value: 'Qty' }, { value: 'Total' }],
    [{ value: 'Widget' }, { value: 10 }, { value: 5 }, { value: 50 }],
    [{ value: 'Gadget' }, { value: 20 }, { value: 3 }, { value: 60 }],
    [{ value: 'Total' }, { value: '' }, { value: '' }, { value: 110 }],
  ];

  it('validates correct answers', () => {
    const targets: TargetCell[] = [
      { cell: 'D2', expectedValue: 50 },
      { cell: 'D3', expectedValue: 60 },
      { cell: 'D4', expectedValue: 110 },
    ];

    const result = validateSubmission(testData, targets);
    expect(result.isComplete).toBe(true);
    expect(result.correctCells).toBe(3);
    expect(result.totalCells).toBe(3);
    expect(result.feedback).toHaveLength(3);
    expect(result.feedback.every((fb) => fb.isCorrect)).toBe(true);
  });

  it('identifies incorrect answers', () => {
    const targets: TargetCell[] = [
      { cell: 'D2', expectedValue: 50 }, // Correct
      { cell: 'D3', expectedValue: 70 }, // Incorrect (actual is 60)
      { cell: 'D4', expectedValue: 110 }, // Correct
    ];

    const result = validateSubmission(testData, targets);
    expect(result.isComplete).toBe(false);
    expect(result.correctCells).toBe(2);
    expect(result.totalCells).toBe(3);
    expect(result.feedback[1].isCorrect).toBe(false);
    expect(result.feedback[1].message).toContain('Expected "70", got "60"');
  });

  it('performs case-insensitive comparison', () => {
    const data: SpreadsheetData = [
      [{ value: 'HELLO' }],
      [{ value: 'world' }],
    ];

    const targets: TargetCell[] = [
      { cell: 'A1', expectedValue: 'hello' },
      { cell: 'A2', expectedValue: 'WORLD' },
    ];

    const result = validateSubmission(data, targets);
    expect(result.isComplete).toBe(true);
    expect(result.correctCells).toBe(2);
  });

  it('trims whitespace in comparison', () => {
    const data: SpreadsheetData = [
      [{ value: '  test  ' }],
    ];

    const targets: TargetCell[] = [
      { cell: 'A1', expectedValue: 'test' },
    ];

    const result = validateSubmission(data, targets);
    expect(result.isComplete).toBe(true);
  });

  it('provides detailed feedback for each cell', () => {
    const targets: TargetCell[] = [
      { cell: 'D2', expectedValue: 50 },
      { cell: 'D3', expectedValue: 70 },
    ];

    const result = validateSubmission(testData, targets);
    expect(result.feedback).toHaveLength(2);
    expect(result.feedback[0]).toMatchObject({
      cell: 'D2',
      isCorrect: true,
      expectedValue: 50,
      actualValue: 50,
    });
    expect(result.feedback[1]).toMatchObject({
      cell: 'D3',
      isCorrect: false,
      expectedValue: 70,
      actualValue: 60,
    });
  });

  it('includes timestamp in result', () => {
    const targets: TargetCell[] = [{ cell: 'D2', expectedValue: 50 }];
    const result = validateSubmission(testData, targets);

    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('handles empty target cells list', () => {
    const result = validateSubmission(testData, []);
    expect(result.isComplete).toBe(true);
    expect(result.correctCells).toBe(0);
    expect(result.totalCells).toBe(0);
    expect(result.feedback).toHaveLength(0);
  });

  it('handles missing cells gracefully', () => {
    const targets: TargetCell[] = [
      { cell: 'Z99', expectedValue: 'missing' },
    ];

    const result = validateSubmission(testData, targets);
    expect(result.isComplete).toBe(false);
    expect(result.feedback[0].isCorrect).toBe(false);
    expect(result.feedback[0].actualValue).toBe('');
  });
});
