import { evaluateFunction } from '@/lib/activities/graphing/canvas-utils';

describe('evaluateFunction', () => {
  describe('quadratic functions', () => {
    it('evaluates x^2 + 2x + 1 at x=2', () => {
      expect(evaluateFunction('x^2 + 2x + 1', 2)).toBe(9);
    });

    it('evaluates 2x^2 - 3x + 4 at x=1', () => {
      expect(evaluateFunction('2x^2 - 3x + 4', 1)).toBe(3);
    });

    it('evaluates -x^2 + 5x - 2 at x=0', () => {
      expect(evaluateFunction('-x^2 + 5x - 2', 0)).toBe(-2);
    });

    it('evaluates x^2 at x=3', () => {
      expect(evaluateFunction('x^2', 3)).toBe(9);
    });

    it('evaluates x^2 - 4 at x=2', () => {
      expect(evaluateFunction('x^2 - 4', 2)).toBe(0);
    });

    it('evaluates 0.5x^2 + x - 1 at x=4', () => {
      expect(evaluateFunction('0.5x^2 + x - 1', 4)).toBe(11);
    });
  });

  describe('linear functions', () => {
    it('evaluates 2x + 3 at x=2', () => {
      expect(evaluateFunction('2x + 3', 2)).toBe(7);
    });

    it('evaluates x - 1 at x=5', () => {
      expect(evaluateFunction('x - 1', 5)).toBe(4);
    });

    it('evaluates -3x + 2 at x=1', () => {
      expect(evaluateFunction('-3x + 2', 1)).toBe(-1);
    });

    it('evaluates x at x=7', () => {
      expect(evaluateFunction('x', 7)).toBe(7);
    });

    it('evaluates 0.5x at x=4', () => {
      expect(evaluateFunction('0.5x', 4)).toBe(2);
    });
  });

  describe('constant functions', () => {
    it('evaluates 5 at x=any', () => {
      expect(evaluateFunction('5', 10)).toBe(5);
    });

    it('evaluates -3 at x=any', () => {
      expect(evaluateFunction('-3', 5)).toBe(-3);
    });

    it('evaluates 0 at x=any', () => {
      expect(evaluateFunction('0', 100)).toBe(0);
    });

    it('evaluates 2.5 at x=any', () => {
      expect(evaluateFunction('2.5', 1)).toBe(2.5);
    });
  });

  describe('edge cases', () => {
    it('handles negative x values for quadratics', () => {
      expect(evaluateFunction('x^2 + 2x + 1', -2)).toBe(1);
    });

    it('handles zero for quadratics', () => {
      expect(evaluateFunction('x^2 - 3x + 2', 0)).toBe(2);
    });

    it('handles negative x values for linear', () => {
      expect(evaluateFunction('2x + 3', -1)).toBe(1);
    });

    it('returns 0 for invalid expressions', () => {
      expect(evaluateFunction('not a function', 5)).toBe(0);
    });
  });
});
