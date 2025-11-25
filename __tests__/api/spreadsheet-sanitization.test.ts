import { describe, expect, it } from 'vitest';
import { sanitizeFormula } from '@/lib/activities/spreadsheet-validation';

/**
 * Formula Sanitization Tests
 *
 * These tests verify that the spreadsheet evaluator properly sanitizes
 * formulas to prevent formula injection attacks.
 *
 * The sanitization logic is implemented in:
 * /lib/activities/spreadsheet-validation.ts
 */

describe('Formula Sanitization - Safe Formulas', () => {
  it('allows simple arithmetic formulas', () => {
    const result = sanitizeFormula('=A1+B1');
    expect(result.isValid).toBe(true);
  });

  it('allows SUM function', () => {
    const result = sanitizeFormula('=SUM(A1:A10)');
    expect(result.isValid).toBe(true);
  });

  it('allows AVERAGE function', () => {
    const result = sanitizeFormula('=AVERAGE(B1:B5)');
    expect(result.isValid).toBe(true);
  });

  it('allows COUNT function', () => {
    const result = sanitizeFormula('=COUNT(C1:C20)');
    expect(result.isValid).toBe(true);
  });

  it('allows IF function', () => {
    const result = sanitizeFormula('=IF(A1>100, "High", "Low")');
    expect(result.isValid).toBe(true);
  });

  it('allows MIN and MAX functions', () => {
    expect(sanitizeFormula('=MIN(A1:A10)').isValid).toBe(true);
    expect(sanitizeFormula('=MAX(B1:B10)').isValid).toBe(true);
  });

  it('allows ROUND function', () => {
    const result = sanitizeFormula('=ROUND(A1, 2)');
    expect(result.isValid).toBe(true);
  });

  it('allows complex nested formulas with allowed functions', () => {
    const result = sanitizeFormula('=SUM(A1:A5) + AVERAGE(B1:B5) * COUNT(C1:C5)');
    expect(result.isValid).toBe(true);
  });

  it('allows non-formula values', () => {
    expect(sanitizeFormula('100').isValid).toBe(true);
    expect(sanitizeFormula('Revenue').isValid).toBe(true);
    expect(sanitizeFormula('').isValid).toBe(true);
  });
});

describe('Formula Sanitization - Dangerous Patterns', () => {
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

  it('rejects formulas with onerror handlers', () => {
    const result = sanitizeFormula('=onerror=alert(1)');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('dangerous content');
  });

  it('rejects formulas with onclick handlers', () => {
    const result = sanitizeFormula('=onclick=alert(1)');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('dangerous content');
  });
});

describe('Formula Sanitization - Disallowed Functions', () => {
  it('rejects EXEC function', () => {
    const result = sanitizeFormula('=EXEC("cmd")');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects HYPERLINK function', () => {
    const result = sanitizeFormula('=HYPERLINK("http://evil.com", "Click")');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects IMPORTXML function', () => {
    const result = sanitizeFormula('=IMPORTXML("http://evil.com", "//data")');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects IMPORTDATA function', () => {
    const result = sanitizeFormula('=IMPORTDATA("http://evil.com/data")');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('rejects custom function names', () => {
    const result = sanitizeFormula('=CUSTOMFUNC(A1)');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not allowed');
  });
});

describe('Formula Sanitization - Edge Cases', () => {
  it('handles case-insensitive dangerous patterns', () => {
    expect(sanitizeFormula('=EVAL("test")').isValid).toBe(false);
    expect(sanitizeFormula('=eval("test")').isValid).toBe(false);
    expect(sanitizeFormula('=EvaL("test")').isValid).toBe(false);
  });

  it('allows formulas without functions', () => {
    expect(sanitizeFormula('=A1*2+B1').isValid).toBe(true);
    expect(sanitizeFormula('=(A1+B1)/2').isValid).toBe(true);
  });

  it('handles multiple functions in one formula', () => {
    const result = sanitizeFormula('=SUM(A1:A5) / COUNT(A1:A5)');
    expect(result.isValid).toBe(true);
  });

  it('rejects if even one function is disallowed', () => {
    const result = sanitizeFormula('=SUM(A1:A5) + EXEC("ls")');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Formula Sanitization - Real-World Attack Vectors', () => {
  it('prevents CSV injection via formula', () => {
    const attacks = [
      '=1+1+cmd|"/c calc"!A1',
      '=1+1+EXEC("cmd /c calc")',
      '=cmd|"/c calc"!A1',
      '@SUM(1+1)*cmd|"/c calc"!A1',
    ];

    for (const attack of attacks) {
      const result = sanitizeFormula(attack);
      expect(result.isValid).toBe(false);
    }
  });

  it('prevents DDE injection attempts', () => {
    const result = sanitizeFormula('=DDE("cmd","/c calc")');
    expect(result.isValid).toBe(false);
  });

  it('prevents attempts to reference external files', () => {
    const result = sanitizeFormula('=HYPERLINK("file:///etc/passwd", "test")');
    expect(result.isValid).toBe(false);
  });
});
