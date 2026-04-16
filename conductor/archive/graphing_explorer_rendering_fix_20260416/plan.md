# Implementation Plan: Graphing Explorer Rendering Fix

## Phase 1: Fix Coordinate Space Mismatch

- [ ] Task: Write tests for canvas-space `generateFunctionPath`
  - [ ] Add test asserting path points are in canvas coordinates for a linear function
  - [ ] Add test asserting path points are in canvas coordinates for a quadratic function
  - [ ] Add test for domain/range other than [-10, 10]
- [ ] Task: Implement canvas-space `generateFunctionPath`
  - [ ] Update signature to accept `range`, `width`, `height`
  - [ ] Use `transformDataToCanvas` on each evaluated point
  - [ ] Export updated function
- [ ] Task: Update `GraphingCanvas` rendering
  - [ ] Pass `range`, `canvasSize.width`, `canvasSize.height` to `generateFunctionPath`
  - [ ] Remove `transform="scale(1, -1) ..."` from the `<path>` element
  - [ ] Verify existing `GraphingCanvas` tests still pass

## Phase 2: Replace Inline Parsing

- [ ] Task: Write tests for zero-coefficient parsing in `GraphingExplorer`
  - [ ] Test `hasRealIntercepts` with `a=0` equation
  - [ ] Test `hasRealIntersections` with `a=0` and `m=0` equations
- [ ] Task: Replace inline regex parsing in `GraphingExplorer.tsx`
  - [ ] Import `parseLinear` and `parseQuadratic` from `lib/activities/graphing/`
  - [ ] Replace `hasRealIntercepts` inline regex with `parseQuadratic`
  - [ ] Replace `hasRealIntersections` inline regex with `parseQuadratic` + `parseLinear`
  - [ ] Ensure `0` coefficients are handled correctly (no `|| 1` fallback)

## Phase 3: Verification and Closure

- [ ] Task: Run verification gates
  - [ ] `npm run lint`
  - [ ] `npm test` (graphing tests + full suite)
  - [ ] `npm run build`
- [ ] Task: Update tech-debt.md
  - [ ] Mark Graphing Explorer coordinate space mismatch as Closed
  - [ ] Mark Graphing Explorer duplicate inline parsing as Closed
- [ ] Task: Update lessons-learned.md
  - [ ] Add entry about SVG path data requiring canvas-space coordinates
  - [ ] Add entry about avoiding duplicate parsing when canonical parsers exist
- [ ] Task: Archive track
  - [ ] Update metadata.json status to completed
  - [ ] Move track to `conductor/archive/`
  - [ ] Update `conductor/tracks.md`
