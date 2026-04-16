# Specification: Graphing Explorer Rendering Fix

## Overview

Fix two HIGH severity issues in the Graphing Explorer ported from `ra-integrated-math-3`:
1. `generateFunctionPath` outputs data-space coordinates but SVG expects canvas-space, causing curve misrendering.
2. `GraphingExplorer.tsx` duplicates canonical equation parsing with inline regex that diverges from `parseLinear`/`parseQuadratic` and incorrectly handles coefficient `0` due to `parseFloat(...) || 1`.

## Functional Requirements

1. `generateFunctionPath` must return canvas-space coordinate strings suitable for direct use in SVG `path` `d` attribute.
2. `GraphingCanvas` must render function curves without relying on `transform="scale(1, -1)"` hacks.
3. `GraphingExplorer` must use the shared `parseLinear` and `parseQuadratic` functions from `lib/activities/graphing/` instead of inline regex.
4. Coefficient `0` must be preserved correctly (e.g., `0x^2 + 3x + 1` should parse `a=0`, not `a=1`).

## Non-Functional Requirements

- All existing graphing tests must continue to pass.
- New tests must cover canvas-space path generation and parsing correctness with zero coefficients.
- No changes to exploration configs or activity registry.

## Acceptance Criteria

- [ ] `generateFunctionPath` accepts `range`, `width`, `height` and uses `transformDataToCanvas`.
- [ ] `GraphingCanvas` renders paths without `scale(1, -1)` transform.
- [ ] `GraphingExplorer` imports and uses `parseLinear`/`parseQuadratic`.
- [ ] Zero-coefficient equations parse correctly in `GraphingExplorer`.
- [ ] All graphing-related tests pass.
- [ ] `npm run lint`, `npm test`, `npm run build` all pass.

## Out of Scope

- Adding new graphing features or variants.
- Changing exploration configs (CVP, Supply/Demand, Depreciation).
- Modifying the graphing activity registry.
