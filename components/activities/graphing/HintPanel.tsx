'use client';

import React, { useState, useCallback } from 'react';
import { parseQuadratic } from '@/lib/activities/graphing/quadratic-parser';

export interface HintData {
  type: 'axis_of_symmetry' | 'vertex' | 'direction';
  data: { x?: number; y?: number; opens?: string } | null;
  timestamp: number;
}

export interface HintPanelProps {
  functionExpression: string;
  onHintUsed: (hint: HintData) => void;
  readonly?: boolean;
}

export function HintPanel({
  functionExpression,
  onHintUsed,
  readonly = false,
}: HintPanelProps) {
  const [usedHints, setUsedHints] = useState<Set<string>>(new Set());

  const handleHintClick = useCallback(
    (type: HintData['type']) => {
      if (readonly || usedHints.has(type)) return;

      const coeffs = parseQuadratic(functionExpression);
      let data: HintData['data'] = null;

      if (coeffs && coeffs.a !== 0) {
        const { a, b, c } = coeffs;

        switch (type) {
          case 'axis_of_symmetry':
            let axisX = -b / (2 * a);
            if (Object.is(axisX, -0)) axisX = 0;
            data = { x: axisX };
            break;

          case 'vertex':
            let vertexX = -b / (2 * a);
            if (Object.is(vertexX, -0)) vertexX = 0;
            const vertexY = a * vertexX * vertexX + b * vertexX + c;
            data = { x: vertexX, y: vertexY };
            break;

          case 'direction':
            data = { opens: a > 0 ? 'up' : 'down' };
            break;
        }
      }

      const hint: HintData = {
        type,
        data,
        timestamp: Date.now(),
      };

      setUsedHints(prev => new Set(prev).add(type));
      onHintUsed(hint);
    },
    [functionExpression, readonly, usedHints, onHintUsed]
  );

  const getButtonClass = (type: string) => {
    const isUsed = usedHints.has(type);
    return `px-4 py-2 rounded-md text-sm font-medium transition-all ${
      isUsed || readonly
        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    }`;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Hints</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleHintClick('axis_of_symmetry')}
          disabled={readonly || usedHints.has('axis_of_symmetry')}
          className={getButtonClass('axis_of_symmetry')}
        >
          Show Axis of Symmetry
        </button>
        <button
          onClick={() => handleHintClick('vertex')}
          disabled={readonly || usedHints.has('vertex')}
          className={getButtonClass('vertex')}
        >
          Show Vertex
        </button>
        <button
          onClick={() => handleHintClick('direction')}
          disabled={readonly || usedHints.has('direction')}
          className={getButtonClass('direction')}
        >
          Show Direction
        </button>
      </div>
    </div>
  );
}