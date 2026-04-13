# Workbook Manifest Build Integration — Plan

## Phase 1: Add npm scripts and wire hooks

### Tasks

- [x] Add `generate:workbook-manifest` npm script to package.json
- [x] Update `predev` script to run both: `tsx scripts/generate-component-manifest.ts && tsx scripts/generate-workbook-manifest.ts`
- [x] Update `build` script to run both generators before vinext build
- [x] Run `npm run dev` once to verify both manifests regenerate
- [x] Verify `lib/workbooks-manifest.json` is updated with current workbook count

## Phase 2: Verification

### Tasks

- [x] Run `npm run lint` — verify 0 errors
- [x] Run `npm test` — verify all tests pass (1812/1812)
- [x] Run `npm run build` — verify build passes
- [x] Update tech-debt.md to mark "generate-workbook-manifest not wired into build step" as Closed