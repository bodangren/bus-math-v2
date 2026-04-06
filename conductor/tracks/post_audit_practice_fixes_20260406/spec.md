# Specification: Practice Engine Post-Audit Fixes

## Overview

Fix issues identified during the Tracks 6–8 code review audit (2026-04-06) that directly affect teacher-facing analytics accuracy and computation reliability. This track addresses misapplied misconception tags, missing test coverage, NaN/Infinity guards, and a duplication hazard.

## Functional Requirements

### FR1: Misconception Tag Accuracy (Priority 2)
- `transaction-matrix.ts` grade function must use `classification-error` (or context-only tags) when the student selects the wrong reasoning-stage column, not `debit-credit-reversal` or `computation-error`.
- `transaction-effects.ts` grade function must use `classification-error` when the student selects the wrong direction (increase/decrease/no-effect) for an effect part, not `debit-credit-reversal`.
- Amount-part errors in `transaction-effects.ts` keep `computation-error` (correct).

### FR2: Misconception Tag Test Coverage (Priority 5)
- All 3 grader families (`transaction-matrix`, `transaction-effects`, `posting-balances`) must have test cases that assert specific `misconceptionTags` on grade-result parts.
- Tests must cover at least: correct answer (no tags), wrong classification (classification-error tag), wrong amount (computation-error tag).

### FR3: Depreciation NaN/Infinity Guards (Priority 4)
- `calculateSL`, `calculateDDB`, `computeUOP` functions in AssetRegisterSimulator, DepreciationMethodComparisonSimulator, and MethodComparisonSimulator must return 0 (or throw) when `usefulLife` is 0 or `totalUnits` is 0.
- Guards live in computation functions, not just user-input validation.

### FR4: simulation-submission.ts Deduplication (Priority 7)
- `simulation-submission.ts` must import `normalizePracticeValue` from `contract.ts` instead of defining its own `normalizeSimulationValue`.

## Non-Functional Requirements

- All changes pass `npm run lint` and `npm run build` with zero errors.
- All existing tests continue to pass; new tests increase coverage.
- No behavioral change to correctly-graded submissions.

## Acceptance Criteria

1. `transaction-matrix.ts` does not emit `debit-credit-reversal` or `computation-error` for reasoning-stage errors.
2. `transaction-effects.ts` does not emit `debit-credit-reversal` for direction-selection errors.
3. 3 test files assert `misconceptionTags` on grade results.
4. 3 depreciation simulators return 0 for usefulLife=0 / totalUnits=0.
5. `simulation-submission.ts` imports `normalizePracticeValue` from `contract.ts`.
6. `npm run lint`, existing + new tests, and `npm run build` all pass.

## Out of Scope

- Double-submit guard standardization across all simulation components (useRef pattern) — deferred to a separate track.
- Omitted-entry tag gap for blank responses — deferred.
- Supabase/Drizzle legacy surface removal — deferred.
