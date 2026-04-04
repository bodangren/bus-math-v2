# Practice Engine Stabilization — Specification

> Split from Practice Production Readiness (Phases 1-2) and Legacy Component Pruning (Phase 3: Families R-U).

## Overview

Stabilize the practice family registry by fixing 7 engine bugs, consolidating 3 duplicate families, and building 4 new families (R-U). After this track, the full family key set is final and the Curriculum Rollout can wire all units with confidence.

## Functional Requirements

### Phase 1 — Engine bugs (must fix)
- G-1: Add error side to transposition and slide narrative templates
- J-1: Add daily-rate or partial-period computation to accrual scenarios
- J-2: Add 3–5 distractor accounts to journal-entry availableAccounts
- J-3: Add useful life to depreciation stem templates
- N-5.3: Remove leaked answer from derived layout cue block
- O-4: Remove leaked answers from statement-variant facts card

### Phase 2 — Family consolidation
- Merge Family D into Family Q (Q-1 Option A)
- Merge Family O's statement presentation into Family Q; keep numeric as a presentation option (O-1)
- Rebuild Family L as a cycle-closing capstone (L-1)

### Phase 3 — New Practice Families (R-U)

#### Family R: Cost-Volume-Profit (CVP) Analysis
- **Replaces:** `BreakEvenCalculator.tsx`, `BreakEvenComponents.tsx`
- **Pedagogical Purpose:** Teach break-even points, contribution margin, and target profit.
- **Generator:** `cvp-scenario-generator`

#### Family S: Time Value of Money & Interest Schedules
- **Replaces:** `InterestBuilder.tsx`
- **Pedagogical Purpose:** Calculate simple and compound interest, loan amortization.
- **Generator:** `interest-scenario-generator`

#### Family T: Multi-Year Depreciation Schedules
- **Replaces:** `DepreciationBuilder.tsx`
- **Pedagogical Purpose:** Build depreciation schedules (Straight-line, DDB, UOP) over an asset's useful life.
- **Generator:** `asset-schedule-generator`

#### Family U: Financial Statement Analysis (Ratios)
- **Replaces:** `RatioMatching.tsx`, `BudgetCategorySort.tsx` (adapted)
- **Pedagogical Purpose:** Compute and interpret liquidity, solvency, and profitability ratios.
- **Generator:** `mini-ledger` (balanced financial statements)

## Acceptance Criteria

- All 7 bugs produce correct, solvable problems (verified by tests)
- Family count drops from 15 to ~12 after consolidation, then rises to ~16 with R-U
- Family registry keys are final: no further renames or merges expected before curriculum rollout
- Families R-U emit canonical `practice.v1` envelopes and are registered in the family key registry
- lint, test, and build gates pass

## Out of Scope

- Visual redesign of shared components (Practice Visual & Teaching Upgrade track)
- Teaching mode and feedback quality (Practice Visual & Teaching Upgrade track)
- Deletion of legacy components replaced by R-U (Legacy Cleanup track)
- Curriculum wiring of families to lessons (Curriculum Rollout track)
