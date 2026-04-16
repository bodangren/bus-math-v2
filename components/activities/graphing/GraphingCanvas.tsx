'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Point,
  GraphingCanvasProps,
  transformDataToCanvas,
  transformCanvasToData,
  snapToGridValue,
  generateFunctionPath,
} from '@/lib/activities/graphing/canvas-utils';

export type { Point, FunctionPlot } from '@/lib/activities/graphing/canvas-utils';

export function GraphingCanvas({
  domain = [-10, 10],
  range = [-10, 10],
  functions = [],
  points = [],
  onPointAdd,
  onPointRemove,
  readonly = false,
  snapToGrid = false,
  width = 600,
  height = 600,
}: GraphingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setCanvasSize({ width: rect.width, height: rect.height });
        }
      }
    });

    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (readonly) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const svg = svgRef.current;
    if (!svg || canvasSize.width === 0 || canvasSize.height === 0) return;

    const rect = svg.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const { x, y } = transformCanvasToData(
      clickX,
      clickY,
      domain,
      range,
      canvasSize.width,
      canvasSize.height,
    );

    const finalX = snapToGrid ? snapToGridValue(x) : x;
    const finalY = snapToGrid ? snapToGridValue(y) : y;

    if (onPointAdd && isFinite(finalX) && isFinite(finalY)) {
      onPointAdd({ x: finalX, y: finalY });
    }
  };

  const handlePointClick = (point: Point, event: React.MouseEvent) => {
    event.stopPropagation();

    if (readonly || !onPointRemove) return;

    if (point.label) {
      onPointRemove(point.label);
    }
  };

  const renderGrid = () => {
    const { width: w, height: h } = canvasSize;
    const [xMin, xMax] = domain;
    const [yMin, yMax] = range;

    const gridLines: React.ReactNode[] = [];

    const xStep = (xMax - xMin) / 20;
    const yStep = (yMax - yMin) / 20;

    for (let x = xMin; x <= xMax; x += xStep) {
      const { canvasX } = transformDataToCanvas(x, 0, domain, range, w, h);
      gridLines.push(
        <line
          key={`grid-x-${x}`}
          x1={canvasX}
          y1={0}
          x2={canvasX}
          y2={h}
          stroke="#e5e7eb"
          strokeWidth={1}
          className="grid-line"
        />,
      );
    }

    for (let y = yMin; y <= yMax; y += yStep) {
      const { canvasY } = transformDataToCanvas(0, y, domain, range, w, h);
      gridLines.push(
        <line
          key={`grid-y-${y}`}
          x1={0}
          y1={canvasY}
          x2={w}
          y2={canvasY}
          stroke="#e5e7eb"
          strokeWidth={1}
          className="grid-line"
        />,
      );
    }

    return gridLines;
  };

  const renderAxes = () => {
    const { width: w, height: h } = canvasSize;

    const { canvasX: originX } = transformDataToCanvas(0, 0, domain, range, w, h);
    const { canvasY: originY } = transformDataToCanvas(0, 0, domain, range, w, h);

    return (
      <>
        <line
          x1={0}
          y1={originY}
          x2={w}
          y2={originY}
          stroke="#374151"
          strokeWidth={2}
          className="x-axis"
        />
        <line
          x1={originX}
          y1={0}
          x2={originX}
          y2={h}
          stroke="#374151"
          strokeWidth={2}
          className="y-axis"
        />
      </>
    );
  };

  const renderTickLabels = () => {
    const { width: w, height: h } = canvasSize;
    const [xMin, xMax] = domain;
    const [yMin, yMax] = range;

    const labels: React.ReactNode[] = [];

    const xStep = (xMax - xMin) / 10;
    const yStep = (yMax - yMin) / 10;

    for (let x = xMin; x <= xMax; x += xStep) {
      if (Math.abs(x) < 0.01) continue;

      const { canvasX, canvasY } = transformDataToCanvas(x, 0, domain, range, w, h);
      labels.push(
        <text
          key={`tick-x-${x}`}
          x={canvasX}
          y={canvasY + 20}
          textAnchor="middle"
          className="tick-label"
          style={{ fontSize: '12px', fill: '#6b7280' }}
        >
          {x.toFixed(1)}
        </text>,
      );
    }

    for (let y = yMin; y <= yMax; y += yStep) {
      if (Math.abs(y) < 0.01) continue;

      const { canvasX, canvasY } = transformDataToCanvas(0, y, domain, range, w, h);
      labels.push(
        <text
          key={`tick-y-${y}`}
          x={canvasX - 10}
          y={canvasY + 5}
          textAnchor="end"
          className="tick-label"
          style={{ fontSize: '12px', fill: '#6b7280' }}
        >
          {y.toFixed(1)}
        </text>,
      );
    }

    return labels;
  };

  const renderFunctions = () => {
    const { width: w, height: h } = canvasSize;

    return functions.map((func, index) => {
      const pathData = generateFunctionPath(func.expression, domain, w);
      const { canvasY: yMinCanvas } = transformDataToCanvas(0, range[0], domain, range, w, h);
      const { canvasY: yMaxCanvas } = transformDataToCanvas(0, range[1], domain, range, w, h);

      return (
        <path
          key={`function-${index}`}
          d={pathData}
          fill="none"
          stroke={func.color}
          strokeWidth={2}
          className="function-curve"
          transform={`scale(1, -1) translate(0, -${yMaxCanvas + yMinCanvas})`}
        />
      );
    });
  };

  const renderPoints = () => {
    const { width: w, height: h } = canvasSize;

    return points.map((point, index) => {
      const { canvasX, canvasY } = transformDataToCanvas(
        point.x,
        point.y,
        domain,
        range,
        w,
        h,
      );

      const isVertex = point.type === 'vertex';

      return (
        <g
          key={`point-${index}`}
          onClick={(e) => handlePointClick(point, e)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          <circle
            cx={canvasX}
            cy={canvasY}
            r={isVertex ? 8 : 6}
            fill={isVertex ? '#f59e0b' : '#3b82f6'}
            stroke="#ffffff"
            strokeWidth={2}
            className={`point-marker ${point.type || ''}`}
          />
          {point.label && (
            <text
              x={canvasX}
              y={canvasY - 12}
              textAnchor="middle"
              className="point-label"
              style={{ fontSize: '11px', fill: '#374151', fontWeight: '500' }}
            >
              {`${point.x.toFixed(1)}, ${point.y.toFixed(1)}`}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        style={{ width: '100%', minHeight: '400px', backgroundColor: '#ffffff' }}
        onClick={handleClick}
        role="img"
        aria-label="Coordinate plane for graphing"
      >
        {renderGrid()}
        {renderAxes()}
        {renderTickLabels()}
        {renderFunctions()}
        {renderPoints()}
      </svg>
    </div>
  );
}