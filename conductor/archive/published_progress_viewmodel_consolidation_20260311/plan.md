# Implementation Plan

## Phase 1: Shared Progress Regression Tests
- [x] Task: Add failing tests for published unit progress row assembly
  - [x] Add helper-level tests that cover versioned titles/descriptions, published-only phase counts, and completed-phase percentage math
  - [x] Add a regression test that proves teacher and student consumers can share the same unit row builder contract
- [x] Task: Add failing tests for lesson phase status assembly
  - [x] Add helper-level tests for `completed`, `current`, `available`, and `locked` transitions
  - [x] Add a regression test that covers in-progress timestamps and ordered phase output

## Phase 2: Shared Helper Refactor
- [x] Task: Centralize published unit progress row assembly
  - [x] Implement shared helper(s) in the published progress layer
  - [x] Refactor `convex/student.ts` dashboard aggregation and `convex/teacher.ts` student-detail aggregation to use the shared helper(s)
- [x] Task: Centralize lesson phase status assembly
  - [x] Implement a reusable phase-status helper for published lesson phases
  - [x] Refactor `convex/student.ts` lesson-progress query to use the shared helper

## Phase 3: Verification and Closeout
- [x] Task: Run lint, automated tests, and production build
- [x] Task: Update README and Conductor memory files with the refactor outcome
