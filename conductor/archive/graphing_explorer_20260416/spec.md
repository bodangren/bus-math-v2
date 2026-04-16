# Track: Graphing Explorer

## Summary

Port the canvas-based interactive graphing system from `ra-integrated-math-3` and adapt it for business math use cases: cost-volume-profit analysis, supply/demand curves, and depreciation curves. The component supports an `explore` mode (no submission, parameter sliders) that integrates with the Phase Skip UI from Track 2.

## Motivation

BM2 currently uses Chart.js for simulations (break-even, supply/demand), but students can't freely manipulate curves by dragging parameters. A graphing explorer with live sliders lets students discover relationships between fixed costs, variable costs, selling price, and break-even points through direct manipulation.

## Source Files (ra-integrated-math-3)

### Library Files (port directly)

| Source File | Lines | Destination |
|---|---|---|
| `lib/activities/graphing/canvas-utils.ts` | 131 | `lib/activities/graphing/canvas-utils.ts` |
| `lib/activities/graphing/linear-parser.ts` | 31 | `lib/activities/graphing/linear-parser.ts` |
| `lib/activities/graphing/quadratic-parser.ts` | 31 | `lib/activities/graphing/quadratic-parser.ts` |

### Component Files (port and adapt)

| Source File | Lines | Destination |
|---|---|---|
| `components/activities/graphing/GraphingCanvas.tsx` | 300 | `components/activities/graphing/GraphingCanvas.tsx` |
| `components/activities/graphing/GraphingExplorer.tsx` | 611 | `components/activities/graphing/GraphingExplorer.tsx` |
| `components/activities/graphing/InteractiveTableOfValues.tsx` | ~103 | `components/activities/graphing/InteractiveTableOfValues.tsx` |
| `components/activities/graphing/HintPanel.tsx` | ~87 | `components/activities/graphing/HintPanel.tsx` |
| `components/activities/graphing/InterceptIdentification.tsx` | ~203 | `components/activities/graphing/InterceptIdentification.tsx` |

### Test Files (port)

| Source Test | Destination |
|---|---|
| `__tests__/lib/activities/graphing/canvas-utils.test.ts` | `__tests__/lib/activities/graphing/canvas-utils.test.ts` |
| `__tests__/lib/activities/graphing/linear-parser.test.ts` | `__tests__/lib/activities/graphing/linear-parser.test.ts` |
| `__tests__/lib/activities/graphing/quadratic-parser.test.ts` | `__tests__/lib/activities/graphing/quadratic-parser.test.ts` |
| `__tests__/components/activities/graphing/*.test.tsx` | `__tests__/components/activities/graphing/*.test.tsx` |

## Scope

### In Scope
1. Port all graphing library files (canvas-utils, parsers)
2. Port GraphingCanvas component (SVG-based coordinate plane)
3. Port GraphingExplorer with explore mode
4. Port InteractiveTableOfValues, HintPanel, InterceptIdentification
5. Create 3 business-math exploration configs:
   - **CVP Explorer**: Drag fixed cost, variable cost per unit, selling price per unit sliders to see break-even point move
   - **Supply/Demand Explorer**: Drag supply slope/intercept and demand slope/intercept to find equilibrium
   - **Depreciation Explorer**: Drag asset cost, salvage value, useful life to compare straight-line vs declining balance curves
6. Register graphing explorer in the activity registry
7. Add an `ActivityComponentKey` type for `'graphing-explorer'`
8. Port all tests
9. Write new tests for business-math exploration configs

### Out of Scope
- Adding graphing explorer phases to actual lesson seeds (future curriculum work)
- Porting `GraphingExplorerActivity.tsx` wrapper (BM2 has its own activity adapter pattern)
- Quadratic-specific UI (axis of symmetry, vertex discovery) — not relevant to business math
- The `compare_functions` and `graph_system` variants (not needed for business math)

## Acceptance Criteria

1. `lib/activities/graphing/canvas-utils.ts` exports `transformDataToCanvas`, `transformCanvasToData`, `snapToGridValue`, `evaluateFunction`, `generateFunctionPath`, and types
2. `lib/activities/graphing/linear-parser.ts` exports `parseLinear` and `LinearCoefficients`
3. `lib/activities/graphing/quadratic-parser.ts` exports `parseQuadratic` and `QuadraticCoefficients`
4. `components/activities/graphing/GraphingCanvas.tsx` renders an SVG coordinate plane with configurable domain/range
5. `components/activities/graphing/GraphingExplorer.tsx` supports `mode: 'explore'` with parameter sliders
6. Three business-math exploration configs exist as seed data or component props
7. `'graphing-explorer'` is registered in `activityRegistry` in `lib/activities/registry.ts`
8. `'graphing-explorer'` is added to `ActivityComponentKey` type in `types/activities.ts`
9. All ported tests pass
10. New tests for business-math configs pass
11. `npm run lint` — 0 errors
12. `npm test` — all tests pass
13. `npm run build` — clean

## Key Adaptation Points

### Expression Evaluator
The sister project's `canvas-utils.ts` uses `evaluateFunction` which parses `mx + b` and `ax² + bx + c` expressions. For business math, you'll also need:
- `evaluatePiecewise` for tax bracket curves (optional, future)
- Simple linear expressions like `y = 25x + 5000` (covered by existing parser)

### Explore Mode Parameters
The sister project's `GraphingExplorer` accepts `sliderDefaults: { a, b, c }`. For business math, the sliders represent different parameters:
- CVP: `{ fixedCost, variableCostPerUnit, sellingPricePerUnit }`
- Supply/Demand: `{ supplyIntercept, supplySlope, demandIntercept, demandSlope }`
- Depreciation: `{ assetCost, salvageValue, usefulLife }`

The component itself doesn't need to know what the parameters mean — it just renders sliders and evaluates the expression with the current values. The mapping from "business parameter name" to "equation variable" is done in the config.

### practice.v1 Integration
In `explore` mode, the GraphingExplorer does **not** emit a `practice.v1` envelope (no submission). This is intentional — explore phases are skippable (Track 2). The component still accepts an `onSubmit` prop for future `practice` mode variants where students must identify specific points.

## Business Math Exploration Configs

### CVP Explorer
```typescript
{
  componentKey: 'graphing-explorer',
  mode: 'explore',
  exploreQuestion: 'How do costs and prices affect the break-even point?',
  explorationPrompts: [
    'Drag the Fixed Cost slider up. What happens to the break-even point?',
    'Increase the Selling Price. How does the profit region change?',
    'Set Variable Cost per Unit higher than Selling Price. What happens?'
  ],
  equations: [
    'totalCost = fixedCost + variableCostPerUnit * x',
    'totalRevenue = sellingPricePerUnit * x'
  ],
  sliders: [
    { id: 'fixedCost', label: 'Fixed Cost', min: 0, max: 50000, step: 1000, default: 10000 },
    { id: 'variableCostPerUnit', label: 'Variable Cost/Unit', min: 0, max: 100, step: 1, default: 25 },
    { id: 'sellingPricePerUnit', label: 'Selling Price/Unit', min: 0, max: 200, step: 1, default: 50 }
  ]
}
```

### Supply/Demand Explorer
```typescript
{
  componentKey: 'graphing-explorer',
  mode: 'explore',
  exploreQuestion: 'How do supply and demand curves determine market equilibrium?',
  explorationPrompts: [
    'Find the equilibrium point where supply meets demand.',
    'Increase the supply slope. What happens to the equilibrium price?',
    'Shift demand up. How does the equilibrium quantity change?'
  ],
  equations: [
    'supply = supplyIntercept + supplySlope * x',
    'demand = demandIntercept - demandSlope * x'
  ],
  sliders: [
    { id: 'supplyIntercept', label: 'Supply Base', min: 0, max: 50, step: 1, default: 5 },
    { id: 'supplySlope', label: 'Supply Slope', min: 0.1, max: 5, step: 0.1, default: 1 },
    { id: 'demandIntercept', label: 'Demand Base', min: 10, max: 100, step: 1, default: 50 },
    { id: 'demandSlope', label: 'Demand Slope', min: 0.1, max: 5, step: 0.1, default: 1 }
  ]
}
```

### Depreciation Explorer
```typescript
{
  componentKey: 'graphing-explorer',
  mode: 'explore',
  exploreQuestion: 'How do different depreciation methods affect asset value over time?',
  explorationPrompts: [
    'Compare straight-line and declining balance curves.',
    'Increase the asset cost. How does the book value curve change?',
    'Set salvage value to zero. What happens?'
  ],
  equations: [
    'straightLine = assetCost - (assetCost - salvageValue) / usefulLife * x',
    'decliningBalance = assetCost * (1 - 2/usefulLife)^x'
  ],
  sliders: [
    { id: 'assetCost', label: 'Asset Cost', min: 1000, max: 100000, step: 1000, default: 50000 },
    { id: 'salvageValue', label: 'Salvage Value', min: 0, max: 50000, step: 1000, default: 5000 },
    { id: 'usefulLife', label: 'Useful Life (years)', min: 1, max: 20, step: 1, default: 5 }
  ]
}
```
