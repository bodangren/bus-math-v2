# Implementation Plan: Practice Engine Stabilization

> Split from Practice Production Readiness (Phases 1-2) and Legacy Component Pruning (Phase 3: Families R-U).
> After this track, the family registry is final and Curriculum Rollout can wire all units.

## Phase 1: Engine Bug Fixes

> Fix the 7 bugs that make problems unsolvable, trivial, or leak answers. Each fix is independently testable.

### Tasks

- [x] **Task: G-1 — Add error side to transposition and slide narratives**
  - [x] Write failing test: transposition/slide narrative must include "debit" or "credit"
  - [x] Update narrative templates in `lib/practice/engine/errors.ts` to interpolate `errorSide`
  - [x] Verify existing tests still pass

- [x] **Task: J-1 — Add computation to accrual scenarios**
  - [x] Write failing test: accrual scenario amount must differ from any number in the stem text
  - [x] Update `generateAccrualAdjustmentScenario` to use daily-rate computation (amount = rate × days accrued)
  - [x] Update stem template: "The business earns $X per day… Y days have been earned but not billed"
  - [x] Verify adjusting-calculations family tests still pass

- [x] **Task: J-2 — Add distractor accounts to journal-entry presentation**
  - [x] Write failing test: `availableAccounts.length` must be >= 4 for journal-entry presentation
  - [x] Update `buildJournalEntryDefinition` to add 3–5 distractor accounts from the account pool, filtered by account-type neighborhood
  - [x] Verify journal-entry grading still works with distractors present

- [x] **Task: J-3 — Add useful life to depreciation stem**
  - [x] Write failing test: depreciation stem must contain `usefulLifeMonths` or a human-readable equivalent
  - [x] Update both stem templates in `generateDepreciationAdjustmentScenario` to interpolate useful life
  - [x] Verify adjusting-calculations family tests still pass

- [x] **Task: Fix answer leaks in preview page (N-5.3, O-4)**
  - [x] Update Family N derived-layout cue block to show a prompt ("Compute this value") instead of `parts[0].targetId`
  - [x] Update Family O statement-variant facts card to show input data only (sale amount, cost, discount terms), not computed answers
  - [x] Verify preview page still renders without errors

- [x] **Task: Phase 1 verification**
  - [x] Run `npm run lint`
  - [x] Run `npm test` — full suite (251 files, 1311 tests, 0 failures)
  - [x] Verify no regressions
  - Note: fixed 5 un-authed page test files (hero, home, capstone, curriculum, preface) that broke during the pages redesign.

## Phase 2: Family Consolidation

> Merge D→Q, O→Q, rebuild L. This reduces the family count and the surface area for later phases.

### Tasks

- [x] **Task: Merge Family D into Family Q**
  - [x] Write failing test: `statement-subtotals` family must accept all three of D's statement kinds with D's blank counts as a valid configuration
  - [x] Add D's single-blank income-statement variant as a `density: 'low'` config option on Q
  - [x] Update family registry: remove `statement-completion` key
  - [x] Migrate D's test assertions into Q's test file
  - [x] Update preview page: remove Family D section
  - [x] Search codebase for `statement-completion` references and update
  - [x] Delete `statement-completion.ts` source and test files

- [x] **Task: Merge Family O into Family Q**
  - [x] Q's `retail-income-statement` already covers O's statement presentation (same 3 blanks: net-sales, gross-profit, net-income)
  - [x] O's `numeric` presentation was unused by any lesson — only the preview page consumed it
  - [x] Update family registry: remove `merchandising-computation` key
  - [x] Update preview page: remove Family O section (Q's retail-income-statement preview remains)
  - [x] Delete `merchandising-computation.ts` source and test files
  - [x] Remove from practice-component-contract.md

- [x] **Task: Rebuild Family L as cycle-closing capstone**
  - [x] Write failing test: closing-entry scenario must use mini-ledger with entries for all temp accounts
  - [x] Redesign closing-entry: mini-ledger-driven closing entries that close each revenue/expense account and dividends to retained earnings
  - [x] Remove correcting-entry and reversing-entry scenarios (overlap with Family H journal entries)
  - [x] Catalog reduced from 4 to 2 scenario kinds: reversing-selection and closing-entry

- [x] **Task: Phase 2 verification**
  - [x] Run `npm run lint` — clean
  - [x] Run `npm test` — 249 files, 1308 tests, 0 failures
  - [x] Verify `npm run build` — succeeds
  - [x] Family registry has 15 entries (removed D and O; L rebuilt with mini-ledger)

## Phase 3: New Practice Families (R-U)

> Build 4 new algorithmic families on the `practice.v1` contract, replacing legacy interactive builders.

### Tasks

- [x] **Task: Implement Family R (CVP Analysis) and generator**
  - [x] Write failing tests for CVP scenario generation and grading
  - [x] Build `cvp-analysis` with break-even-units, break-even-dollars, contribution-margin-ratio, and target-profit-units variants
  - [x] Register `cvp-analysis` in family key registry

- [x] **Task: Implement Family S (Interest Schedules) and generator**
  - [x] Write failing tests for interest scenario generation and grading
  - [x] Build `interest-schedules` with simple-interest, compound-interest, and loan-amortization variants
  - [x] Register `interest-schedules` in family key registry

- [x] **Task: Implement Family T (Depreciation Schedules) and generator**
  - [x] Write failing tests for multi-year depreciation generation and grading
  - [x] Build `depreciation-schedules` with straight-line, double-declining, and units-of-production variants
  - [x] Register `depreciation-schedules` in family key registry

- [x] **Task: Implement Family U (Financial Statement Analysis) and generator**
  - [x] Write failing tests for ratio computation and grading
  - [x] Build `financial-analysis` with profitability, liquidity, and leverage variants using mini-ledger
  - [x] Register `financial-analysis` in family key registry

- [x] **Task: Phase 3 verification**
  - [x] Run `npm run lint` — clean
  - [x] Run `npm test` — 253 files, 1324 tests, 0 failures
  - [x] Verify `npm run build` — succeeds
  - [x] Family registry now has 19 entries (15 consolidated + 4 new R-U)
