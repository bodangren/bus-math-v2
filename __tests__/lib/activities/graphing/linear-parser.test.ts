import { describe, it, expect } from 'vitest';
import { parseLinear } from '@/lib/activities/graphing/linear-parser';

describe('parseLinear', () => {
  describe('standard linear expressions', () => {
    it('parses 2x + 3 as m=2, b=3', () => {
      expect(parseLinear('2x + 3')).toEqual({ m: 2, b: 3 });
    });

    it('parses -3x + 5 as m=-3, b=5', () => {
      expect(parseLinear('-3x + 5')).toEqual({ m: -3, b: 5 });
    });

    it('parses x - 4 as m=1, b=-4', () => {
      expect(parseLinear('x - 4')).toEqual({ m: 1, b: -4 });
    });

    it('parses -x + 2 as m=-1, b=2', () => {
      expect(parseLinear('-x + 2')).toEqual({ m: -1, b: 2 });
    });
  });

  describe('implicit coefficients', () => {
    it('parses x as m=1, b=0', () => {
      expect(parseLinear('x')).toEqual({ m: 1, b: 0 });
    });

    it('parses -x as m=-1, b=0', () => {
      expect(parseLinear('-x')).toEqual({ m: -1, b: 0 });
    });

    it('parses x + 5 as m=1, b=5', () => {
      expect(parseLinear('x + 5')).toEqual({ m: 1, b: 5 });
    });
  });

  describe('negative coefficients and signs with spaces', () => {
    it('parses 2x - 3 as m=2, b=-3', () => {
      expect(parseLinear('2x - 3')).toEqual({ m: 2, b: -3 });
    });

    it('parses -2x - 5 as m=-2, b=-5', () => {
      expect(parseLinear('-2x - 5')).toEqual({ m: -2, b: -5 });
    });

    it('parses x - 1 as m=1, b=-1', () => {
      expect(parseLinear('x - 1')).toEqual({ m: 1, b: -1 });
    });
  });

  describe('decimal coefficients', () => {
    it('parses 0.5x + 2 as m=0.5, b=2', () => {
      expect(parseLinear('0.5x + 2')).toEqual({ m: 0.5, b: 2 });
    });

    it('parses -1.5x - 3.2 as m=-1.5, b=-3.2', () => {
      expect(parseLinear('-1.5x - 3.2')).toEqual({ m: -1.5, b: -3.2 });
    });
  });

  describe('edge cases', () => {
    it('returns null for quadratic expressions', () => {
      expect(parseLinear('x^2 + 2x + 1')).toBeNull();
    });

    it('returns null for constants', () => {
      expect(parseLinear('5')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseLinear('')).toBeNull();
    });

    it('parses 0x + 1 as m=0, b=1', () => {
      expect(parseLinear('0x + 1')).toEqual({ m: 0, b: 1 });
    });
  });
});
