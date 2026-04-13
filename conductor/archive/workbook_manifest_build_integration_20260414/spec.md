# Workbook Manifest Build Integration

## Overview

Wire `generate-workbook-manifest.ts` into the build and dev startup steps so the workbook manifest regenerates automatically and stays in sync with the `public/workbooks/` directory.

## Problem

The component manifest (`generate-component-manifest.ts`) is wired into both `predev` (runs before `vinext dev`) and `prebuild` (runs as part of `vinext build`), but the workbook manifest generator runs only manually. This means adding a new workbook file without manually regenerating will cause `workbooks.client.ts` to serve stale lookup data.

## Solution

Add a `generate:workbook-manifest` script to `package.json` and wire it into the `predev` and `prebuild` hooks, paralleling the component manifest setup.

## Scope

- Add `generate:workbook-manifest` npm script to `package.json`
- Update `predev` to run both manifest generators sequentially
- Update `build` to run both manifest generators sequentially before the actual build
- Verify manifest regeneration works correctly

## Out of Scope

- Changes to the manifest generation logic itself (already working)
- Adding empty-directory guards (separate tech-debt item)

## Acceptance Criteria

1. `npm run dev` regenerates both component and workbook manifests before starting the dev server
2. `npm run build` regenerates both manifests before building
3. `npm run generate:workbook-manifest` regenerates only the workbook manifest
4. All existing tests pass after the change