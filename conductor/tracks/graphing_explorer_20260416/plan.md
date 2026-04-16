# Implementation Plan: Graphing Explorer

## Phase 1: Port Graphing Library

### Task 1.1: Create lib/activities/graphing/ Directory [x]
- Create `lib/activities/graphing/` directory

### Task 1.2: Port Canvas Utilities [x]
- Read `../ra-integrated-math-3/lib/activities/graphing/canvas-utils.ts` (131 lines)
- Create `lib/activities/graphing/canvas-utils.ts`
- Copy entire file. Imports `parseQuadratic` and `parseLinear` — those come next in Task 1.3 and 1.4
- No changes needed

### Task 1.3: Port Linear Parser [x]
- Read `../ra-integrated-math-3/lib/activities/graphing/linear-parser.ts` (31 lines)
- Create `lib/activities/graphing/linear-parser.ts`
- Copy entire file — no dependencies, no changes needed

### Task 1.4: Port Quadratic Parser [x]
- Read `../ra-integrated-math-3/lib/activities/graphing/quadratic-parser.ts` (31 lines)
- Create `lib/activities/graphing/quadratic-parser.ts`
- Copy entire file — no dependencies, no changes needed

### Task 1.5: Port Library Tests [x]
- Read and port:
  - `../ra-integrated-math-3/__tests__/lib/activities/graphing/canvas-utils.test.ts`
  - `../ra-integrated-math-3/__tests__/lib/activities/graphing/linear-parser.test.ts`
  - `../ra-integrated-math-3/__tests__/lib/activities/graphing/quadratic-parser.test.ts`
- Create matching files in `__tests__/lib/activities/graphing/`
- Run: `npx vitest run __tests__/lib/activities/graphing/`
- All tests must pass

## Phase 2: Port Graphing Components

### Task 2.1: Port GraphingCanvas [x]
- Read `../ra-integrated-math-3/components/activities/graphing/GraphingCanvas.tsx` (300 lines)
- Create `components/activities/graphing/GraphingCanvas.tsx`
- Copy entire file
- Verify import of canvas-utils types — path is `@/lib/activities/graphing/canvas-utils` (correct for BM2)
- This is an SVG-based canvas — no canvas HTML element, no special dependencies
- Ensure `'use client'` directive is present (it is in the source)

### Task 2.2: Port InteractiveTableOfValues [x]
- Read `../ra-integrated-math-3/components/activities/graphing/InteractiveTableOfValues.tsx`
- Create `components/activities/graphing/InteractiveTableOfValues.tsx`
- Copy entire file
- Verify imports resolve

### Task 2.3: Port HintPanel [x]
- Read `../ra-integrated-math-3/components/activities/graphing/HintPanel.tsx`
- Create `components/activities/graphing/HintPanel.tsx`
- Copy entire file

### Task 2.4: Port InterceptIdentification [x]
- Read `../ra-integrated-math-3/components/activities/graphing/InterceptIdentification.tsx`
- Create `components/activities/graphing/InterceptIdentification.tsx`
- Copy entire file

### Task 2.5: Port GraphingExplorer [x]
- Read `../ra-integrated-math-3/components/activities/graphing/GraphingExplorer.tsx` (611 lines)
- Create `components/activities/graphing/GraphingExplorer.tsx`
- Copy entire file
- This is the main orchestrator component
- Verify all imports from sibling files resolve (GraphingCanvas, InteractiveTableOfValues, HintPanel, InterceptIdentification)
- Verify import of `PracticeSubmissionEnvelope` from `@/lib/practice/contract` — already exists in BM2
- **Adaptation needed**: The sister project's `GraphingExplorer` has algebra-specific variants (`plot_from_equation`, `compare_functions`, `find_intercepts`, `graph_system`). For BM2, we need to add a `compare_lines` variant for CVP/Supply-Demand and a `multi_curve` variant for depreciation comparison
- Add the new variants to the component's internal logic following the existing pattern

### Task 2.6: Port Component Tests [x]
- Read and port all test files from `../ra-integrated-math-3/__tests__/components/activities/graphing/`
- Create matching files in `__tests__/components/activities/graphing/`
- Adapt imports to use BM2 paths
- Run: `npx vitest run __tests__/components/activities/graphing/`
- All 19 tests pass

## Phase 3: Business Math Exploration Configs

### Task 3.1: Create Exploration Config Data [x]
- Create `lib/activities/graphing/exploration-configs.ts`
- Define three config objects as specified in the spec (CVP, Supply/Demand, Depreciation)
- Each config has: `id`, `title`, `exploreQuestion`, `explorationPrompts`, `equations`, `sliders`, `domain`, `range`
- Export all three configs as named exports
- Export a `getExplorationConfig(id: string)` lookup function

### Task 3.2: Write Exploration Config Tests [x]
- Create `__tests__/lib/activities/graphing/exploration-configs.test.ts`
- Test that all three configs have required fields
- Test that slider defaults are within min/max range
- Test that equation strings are valid for the linear parser
- Test `getExplorationConfig` returns correct config by id
- Test that `getExplorationConfig` returns undefined for unknown id
- All 11 tests pass

### Task 3.3: Add compare_lines and multi_curve Variants to GraphingExplorer [x]
- Open `components/activities/graphing/GraphingExplorer.tsx`
- In the variant switch/render logic, add:
  - `compare_lines`: Renders two lines (e.g., total cost vs total revenue) with sliders controlling coefficients
  - `multi_curve`: Renders multiple curves (e.g., straight-line vs declining balance depreciation) over the same domain
- Both variants should render in `explore` mode with parameter sliders
- No submission required — the `onSubmit` callback is optional

### Task 3.4: Write Variant Tests [x]
- Create or extend `__tests__/components/activities/graphing/GraphingExplorer.test.tsx`
- Test that `compare_lines` variant renders two function lines
- Test that `multi_curve` variant renders multiple function lines
- Test that sliders update the rendered curves
- Test that `explore` mode does not show a Submit button

## Phase 4: Registry Integration

### Task 4.1: Add ActivityComponentKey [x]
- Open `types/activities.ts`
- Find the `ActivityComponentKey` type
- Add `'graphing-explorer'` to the union type

### Task 4.2: Register in Activity Registry [x]
- Open `lib/activities/registry.ts`
- Import `GraphingExplorer` from `@/components/activities/graphing/GraphingExplorer`
- Add `'graphing-explorer': GraphingExplorer` to the `activityRegistry` object

### Task 4.3: Write Registry Test [ ]
- Extend `__tests__/lib/activities/registry.test.ts`
- Test that `activityRegistry['graphing-explorer']` is defined
- Test that `getActivityComponent('graphing-explorer')` returns the GraphingExplorer component

## Phase 5: Verification

### Task 5.1: Run Full Verification Gates [ ]
- `npm run lint` — 0 errors
- `npm test` — all tests pass
- `npm run build` — clean
- Commit: `feat(activities): add graphing explorer with business math exploration configs (port from ra-integrated-math-3)`
