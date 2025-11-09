import { describe, it, expect } from 'vitest';
import {
  validateFormula,
  validateCellReference,
  coordinatesToA1,
  a1ToCoordinates,
  createEmptySpreadsheet,
  setCellValue,
  getCellValue,
  getNumericValue,
  validateSpreadsheetData,
  exportToCSV,
  importFromCSV,
  generateColumnLabels,
  generateRowLabels,
  type SpreadsheetData
} from './SpreadsheetHelpers';

describe('SpreadsheetHelpers', () => {
  describe('validateFormula', () => {
    it('validates correct formulas', () => {
      expect(validateFormula('=SUM(A1:A10)')).toEqual({ isValid: true });
      expect(validateFormula('=AVERAGE(B1:B5)')).toEqual({ isValid: true });
      expect(validateFormula('=IF(A1>0,"Yes","No")')).toEqual({ isValid: true });
    });

    it('rejects formulas without =', () => {
      expect(validateFormula('SUM(A1:A10)')).toEqual({
        isValid: false,
        error: 'Formula must start with ='
      });
    });

    it('rejects unsupported functions', () => {
      expect(validateFormula('=VLOOKUP(A1,B1:C10,2,FALSE)')).toEqual({
        isValid: false,
        error: 'Function VLOOKUP is not allowed or supported'
      });
    });

    it('detects unbalanced parentheses', () => {
      expect(validateFormula('=SUM(A1:A10')).toEqual({
        isValid: false,
        error: 'Unbalanced parentheses'
      });
      expect(validateFormula('=SUM(A1:A10))')).toEqual({
        isValid: false,
        error: 'Unbalanced parentheses'
      });
    });
  });

  describe('validateCellReference', () => {
    it('validates single cell references', () => {
      expect(validateCellReference('A1')).toBe(true);
      expect(validateCellReference('Z999')).toBe(true);
      expect(validateCellReference('AA10')).toBe(true);
    });

    it('validates range references', () => {
      expect(validateCellReference('A1:B10')).toBe(true);
      expect(validateCellReference('AA1:ZZ999')).toBe(true);
    });

    it('rejects invalid references', () => {
      expect(validateCellReference('1A')).toBe(false);
      expect(validateCellReference('A')).toBe(false);
      expect(validateCellReference('1')).toBe(false);
      expect(validateCellReference('A1:')).toBe(false);
    });
  });

  describe('coordinatesToA1', () => {
    it('converts coordinates to A1 notation', () => {
      expect(coordinatesToA1(0, 0)).toBe('A1');
      expect(coordinatesToA1(9, 25)).toBe('Z10');
      expect(coordinatesToA1(0, 26)).toBe('AA1');
      expect(coordinatesToA1(52, 51)).toBe('AZ53');
    });
  });

  describe('a1ToCoordinates', () => {
    it('converts A1 notation to coordinates', () => {
      expect(a1ToCoordinates('A1')).toEqual({ row: 0, col: 0 });
      expect(a1ToCoordinates('Z10')).toEqual({ row: 9, col: 25 });
      expect(a1ToCoordinates('AA1')).toEqual({ row: 0, col: 26 });
      expect(a1ToCoordinates('AZ53')).toEqual({ row: 52, col: 51 });
    });

    it('throws error for invalid notation', () => {
      expect(() => a1ToCoordinates('1A')).toThrow('Invalid A1 notation');
      expect(() => a1ToCoordinates('A')).toThrow('Invalid A1 notation');
    });
  });

  describe('createEmptySpreadsheet', () => {
    it('creates empty spreadsheet with specified dimensions', () => {
      const data = createEmptySpreadsheet(3, 4);
      
      expect(data).toHaveLength(3);
      expect(data[0]).toHaveLength(4);
      expect(data[2]).toHaveLength(4);
      expect(data[0][0]).toEqual({ value: '' });
      expect(data[2][3]).toEqual({ value: '' });
    });
  });

  describe('setCellValue', () => {
    it('sets cell value at valid coordinates', () => {
      const data: SpreadsheetData = [
        [{ value: 'A1' }, { value: 'B1' }],
        [{ value: 'A2' }, { value: 'B2' }],
      ];
      
      const result = setCellValue(data, 1, 1, 'New Value', true);
      
      expect(result[1][1]).toEqual({ value: 'New Value', readOnly: true });
    });

    it('expands data structure if needed', () => {
      const data: SpreadsheetData = [
        [{ value: 'A1' }],
      ];
      
      const result = setCellValue(data, 2, 3, 'Extended');
      
      expect(result).toHaveLength(3);
      expect(result[2]).toHaveLength(4);
      expect(result[2][3]).toEqual({ value: 'Extended', readOnly: false });
    });
  });

  describe('getCellValue', () => {
    it('gets cell value at valid coordinates', () => {
      const data: SpreadsheetData = [
        [{ value: 'A1' }, { value: 'B1' }],
        [{ value: 'A2' }, { value: 'B2' }],
      ];
      
      expect(getCellValue(data, 0, 0)).toBe('A1');
      expect(getCellValue(data, 1, 1)).toBe('B2');
    });

    it('returns undefined for invalid coordinates', () => {
      const data: SpreadsheetData = [[{ value: 'A1' }]];
      
      expect(getCellValue(data, 1, 0)).toBeUndefined();
      expect(getCellValue(data, 0, 1)).toBeUndefined();
      expect(getCellValue(data, -1, 0)).toBeUndefined();
    });
  });

  describe('getNumericValue', () => {
    it('returns numeric values directly', () => {
      const data: SpreadsheetData = [[{ value: 42 }]];
      
      expect(getNumericValue(data, 0, 0)).toBe(42);
    });

    it('converts string numbers', () => {
      const data: SpreadsheetData = [[{ value: '42' }]];
      
      expect(getNumericValue(data, 0, 0)).toBe(42);
    });

    it('returns 0 for non-numeric strings', () => {
      const data: SpreadsheetData = [[{ value: 'hello' }]];
      
      expect(getNumericValue(data, 0, 0)).toBe(0);
    });

    it('returns 0 for undefined values', () => {
      const data: SpreadsheetData = [[{ value: undefined }]];
      
      expect(getNumericValue(data, 0, 0)).toBe(0);
    });
  });

  describe('validateSpreadsheetData', () => {
    it('validates correct data structure', () => {
      const data: SpreadsheetData = [
        [{ value: 'A1' }, { value: 'B1' }],
        [{ value: 'A2' }, { value: 'B2' }],
      ];
      
      const result = validateSpreadsheetData(data);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects invalid data types', () => {
      const result = validateSpreadsheetData('not an array');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data must be an array');
    });

    it('detects invalid cell structures', () => {
      const data = [
        ['not an object'],
        [{ value: 'valid' }],
      ] as unknown[][];
      
      const result = validateSpreadsheetData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cell at row 0, col 0 must be an object');
    });

    it('detects invalid cell values', () => {
      const data = [
        [{ value: { invalid: 'object' } }],
      ] as unknown[][];
      
      const result = validateSpreadsheetData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cell value at row 0, col 0 must be string or number');
    });

    it('validates formulas', () => {
      const data = [
        [{ value: '=INVALID()' }],
      ];
      
      const result = validateSpreadsheetData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('INVALID is not allowed');
    });
  });

  describe('exportToCSV', () => {
    it('exports simple data to CSV', () => {
      const data: SpreadsheetData = [
        [{ value: 'Name' }, { value: 'Age' }],
        [{ value: 'John' }, { value: 25 }],
        [{ value: 'Jane' }, { value: 30 }],
      ];
      
      const csv = exportToCSV(data);
      
      expect(csv).toBe('Name,Age\nJohn,25\nJane,30');
    });

    it('escapes commas and quotes', () => {
      const data: SpreadsheetData = [
        [{ value: 'Name, with comma' }, { value: 'Quote "test"' }],
      ];
      
      const csv = exportToCSV(data);
      
      expect(csv).toBe('"Name, with comma","Quote ""test"""');
    });
  });

  describe('importFromCSV', () => {
    it('imports simple CSV data', () => {
      const csv = 'Name,Age\nJohn,25\nJane,30';
      
      const data = importFromCSV(csv);
      
      expect(data).toHaveLength(3);
      expect(data[0][0]).toEqual({ value: 'Name' });
      expect(data[1][1]).toEqual({ value: 25 });
      expect(data[2][1]).toEqual({ value: 30 });
    });

    it('handles quoted values', () => {
      const csv = '"Name, with comma","Quote ""test"""';
      
      const data = importFromCSV(csv);
      
      expect(data[0][0]).toEqual({ value: 'Name, with comma' });
      expect(data[0][1]).toEqual({ value: 'Quote "test"' });
    });

    it('converts numbers', () => {
      const csv = 'Value\n42\n3.14';
      
      const data = importFromCSV(csv);
      
      expect(data[1][0]).toEqual({ value: 42 });
      expect(data[2][0]).toEqual({ value: 3.14 });
    });
  });

  describe('generateColumnLabels', () => {
    it('generates basic column labels', () => {
      const labels = generateColumnLabels(5);
      
      expect(labels).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('generates double-letter labels', () => {
      const labels = generateColumnLabels(28);
      
      expect(labels[0]).toBe('A');
      expect(labels[25]).toBe('Z');
      expect(labels[26]).toBe('AA');
      expect(labels[27]).toBe('AB');
    });
  });

  describe('generateRowLabels', () => {
    it('generates row labels', () => {
      const labels = generateRowLabels(5);
      
      expect(labels).toEqual(['1', '2', '3', '4', '5']);
    });
  });
});