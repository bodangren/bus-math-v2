export interface LinearCoefficients {
  m: number;
  b: number;
}

export function parseLinear(expression: string): LinearCoefficients | null {
  if (expression.includes('x^2')) {
    return null;
  }
  const match = expression.match(/(-?\d*\.?\d*)?x(?:\s*([+-]\s*\d*\.?\d*)?)?/);
  if (match) {
    let m = 1;
    if (match[1]) {
      const mStr = match[1];
      const mVal = parseFloat(mStr);
      m = isNaN(mVal) ? (mStr.startsWith('-') ? -1 : 1) : mVal;
    }
    let b = 0;
    if (match[2]) {
      const bStr = match[2].replace(/\s/g, '');
      const bVal = parseFloat(bStr);
      b = isNaN(bVal) ? (bStr.startsWith('-') ? -1 : 1) : bVal;
    }
    return { m, b };
  }
  const constantMatch = expression.match(/y\s*=\s*(-?\d+\.?\d*)/);
  if (constantMatch) {
    return { m: 0, b: parseFloat(constantMatch[1]) };
  }
  return null;
}
