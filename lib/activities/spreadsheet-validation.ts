/**
 * Spreadsheet Validation Utilities
 *
 * Server-side validation and sanitization for spreadsheet activities.
 * This module provides secure formula validation, answer checking, and
 * value normalization for spreadsheet-based assessments.
 *
 * SECURITY NOTE: Never trust client-side validation. All submissions
 * must be validated on the server using these utilities.
 */

import type { SpreadsheetData } from '@/components/spreadsheet';

/**
 * Whitelist of allowed spreadsheet formula functions.
 * Only these functions can be used in student submissions.
 */
export const ALLOWED_FORMULA_FUNCTIONS = [
  'SUM',
  'AVERAGE',
  'COUNT',
  'IF',
  'MIN',
  'MAX',
  'ROUND',
  'ABS',
  'SQRT',
  'POWER',
] as const;

/**
 * Target cell definition for validation
 */
export interface TargetCell {
  cell: string; // A1 notation (e.g., "B2")
  expectedValue: string | number;
  expectedFormula?: string;
}

/**
 * Validation result for a single cell
 */
export interface CellFeedback {
  cell: string;
  isCorrect: boolean;
  message?: string;
  expectedValue?: string | number;
  actualValue?: string | number;
}

/**
 * Overall validation result
 */
export interface ValidationResult {
  isComplete: boolean;
  totalCells: number;
  correctCells: number;
  feedback: CellFeedback[];
  timestamp: string;
}

/**
 * Sanitization result
 */
export interface SanitizationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Sanitize a formula to prevent injection attacks.
 *
 * This function validates that formulas:
 * 1. Only contain whitelisted functions
 * 2. Don't contain dangerous patterns (eval, script, etc.)
 * 3. Don't attempt to execute code or access external resources
 *
 * @param formula - The formula string to sanitize
 * @returns Sanitization result with validity status
 *
 * @example
 * ```ts
 * sanitizeFormula('=SUM(A1:A10)') // { isValid: true }
 * sanitizeFormula('=HYPERLINK("javascript:alert(1)")') // { isValid: false, error: '...' }
 * ```
 */
export function sanitizeFormula(formula: string): SanitizationResult {
  // Check if this looks like a formula (starts with =, @, +, -, etc.)
  if (!formula.match(/^[=@+\-]/)) {
    return { isValid: true }; // Not a formula
  }

  // Check for dangerous patterns that could lead to code execution
  const dangerousPatterns = [
    /eval/i,
    /script/i,
    /javascript:/i,
    /document\./i,
    /window\./i,
    /<script/i,
    /onerror/i,
    /onclick/i,
    /onload/i,
    /href=/i,
    /src=/i,
    /cmd\|/i, // CSV injection: cmd|
    /file:\/\//i, // File protocol access
    /\bexec\s*\(/i, // EXEC function
    /\bdde\s*\(/i, // DDE function
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(formula)) {
      return {
        isValid: false,
        error: 'Formula contains potentially dangerous content',
      };
    }
  }

  // Validate formula functions against whitelist
  const functionPattern = /([A-Z]+)\(/g;
  const matches = formula.match(functionPattern);

  if (matches) {
    for (const match of matches) {
      const functionName = match.slice(0, -1);
      if (!ALLOWED_FORMULA_FUNCTIONS.includes(functionName as typeof ALLOWED_FORMULA_FUNCTIONS[number])) {
        return {
          isValid: false,
          error: `Formula function "${functionName}" is not allowed`,
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate entire spreadsheet data for security.
 *
 * Scans all cells in the spreadsheet to ensure they don't contain
 * malicious formulas or dangerous content.
 *
 * @param data - The spreadsheet data to validate
 * @returns Validation result
 */
export function validateSpreadsheetData(data: SpreadsheetData): SanitizationResult {
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const cell = data[row][col];
      if (!cell) continue;

      // Check cell value (formulas start with '=')
      if (typeof cell.value === 'string') {
        const sanitized = sanitizeFormula(cell.value);
        if (!sanitized.isValid) {
          return {
            isValid: false,
            error: `Cell at row ${row + 1}, col ${col + 1}: ${sanitized.error}`,
          };
        }
      }
    }
  }

  return { isValid: true };
}

/**
 * Convert A1 notation to zero-based coordinates.
 *
 * @param a1 - Cell reference in A1 notation (e.g., "B2")
 * @returns Row and column coordinates
 *
 * @example
 * ```ts
 * a1ToCoordinates('A1') // { row: 0, col: 0 }
 * a1ToCoordinates('B2') // { row: 1, col: 1 }
 * a1ToCoordinates('Z10') // { row: 9, col: 25 }
 * ```
 */
export function a1ToCoordinates(a1: string): { row: number; col: number } {
  const match = a1.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) {
    throw new Error(`Invalid A1 notation: ${a1}`);
  }

  const colString = match[1];
  const rowString = match[2];

  // Convert column letters to number (A=1, B=2, ..., Z=26, AA=27, etc.)
  let col = 0;
  for (let i = 0; i < colString.length; i++) {
    col = col * 26 + (colString.charCodeAt(i) - 64);
  }
  col -= 1; // Convert to 0-based

  const row = parseInt(rowString) - 1; // Convert to 0-based

  return { row, col };
}

/**
 * Get cell value from spreadsheet data safely.
 *
 * @param data - The spreadsheet data
 * @param cellRef - Cell reference in A1 notation
 * @returns Cell value or empty string if not found
 */
export function getCellValue(data: SpreadsheetData, cellRef: string): string | number {
  try {
    const { row, col } = a1ToCoordinates(cellRef);
    const cell = data[row]?.[col];
    return cell?.value ?? '';
  } catch {
    return '';
  }
}

/**
 * Normalize value for comparison.
 *
 * Converts values to lowercase trimmed strings for case-insensitive
 * comparison. Numbers are converted to strings.
 *
 * @param value - The value to normalize
 * @returns Normalized string
 *
 * @example
 * ```ts
 * normalizeValue('  Hello  ') // 'hello'
 * normalizeValue(123) // '123'
 * normalizeValue('ABC') // 'abc'
 * ```
 */
export function normalizeValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toString().toLowerCase().trim();
  }
  return value.toString().toLowerCase().trim();
}

/**
 * Validate student submission against target cells.
 *
 * Compares actual cell values with expected values and provides
 * detailed feedback for each cell.
 *
 * @param data - The spreadsheet data submitted by student
 * @param targetCells - Array of expected cell values
 * @returns Validation result with feedback
 */
export function validateSubmission(
  data: SpreadsheetData,
  targetCells: TargetCell[]
): ValidationResult {
  const feedback: CellFeedback[] = [];

  for (const target of targetCells) {
    const actualValue = getCellValue(data, target.cell);
    const normalizedActual = normalizeValue(actualValue);
    const normalizedExpected = normalizeValue(target.expectedValue);

    const isCorrect = normalizedActual === normalizedExpected;

    feedback.push({
      cell: target.cell,
      isCorrect,
      message: isCorrect
        ? undefined
        : `Expected "${target.expectedValue}", got "${actualValue}"`,
      expectedValue: target.expectedValue,
      actualValue,
    });
  }

  const correctCells = feedback.filter((fb) => fb.isCorrect).length;

  return {
    isComplete: correctCells === targetCells.length,
    totalCells: targetCells.length,
    correctCells,
    feedback,
    timestamp: new Date().toISOString(),
  };
}
