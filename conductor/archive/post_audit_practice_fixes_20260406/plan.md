# Implementation Plan: Practice Engine Post-Audit Fixes

## Phase 1: Fix Transaction-Matrix Misconception Tags + Tests (FR1, FR2)

### Tasks
- [x] **1.1 Write tests** — Add misconception tag assertions to `__tests__/lib/practice/engine/families/transaction-matrix.test.ts`
  - [x] Test: correct answer emits no misconception tags
  - [x] Test: wrong stage-column selection emits `classification-error` (not `debit-credit-reversal` or `computation-error`)
- [x] **1.2 Fix grade function** — In `lib/practice/engine/families/transaction-matrix.ts` lines 394-400:
  - [x] Replace `debit-credit-reversal` with context-only tag (no canonical tag) for cash/offset stage errors
  - [x] Replace `computation-error` with context-only tag for income-statement stage errors
- [x] **1.3 Verify** — Run `npx vitest run __tests__/lib/practice/engine/families/transaction-matrix.test.ts`

## Phase 2: Fix Transaction-Effects Misconception Tags + Tests (FR1, FR2)

### Tasks
- [x] **2.1 Write tests** — Add misconception tag assertions to `__tests__/lib/practice/engine/families/transaction-effects.test.ts`
  - [x] Test: correct answer emits no misconception tags
  - [x] Test: wrong direction (effect) emits `classification-error` (not `debit-credit-reversal`)
  - [x] Test: wrong amount emits `computation-error` (unchanged)
- [x] **2.2 Fix grade function** — In `lib/practice/engine/families/transaction-effects.ts` line 404:
  - [x] Replace `debit-credit-reversal` with `classification-error` for effect-kind parts
- [x] **2.3 Verify** — Run `npx vitest run __tests__/lib/practice/engine/families/transaction-effects.test.ts`

## Phase 3: Posting-Balances Misconception Tag Test Coverage (FR2)

### Tasks
- [x] **3.1 Write tests** — Add misconception tag assertions to `__tests__/lib/practice/engine/families/posting-balances.test.ts`
  - [x] Test: correct balance emits no misconception tags
  - [x] Test: sign-error emits `sign-error` canonical tag
  - [x] Test: wrong amount (same sign) emits `computation-error` canonical tag
- [x] **3.2 Verify** — Run `npx vitest run __tests__/lib/practice/engine/families/posting-balances.test.ts`

## Phase 4: NaN/Infinity Guards in Depreciation Computation Functions (FR3)

### Tasks
- [x] **4.1 Write tests** — Test usefulLife=0 returns 0 for each computation function
  - [x] AssetRegisterSimulator calculateSL and calculateDDB
  - [x] DepreciationMethodComparisonSimulator calculateComparison
  - [x] MethodComparisonSimulator computeSL, computeDDB, computeUOP
- [x] **4.2 Add guards** — Guard usefulLife=0 in computation functions:
  - [x] AssetRegisterSimulator: guard calculateSL and calculateDDB
  - [x] DepreciationMethodComparisonSimulator: guard calculateComparison
  - [x] MethodComparisonSimulator: guard computeSL, computeDDB, computeUOP
- [x] **4.3 Verify** — Run relevant tests

## Phase 5: Deduplicate normalizePracticeValue (FR4)

### Tasks
- [x] **5.1 Refactor** — In `lib/practice/simulation-submission.ts`:
  - [x] Remove `normalizeSimulationValue` function
  - [x] Import `normalizePracticeValue` from `./contract`
  - [x] Replace all call sites of `normalizeSimulationValue` with `normalizePracticeValue`
- [x] **5.2 Verify** — Run `npx vitest` and `npm run build`

## Finalization

- [x] Run `npm run lint`
- [x] Run relevant test suites
- [x] Run `npm run build`
- [x] Update `tech-debt.md` (close resolved items)
- [x] Update `lessons-learned.md` if applicable
- [x] Commit checkpoint and push
