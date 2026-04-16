# Code Review Pass 68 — Implementation Plan

## Phase 1: Stabilization and Bug Fixes

### Task 1: Fix StudyHubHome weak topics filtering bug and lint warning
- [x] Update `StudyHubHome.test.tsx` to use `masteryScore` in mocks and assert weak topics are rendered
- [x] Fix `StudyHubHome.tsx` to use `masteryScore` instead of `mastery` for weak topic filtering
- [x] Remove unnecessary `languageMode` from `useMemo` dependency array
- [x] Run component tests to confirm fix

### Task 2: Fix worker anonymous default export
- [x] Assign worker handler object to a variable before default export in `worker/index.ts`

### Task 3: Fix stale tracks.md archive links
- [x] Update tracks with `./tracks/` links that are already archived to point to `./archive/`

### Task 4: Run lint
- [x] Run `npm run lint` and confirm 0 errors, 0 warnings

### Task 5: Run tests and build
- [x] Run `npm test` and confirm all tests pass
- [x] Run `npm run build` and confirm clean build

### Task 6: Finalize
- [x] Update `current_directive.md` with Pass 68 summary
- [x] Archive track and update `tracks.md`
- [x] Commit with note and push
