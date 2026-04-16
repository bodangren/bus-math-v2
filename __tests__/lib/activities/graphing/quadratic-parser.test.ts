import { parseQuadratic } from '@/lib/activities/graphing/quadratic-parser';

describe('parseQuadratic', () => {
  describe('standard quadratic expressions', () => {
    it('parses x^2 + 2x + 1 as a=1, b=2, c=1', () => {
      expect(parseQuadratic('x^2 + 2x + 1')).toEqual({ a: 1, b: 2, c: 1 });
    });

    it('parses 2x^2 - 3x + 4 as a=2, b=-3, c=4', () => {
      expect(parseQuadratic('2x^2 - 3x + 4')).toEqual({ a: 2, b: -3, c: 4 });
    });

    it('parses -x^2 + 5x - 2 as a=-1, b=5, c=-2', () => {
      expect(parseQuadratic('-x^2 + 5x - 2')).toEqual({ a: -1, b: 5, c: -2 });
    });

    it('parses 0.5x^2 + 1.5x - 0.25 as a=0.5, b=1.5, c=-0.25', () => {
      expect(parseQuadratic('0.5x^2 + 1.5x - 0.25')).toEqual({ a: 0.5, b: 1.5, c: -0.25 });
    });
  });

  describe('implicit coefficients', () => {
    it('parses x^2 as a=1, b=0, c=0', () => {
      expect(parseQuadratic('x^2')).toEqual({ a: 1, b: 0, c: 0 });
    });

    it('parses x^2 + x as a=1, b=1, c=0', () => {
      expect(parseQuadratic('x^2 + x')).toEqual({ a: 1, b: 1, c: 0 });
    });

    it('parses x^2 - 3 as a=1, b=0, c=-3', () => {
      expect(parseQuadratic('x^2 - 3')).toEqual({ a: 1, b: 0, c: -3 });
    });

    it('parses 2x^2 + 4x as a=2, b=4, c=0', () => {
      expect(parseQuadratic('2x^2 + 4x')).toEqual({ a: 2, b: 4, c: 0 });
    });

    it('parses -3x^2 - 2 as a=-3, b=0, c=-2', () => {
      expect(parseQuadratic('-3x^2 - 2')).toEqual({ a: -3, b: 0, c: -2 });
    });
  });

  describe('negative coefficients and signs with spaces', () => {
    it('parses x^2 - x as a=1, b=-1, c=0', () => {
      expect(parseQuadratic('x^2 - x')).toEqual({ a: 1, b: -1, c: 0 });
    });

    it('parses -2x^2 + 3x - 1 as a=-2, b=3, c=-1', () => {
      expect(parseQuadratic('-2x^2 + 3x - 1')).toEqual({ a: -2, b: 3, c: -1 });
    });

    it('handles extra spaces: x^2  +  2x  +  1 as a=1, b=2, c=1', () => {
      expect(parseQuadratic('x^2  +  2x  +  1')).toEqual({ a: 1, b: 2, c: 1 });
    });

    it('handles minus with spaces: x^2 - 2x - 1 as a=1, b=-2, c=-1', () => {
      expect(parseQuadratic('x^2 - 2x - 1')).toEqual({ a: 1, b: -2, c: -1 });
    });
  });

  describe('non-quadratic expressions', () => {
    it('returns null for linear expression x + 2', () => {
      expect(parseQuadratic('x + 2')).toBeNull();
    });

    it('returns null for linear expression 3x - 5', () => {
      expect(parseQuadratic('3x - 5')).toBeNull();
    });

    it('returns null for constant 5', () => {
      expect(parseQuadratic('5')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseQuadratic('')).toBeNull();
    });

    it('returns null for x^3 (cubic)', () => {
      expect(parseQuadratic('x^3')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('parses x^2+0x+0 as a=1, b=0, c=0', () => {
      expect(parseQuadratic('x^2+0x+0')).toEqual({ a: 1, b: 0, c: 0 });
    });

    it('parses -0.5x^2 as a=-0.5, b=0, c=0', () => {
      expect(parseQuadratic('-0.5x^2')).toEqual({ a: -0.5, b: 0, c: 0 });
    });

    it('parses 1.0x^2 + 0.0x + 0.0 as a=1, b=0, c=0', () => {
      expect(parseQuadratic('1.0x^2 + 0.0x + 0.0')).toEqual({ a: 1, b: 0, c: 0 });
    });
  });
});
