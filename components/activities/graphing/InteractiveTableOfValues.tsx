'use client';

import React, { useState, useEffect } from 'react';
import { evaluateFunction } from '@/lib/activities/graphing/canvas-utils';

export interface InteractiveTableOfValuesProps {
  xValues: number[];
  functionExpression: string;
  onTableComplete: (points: Array<{ x: number; y: number }>) => void;
  readonly?: boolean;
  preFilledValues?: Record<number, number>;
}

interface TableRow {
  x: number;
  y: string;
  isCorrect: boolean | null;
  isEmpty: boolean;
}

export function InteractiveTableOfValues({
  xValues,
  functionExpression,
  onTableComplete,
  readonly = false,
  preFilledValues = {},
}: InteractiveTableOfValuesProps) {
  const [rows, setRows] = useState<TableRow[]>(
    xValues.map(x => ({
      x,
      y: preFilledValues[x] !== undefined ? String(preFilledValues[x]) : '',
      isCorrect: null,
      isEmpty: preFilledValues[x] === undefined,
    }))
  );

  useEffect(() => {
    const allFilled = rows.every(row => !row.isEmpty);
    const allCorrect = rows.every(row => row.isCorrect === true);

    if (allFilled && allCorrect) {
      const points = rows.map(row => ({
        x: row.x,
        y: parseFloat(row.y),
      }));
      onTableComplete(points);
    }
  }, [rows, onTableComplete]);

  const handleInputChange = (index: number, value: string) => {
    const x = rows[index].x;

    const isEmpty = value.trim() === '';
    let isCorrect: boolean | null = null;

    if (!isEmpty) {
      const numericValue = parseFloat(value);
      const expectedValue = evaluateFunction(functionExpression, x);

      if (!isNaN(numericValue)) {
        isCorrect = Math.abs(numericValue - expectedValue) < 0.01;
      }
    }

    setRows(prevRows => {
      const newRows = prevRows.map((row, i) =>
        i === index
          ? { ...row, y: value, isCorrect, isEmpty }
          : row
      );
      return newRows;
    });
  };

  const getRowClassName = (row: TableRow) => {
    if (readonly) return '';
    if (row.isEmpty) return '';
    if (row.isCorrect === true) return 'bg-green-100';
    if (row.isCorrect === false) return 'bg-red-100';
    return '';
  };

  return (
    <div className="my-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-foreground mb-3">Table of Values</h3>
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border w-24">
              x
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">
              f(x)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={`hover:bg-muted/30 transition-colors ${getRowClassName(row)}`}
            >
              <td className="px-4 py-3 border-b border-border last:border-b-0 font-mono-num">
                {row.x}
              </td>
              <td className="px-4 py-3 border-b border-border last:border-b-0">
                <input
                  type="number"
                  value={row.y}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  disabled={readonly}
                  className="w-full px-2 py-1 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  placeholder="Enter value"
                  aria-label={`f(${row.x})`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}