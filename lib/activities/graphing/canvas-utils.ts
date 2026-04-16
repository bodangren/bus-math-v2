import { parseQuadratic } from './quadratic-parser';
import { parseLinear } from './linear-parser';

export interface Point {
  x: number;
  y: number;
  label?: string;
  type?: 'vertex' | 'intercept' | 'intersection' | 'custom';
}

export interface FunctionPlot {
  expression: string;
  color: string;
}

export interface GraphingCanvasProps {
  domain: [number, number];
  range: [number, number];
  functions?: FunctionPlot[];
  points?: Point[];
  onPointAdd?: (point: Point) => void;
  onPointRemove?: (label: string) => void;
  readonly?: boolean;
  snapToGrid?: boolean;
  width?: number;
  height?: number;
}

export function transformDataToCanvas(
  x: number,
  y: number,
  domain: [number, number],
  range: [number, number],
  width: number,
  height: number,
): { canvasX: number; canvasY: number } {
  const [xMin, xMax] = domain;
  const [yMin, yMax] = range;

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const canvasX = ((x - xMin) / xRange) * width;
  const canvasY = height - ((y - yMin) / yRange) * height;

  return { canvasX, canvasY };
}

export function transformCanvasToData(
  canvasX: number,
  canvasY: number,
  domain: [number, number],
  range: [number, number],
  width: number,
  height: number,
): { x: number; y: number } {
  const [xMin, xMax] = domain;
  const [yMin, yMax] = range;

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;

  const x = (canvasX / width) * xRange + xMin;
  const y = yMax - (canvasY / height) * yRange;

  return { x, y };
}

export function snapToGridValue(
  value: number,
  step: number = 1,
): number {
  return Math.round(value / step) * step;
}

export function evaluateQuadratic(
  x: number,
  a: number,
  b: number,
  c: number,
): number {
  return a * x * x + b * x + c;
}

export function evaluateLinear(
  x: number,
  m: number,
  b: number,
): number {
  return m * x + b;
}

export function evaluateFunction(
  expression: string,
  x: number,
): number {
  if (expression.includes('x^2')) {
    const coeffs = parseQuadratic(expression);
    if (coeffs) {
      return evaluateQuadratic(x, coeffs.a, coeffs.b, coeffs.c);
    }
  } else if (expression.includes('x')) {
    const coeffs = parseLinear(expression);
    if (coeffs) {
      return evaluateLinear(x, coeffs.m, coeffs.b);
    }
  }

  return parseFloat(expression) || 0;
}

export function generateFunctionPath(
  expression: string,
  domain: [number, number],
  width: number,
): string {
  const [xMin, xMax] = domain;
  const step = (xMax - xMin) / width;

  const points: string[] = [];

  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluateFunction(expression, x);

    if (isFinite(y) && Math.abs(y) < 1000) {
      points.push(`${x},${y}`);
    }
  }

  return points.join(' ');
}
