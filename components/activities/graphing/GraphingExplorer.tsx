'use client';

import React, { useState, useCallback } from 'react';
import { GraphingCanvas, Point, FunctionPlot } from './GraphingCanvas';
import { InteractiveTableOfValues } from './InteractiveTableOfValues';
import { HintPanel, HintData } from './HintPanel';
import { InterceptIdentification, InterceptData } from './InterceptIdentification';
import { parseLinear } from '@/lib/activities/graphing/linear-parser';
import { parseQuadratic } from '@/lib/activities/graphing/quadratic-parser';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';

export interface GraphingExplorerProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice' | 'explore';
  onSubmit?: (payload: PracticeSubmissionEnvelope) => void;
  variant?: 'plot_from_equation' | 'compare_functions' | 'find_intercepts' | 'graph_system' | 'compare_lines' | 'multi_curve';
  equation: string;
  domain?: [number, number];
  range?: [number, number];
  points?: [number, number][];
  comparisonEquation?: string;
  comparisonQuestion?: string;
  comparisonAnswer?: 'first' | 'second';
  linearEquation?: string;
  exploreQuestion?: string;
  explorationPrompts?: string[];
  sliderDefaults?: { a: number; b: number; c: number };
  secondEquation?: string;
  secondEquationLabel?: string;
}

const DEFAULT_DOMAIN: [number, number] = [-10, 10];
const DEFAULT_RANGE: [number, number] = [-10, 10];

export function GraphingExplorer({
  activityId,
  mode,
  onSubmit,
  variant = 'plot_from_equation',
  equation,
  domain = DEFAULT_DOMAIN,
  range = DEFAULT_RANGE,
  points: initialPoints = [],
  comparisonEquation,
  comparisonQuestion,
  comparisonAnswer,
  linearEquation,
  exploreQuestion,
  explorationPrompts,
  sliderDefaults,
  secondEquation,
  secondEquationLabel,
}: GraphingExplorerProps) {
  const [placedPoints, setPlacedPoints] = useState<Point[]>([]);
  const [tableComplete, setTableComplete] = useState(false);
  const [hints, setHints] = useState<HintData[]>([]);
  const [intercepts, setIntercepts] = useState<InterceptData[]>([]);
  const [interactionHistory, setInteractionHistory] = useState<Array<{ type: string; timestamp: number; data?: unknown }>>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [comparisonAnswerSelected, setComparisonAnswerSelected] = useState<'first' | 'second' | null>(null);
  const [showComparisonFeedback, setShowComparisonFeedback] = useState(false);
  const [intersectionPoints, setIntersectionPoints] = useState<Point[]>([]);
  const [sliderA, setSliderA] = useState(sliderDefaults?.a ?? 1);
  const [sliderB, setSliderB] = useState(sliderDefaults?.b ?? 0);
  const [sliderC, setSliderC] = useState(sliderDefaults?.c ?? 0);

  const addInteraction = useCallback((type: string, data?: unknown) => {
    setInteractionHistory(prev => [...prev, { type, timestamp: Date.now(), data }]);
  }, []);

  const handlePointAdd = useCallback((point: Point) => {
    setPlacedPoints(prev => [...prev, { ...point, label: `${point.x.toFixed(1)}, ${point.y.toFixed(1)}` }]);
    addInteraction('point_placed', point);

    if (variant === 'find_intercepts' && Math.abs(point.y) < 1.0) {
      setIntercepts(prev => [...prev, {
        type: 'intercept',
        data: { x: point.x, y: 0 },
        timestamp: Date.now(),
      }]);
      addInteraction('intercept_identified', { x: point.x, y: 0 });
    }

    if (variant === 'graph_system') {
      setIntersectionPoints(prev => [...prev, point]);
      addInteraction('intersection_identified', point);
    }
  }, [addInteraction, variant]);

  const handlePointRemove = useCallback((label: string) => {
    setPlacedPoints(prev => prev.filter(p => p.label !== label));
    if (variant === 'find_intercepts') {
      setIntercepts(prev => prev.filter(i => {
        if (i.type === 'intercept' && i.data) {
          return i.data.x.toFixed(1) !== label.split(', ')[0];
        }
        return true;
      }));
    }
    if (variant === 'graph_system') {
      setIntersectionPoints(prev => prev.filter(p => p.label !== label));
    }
    addInteraction('point_removed', { label });
  }, [addInteraction, variant]);

  const handleTableComplete = useCallback((points: Array<{ x: number; y: number }>) => {
    setTableComplete(true);
    addInteraction('table_complete', { points });
  }, [addInteraction]);

  const handleHintUsed = useCallback((hint: HintData) => {
    setHints(prev => [...prev, hint]);
    addInteraction('hint_used', { hintType: hint.type, data: hint.data });
  }, [addInteraction]);

  const handleInterceptIdentified = useCallback((intercept: InterceptData) => {
    setIntercepts(prev => [...prev, intercept]);
    addInteraction('intercept_identified', intercept);
  }, [addInteraction]);

  const handleComparisonAnswerSelect = useCallback((answer: 'first' | 'second') => {
    setComparisonAnswerSelected(answer);
    addInteraction('comparison_answer_selected', { answer });
  }, [addInteraction]);

  const assessPointsCorrectness = useCallback((): boolean => {
    if (initialPoints.length === 0) return true;
    if (placedPoints.length === 0) return false;

    return initialPoints.every(([expectedX, expectedY]) =>
      placedPoints.some(p => Math.abs(p.x - expectedX) < 0.1 && Math.abs(p.y - expectedY) < 0.1)
    );
  }, [initialPoints, placedPoints]);

  const assessInterceptsCorrectness = useCallback((): boolean => {
    return intercepts.length > 0;
  }, [intercepts]);

  const assessComparisonCorrectness = useCallback((): boolean => {
    if (!comparisonAnswer || !comparisonAnswerSelected) return false;
    return comparisonAnswerSelected === comparisonAnswer;
  }, [comparisonAnswer, comparisonAnswerSelected]);

  const hasRealIntercepts = useCallback((): boolean => {
    const coeffs = parseQuadratic(equation.replace(/^y\s*=\s*/, '').trim());
    if (!coeffs || coeffs.a === 0) return true;

    const discriminant = coeffs.b * coeffs.b - 4 * coeffs.a * coeffs.c;
    return discriminant >= 0;
  }, [equation]);

  const hasRealIntersections = useCallback((): boolean => {
    if (!linearEquation) return true;

    const quadCoeffs = parseQuadratic(equation.replace(/^y\s*=\s*/, '').trim());
    if (!quadCoeffs || quadCoeffs.a === 0) return true;

    let m = 0;
    let k = 0;

    const linearCoeffs = parseLinear(linearEquation);
    if (linearCoeffs) {
      m = linearCoeffs.m;
      k = linearCoeffs.b;
    } else {
      const linearNoPrefix = parseLinear(linearEquation.replace(/^y\s*=\s*/, '').trim());
      if (linearNoPrefix) {
        m = linearNoPrefix.m;
        k = linearNoPrefix.b;
      } else {
        return true;
      }
    }

    const discriminant = (quadCoeffs.b - m) ** 2 - 4 * quadCoeffs.a * (quadCoeffs.c - k);
    return discriminant >= 0;
  }, [equation, linearEquation]);

  const handleSubmit = useCallback(() => {
    if (!onSubmit) return;

    const parts: Array<{
      partId: string;
      rawAnswer: unknown;
      isCorrect?: boolean;
      hintsUsed?: number;
    }> = [
      {
        partId: 'placed_points',
        rawAnswer: placedPoints.map(p => ({ x: p.x, y: p.y })),
        isCorrect: assessPointsCorrectness(),
      },
      {
        partId: 'intercepts',
        rawAnswer: intercepts,
        isCorrect: assessInterceptsCorrectness(),
        hintsUsed: hints.length,
      },
    ];

    const answers: Record<string, unknown> = {
      placedPoints: placedPoints.map(p => ({ x: p.x, y: p.y })),
      intercepts: intercepts,
    };

    if (variant === 'compare_functions' && comparisonAnswerSelected) {
      parts.push({
        partId: 'comparison',
        rawAnswer: comparisonAnswerSelected,
        isCorrect: assessComparisonCorrectness(),
      });
      answers.comparisonAnswer = comparisonAnswerSelected;
    }

    if (variant === 'graph_system') {
      parts.push({
        partId: 'intersections',
        rawAnswer: intersectionPoints,
        isCorrect: assessPointsCorrectness(),
      });
      answers.intersections = intersectionPoints;
    }

    const envelope: PracticeSubmissionEnvelope = {
      contractVersion: 'practice.v1',
      activityId,
      mode: (mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode) as PracticeSubmissionEnvelope['mode'],
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers,
      parts,
      artifact: {
        graphState: {
          equation,
          comparisonEquation,
          linearEquation,
          domain,
          range,
          placedPoints,
          intercepts,
          intersectionPoints,
        },
      },
      interactionHistory,
    };

    onSubmit(envelope);
    setShowSolution(true);
    setShowComparisonFeedback(true);
  }, [activityId, mode, onSubmit, placedPoints, intercepts, hints, interactionHistory, equation, comparisonEquation, linearEquation, domain, range, assessPointsCorrectness, assessInterceptsCorrectness, variant, comparisonAnswerSelected, assessComparisonCorrectness, intersectionPoints]);

  const functions: FunctionPlot[] = [
    {
      expression: equation,
      color: '#3b82f6',
    },
    ...(variant === 'compare_functions' && comparisonEquation
      ? [{
          expression: comparisonEquation,
          color: '#ef4444',
        }]
      : []),
    ...(variant === 'graph_system' && linearEquation
      ? [{
          expression: linearEquation,
          color: '#10b981',
        }]
      : []),
    ...(variant === 'compare_lines' && secondEquation
      ? [{
          expression: secondEquation,
          color: '#ef4444',
        }]
      : []),
    ...(variant === 'multi_curve' && secondEquation
      ? [{
          expression: secondEquation,
          color: '#10b981',
        }]
      : []),
  ];

  const preSetPoints: Point[] = initialPoints.map(([x, y]) => ({
    x,
    y,
    label: `${x.toFixed(1)}, ${y.toFixed(1)}`,
    type: 'vertex',
  }));

  const isTeaching = mode === 'teaching';
  const isGuided = mode === 'guided';
  const isPractice = mode === 'practice';
  const isExplore = mode === 'explore';

  const formatCoefficient = (coeff: number, variable: string, isFirst: boolean): string => {
    if (coeff === 0) return '';
    const sign = coeff > 0 ? (isFirst ? '' : ' + ') : ' - ';
    const absCoeff = Math.abs(coeff);
    const coeffStr = absCoeff === 1 && variable ? '' : absCoeff.toString();
    return `${sign}${coeffStr}${variable}`;
  };

  const exploreEquation = (() => {
    let result = 'y = ';
    const aPart = formatCoefficient(sliderA, 'x²', true);
    const bPart = formatCoefficient(sliderB, 'x', !aPart);
    const cPart = formatCoefficient(sliderC, '', !aPart && !bPart);
    result += aPart + bPart + cPart;
    return result || 'y = 0';
  })();

  const handleSliderReset = () => {
    setSliderA(sliderDefaults?.a ?? 1);
    setSliderB(sliderDefaults?.b ?? 0);
    setSliderC(sliderDefaults?.c ?? 0);
  };

  const exploreFunctions: FunctionPlot[] = [{ expression: exploreEquation, color: '#3b82f6' }];

  const getVariantTitle = () => {
    switch (variant) {
      case 'compare_functions':
        return 'Compare the Functions';
      case 'find_intercepts':
        return 'Find the X-Intercepts';
      case 'graph_system':
        return 'Graph the System of Equations';
      case 'compare_lines':
        return secondEquationLabel || 'Compare the Lines';
      case 'multi_curve':
        return secondEquationLabel || 'Compare the Curves';
      default:
        return 'Graph the Function';
    }
  };

  return (
    <div className="space-y-6">
      {isExplore ? (
        <>
          {exploreQuestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-lg font-medium text-blue-900">{exploreQuestion}</p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">Parameter Controls</h3>
              <button
                onClick={handleSliderReset}
                className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-24 font-medium text-foreground">
                  a: <span className="text-blue-600">{sliderA.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={sliderA}
                  onChange={(e) => setSliderA(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Coefficient a"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 font-medium text-foreground">
                  b: <span className="text-blue-600">{sliderB.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={sliderB}
                  onChange={(e) => setSliderB(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Coefficient b"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 font-medium text-foreground">
                  c: <span className="text-blue-600">{sliderC.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={sliderC}
                  onChange={(e) => setSliderC(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Coefficient c"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-lg font-mono text-center text-blue-700">
                {exploreEquation}
              </p>
            </div>
          </div>

          {explorationPrompts && explorationPrompts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="font-medium text-amber-900 mb-2">Explore Further:</h4>
              <ul className="space-y-2">
                {explorationPrompts.map((prompt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`prompt-${index}`}
                      className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor={`prompt-${index}`} className="text-amber-800 cursor-pointer">
                      {prompt}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <GraphingCanvas
            domain={domain}
            range={range}
            functions={exploreFunctions}
            points={[]}
            readonly={true}
          />
        </>
      ) : (
      <>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {getVariantTitle()}
          </h2>
          <p className="text-muted-foreground">
            {equation}
            {variant === 'compare_functions' && comparisonEquation && (
              <>
                <br />
                {comparisonEquation}
              </>
            )}
            {variant === 'graph_system' && linearEquation && (
              <>
                <br />
                {linearEquation}
              </>
            )}
            {variant === 'compare_lines' && secondEquation && (
              <>
                <br />
                {secondEquationLabel || secondEquation}
              </>
            )}
            {variant === 'multi_curve' && secondEquation && (
              <>
                <br />
                {secondEquationLabel || secondEquation}
              </>
            )}
          </p>
        </div>

        {variant === 'graph_system' && (
        <p className="text-sm text-muted-foreground">
          Find the intersection points
        </p>
      )}

      {isGuided && !tableComplete && (
        <InteractiveTableOfValues
          xValues={[-2, -1, 0, 1, 2]}
          functionExpression={equation}
          onTableComplete={handleTableComplete}
          readonly={isTeaching}
        />
      )}

      {isGuided && tableComplete && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm">Great! Now plot the points on the graph.</p>
        </div>
      )}

      {isGuided && (
        <HintPanel
          functionExpression={equation}
          onHintUsed={handleHintUsed}
          readonly={isTeaching}
        />
      )}

      <GraphingCanvas
        domain={domain}
        range={range}
        functions={functions}
        points={[...preSetPoints, ...placedPoints]}
        onPointAdd={(!isTeaching && (isPractice || tableComplete)) ? handlePointAdd : undefined}
        onPointRemove={(!isTeaching && (isPractice || tableComplete)) ? handlePointRemove : undefined}
        readonly={isTeaching}
        snapToGrid={isGuided}
      />

      {isGuided && tableComplete && (
        <InterceptIdentification
          functionExpression={equation}
          onInterceptIdentified={handleInterceptIdentified}
          readonly={isTeaching}
        />
      )}

      {variant === 'find_intercepts' && !hasRealIntercepts() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800 font-medium">
            This function has no real x-intercepts.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            The graph does not cross the x-axis.
          </p>
        </div>
      )}

      {variant === 'graph_system' && !hasRealIntersections() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800 font-medium">
            This system has no real intersection points.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            The quadratic and linear functions do not intersect.
          </p>
        </div>
      )}

      {variant === 'compare_functions' && comparisonQuestion && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <p className="font-medium text-foreground mb-3">{comparisonQuestion}</p>
          {!isTeaching ? (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="comparison"
                  value="first"
                  checked={comparisonAnswerSelected === 'first'}
                  onChange={(e) => handleComparisonAnswerSelect(e.target.value as 'first' | 'second')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-foreground">First function: {equation}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="comparison"
                  value="second"
                  checked={comparisonAnswerSelected === 'second'}
                  onChange={(e) => handleComparisonAnswerSelect(e.target.value as 'first' | 'second')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-foreground">Second function: {comparisonEquation}</span>
              </label>
            </div>
          ) : (
            <p className="text-sm text-green-700 font-medium">
              Correct answer: {comparisonAnswer === 'first' ? 'First' : 'Second'} function
            </p>
          )}
        </div>
      )}

      {showSolution && (
        <>
          {showComparisonFeedback && variant === 'compare_functions' && comparisonAnswerSelected && (
            <div className={`border rounded-md p-4 ${assessComparisonCorrectness() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${assessComparisonCorrectness() ? 'text-green-900' : 'text-red-900'}`}>
                {assessComparisonCorrectness() ? 'Correct!' : 'Incorrect'}
              </h3>
              {!assessComparisonCorrectness() && (
                <p className={`text-sm ${assessComparisonCorrectness() ? 'text-green-800' : 'text-red-800'}`}>
                  The correct answer is: {comparisonAnswer === 'first' ? 'First' : 'Second'} function
                </p>
              )}
            </div>
          )}
          {variant === 'find_intercepts' && (
            <div className={`border rounded-md p-4 ${assessInterceptsCorrectness() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${assessInterceptsCorrectness() ? 'text-green-900' : 'text-red-900'}`}>
                {assessInterceptsCorrectness() ? 'Correct!' : 'Incorrect'}
              </h3>
            </div>
          )}
          {variant === 'graph_system' && (
            <div className={`border rounded-md p-4 ${assessPointsCorrectness() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${assessPointsCorrectness() ? 'text-green-900' : 'text-red-900'}`}>
                {assessPointsCorrectness() ? 'Correct!' : 'Incorrect'}
              </h3>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Correct Solution</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {preSetPoints.map((point, index) => (
                <div key={index}>
                  Point: ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!isTeaching && (
        (variant === 'compare_functions'
          ? comparisonAnswerSelected
          : isPractice || tableComplete
        ) && (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Submit
          </button>
        )
      )}
      </>
      )}
    </div>
  );
}