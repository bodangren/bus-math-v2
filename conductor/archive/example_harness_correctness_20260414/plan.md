# Implementation Plan

## Phase 1: Fix Example Harness

- [ ] Remove `getPracticeFamily` import from line 9
- [ ] Remove `ProblemFamily` and `GradeResult` type imports (no longer needed)
- [ ] Remove `family` useMemo and null check
- [ ] Remove `generateNewProblem`, `handleSubmit`, `handleGradeWrong` callbacks
- [ ] Remove `problem`, `solution`, `gradeResult`, `showSolution` state
- [ ] Remove mode/seed controls (not applicable without families)
- [ ] Show "Example Review Harness — Not Yet Implemented" state with explanation
- [ ] Keep version hash display (already correct)
- [ ] Keep review checklist infrastructure (for future use)
- [ ] Keep the Back to Queue link and header chrome

## Phase 2: Verification

- [ ] Run `npm run lint` — 0 errors
- [ ] Run `npm test` — all pass
- [ ] Run `npm run build` — passes
- [ ] Update `tech-debt.md` — add note about deferral
- [ ] Archive track