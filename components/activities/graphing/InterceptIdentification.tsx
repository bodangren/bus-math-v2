'use client';

import React, { useState, useCallback, useRef } from 'react';
import { evaluateFunction, transformDataToCanvas } from '@/lib/activities/graphing/canvas-utils';
import { parseQuadratic } from '@/lib/activities/graphing/quadratic-parser';
import { parseLinear } from '@/lib/activities/graphing/linear-parser';

export interface InterceptData {
  type: 'intercept' | 'no_intercepts';
  data: { x: number; y: number } | null;
  timestamp: number;
}

export interface InterceptIdentificationProps {
  functionExpression: string;
  onInterceptIdentified: (intercept: InterceptData) => void;
  readonly?: boolean;
}

interface IdentifiedIntercept {
  x: number;
  y: number;
}

const CANVAS_DOMAIN: [number, number] = [-10, 10];
const CANVAS_RANGE: [number, number] = [-10, 10];
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

export function InterceptIdentification({
  functionExpression,
  onInterceptIdentified,
  readonly = false,
}: InterceptIdentificationProps) {
  const [identifiedIntercepts, setIdentifiedIntercepts] = useState<IdentifiedIntercept[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const calculateXIntercepts = useCallback((expr: string): number[] => {
    const trimmedExpr = expr.trim();

    if (!trimmedExpr.includes('x')) {
      const c = parseFloat(trimmedExpr);
      if (Math.abs(c) < 0.0001) {
        return [];
      }
      return [];
    }

    if (trimmedExpr.includes('x^2')) {
      const coeffs = parseQuadratic(expr);
      if (coeffs) {
        const { a, b, c } = coeffs;

        if (a !== 0) {
          const discriminant = b * b - 4 * a * c;
          if (discriminant > 0) {
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            return [x1, x2];
          } else if (Math.abs(discriminant) < 0.0001) {
            const x = -b / (2 * a);
            return [x];
          }
        } else if (b !== 0) {
          const x = -c / b;
          return [x];
        }
      }
    } else {
      const coeffs = parseLinear(expr);
      if (coeffs) {
        const { m, b } = coeffs;
        if (m !== 0) {
          const x = -b / m;
          return [x];
        }
      }
    }
    return [];
  }, []);

  const hasRealIntercepts = useCallback(() => {
    const intercepts = calculateXIntercepts(functionExpression);
    return intercepts.length > 0;
  }, [functionExpression, calculateXIntercepts]);

  const findNearestIntercept = useCallback((clickCanvasX: number, clickCanvasY: number): { x: number; y: number } | null => {
    const intercepts = calculateXIntercepts(functionExpression);
    if (intercepts.length === 0) return null;

    const actualIntercepts = intercepts.map(x => ({
      x,
      y: evaluateFunction(functionExpression, x),
    }));

    let nearest = null;
    let minDistance = 50;

    actualIntercepts.forEach(intercept => {
      const { canvasX: interceptCanvasX, canvasY: interceptCanvasY } = transformDataToCanvas(
        intercept.x,
        intercept.y,
        CANVAS_DOMAIN,
        CANVAS_RANGE,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
      );

      const distance = Math.sqrt(
        Math.pow(clickCanvasX - interceptCanvasX, 2) +
        Math.pow(clickCanvasY - interceptCanvasY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = intercept;
      }
    });

    return nearest;
  }, [functionExpression, calculateXIntercepts]);

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (readonly) return;

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const nearestIntercept = findNearestIntercept(clickX, clickY);

      if (nearestIntercept) {
        const isAlreadyIdentified = identifiedIntercepts.some(
          i => Math.abs(i.x - nearestIntercept!.x) < 0.1
        );

        if (!isAlreadyIdentified) {
          setIdentifiedIntercepts(prev => [...prev, nearestIntercept!]);
          setFeedback({ message: 'Correct!', type: 'success' });

          onInterceptIdentified({
            type: 'intercept',
            data: nearestIntercept,
            timestamp: Date.now(),
          });
        }
      } else {
        setFeedback({ message: 'Try again', type: 'error' });
      }

      setTimeout(() => setFeedback(null), 2000);
    },
    [readonly, identifiedIntercepts, findNearestIntercept, onInterceptIdentified]
  );

  const handleNoInterceptsClick = useCallback(() => {
    if (readonly || hasRealIntercepts()) return;

    onInterceptIdentified({
      type: 'no_intercepts',
      data: null,
      timestamp: Date.now(),
    });
  }, [readonly, hasRealIntercepts, onInterceptIdentified]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Identify the X-Intercepts</h3>

      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 600 400"
          className="border border-border rounded-lg bg-background cursor-crosshair"
          onClick={handleCanvasClick}
          role="img"
          aria-label="Canvas for identifying x-intercepts"
        >
          <line x1="0" y1="200" x2="600" y2="200" stroke="#374151" strokeWidth={2} />
          <line x1="300" y1="0" x2="300" y2="400" stroke="#374151" strokeWidth={2} />

          {identifiedIntercepts.map((intercept, index) => {
            const { canvasX, canvasY } = transformDataToCanvas(intercept.x, intercept.y, CANVAS_DOMAIN, CANVAS_RANGE, CANVAS_WIDTH, CANVAS_HEIGHT);
            return (
              <g key={index}>
                <circle
                  cx={canvasX}
                  cy={canvasY}
                  r={8}
                  className="intercept-marker fill-blue-500 stroke-white stroke-2"
                />
                <text
                  x={canvasX}
                  y={canvasY - 15}
                  textAnchor="middle"
                  className="text-xs fill-foreground font-medium"
                >
                  {`${intercept.x.toFixed(1)}, 0`}
                </text>
              </g>
            );
          })}
        </svg>

        {feedback && (
          <div
            className={`absolute top-2 right-2 px-3 py-1 rounded-md text-sm font-medium ${
              feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      <button
        onClick={handleNoInterceptsClick}
        disabled={readonly || hasRealIntercepts()}
        className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        No Real Solutions
      </button>
    </div>
  );
}