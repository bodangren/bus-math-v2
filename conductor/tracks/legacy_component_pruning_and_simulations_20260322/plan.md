# Implementation Plan: Legacy Cleanup — Component Pruning, Chart Refactor, and Simulation Rebuilds

> Families R-U creation moved to Practice Engine Stabilization track.
> Depends on Engine Stabilization, Curriculum Rollout, and Visual/Teaching Upgrade being complete.

## Phase 1: Pruning Obsolete Components

- [x] **Task: Delete superseded drag-drop and simulation components**
  - [x] Delete `AccountCategorization`, `FinancialStatementMatching`, `TrialBalanceSorting`, `GeneralDragAndDrop`, `LedgerHero`
  - [x] Remove all references to deleted components in the codebase

- [x] **Task: Delete legacy interactive builders replaced by Families R-U**
  - [x] Delete `BreakEvenCalculator`, `BreakEvenComponents` (replaced by Family R)
  - [x] Delete `InterestBuilder` (replaced by Family S)
  - [x] Delete `DepreciationBuilder` (replaced by Family T)
  - [x] Delete `RatioMatching`, `BudgetCategorySort` (replaced by Family U)
  - [x] Remove all references to deleted builders in the codebase

## Phase 2: Refactor Display Components

- [x] **Task: Refactor the `charts/` directory components**
  - [x] Fix BreakEvenChart prop/state sync bug (useState never re-synced on prop change) and add variableCostRate clamping to [0, 1]
  - [x] Fix FinancialDashboard inconsistent currency formatting (line chart showed cents, summary footer used raw toLocaleString) — unified via shared formatCurrency
  - [x] Add barrel export index.ts for charts directory
  - [x] Add chart-types.ts unit tests for buildChartConfig and formatCurrency

## Phase 3: Rebuild 8 Core Simulations

- [ ] **Task: Define the 8 core simulations for the curriculum**
  - [ ] Identify which units/lessons need Discovery (Lesson 1) and Synthesis (Lesson 7/8) simulations
  - [ ] Spec each simulation's `parts` and `artifact` contract

- [ ] **Task: Implement Simulations 1-4 with `practice.v1` wrapper and artifact generation**

- [ ] **Task: Implement Simulations 5-8 with `practice.v1` wrapper and artifact generation**

## Phase 4: Cleanup and Archival

- [ ] **Task: Delete legacy `calculations/` components now replaced by Families R-U**

- [ ] **Task: Final verification**
  - [ ] Run `npm run lint`
  - [ ] Run `npm test` — full suite
  - [ ] Run `npm run build`

- [ ] **Task: Archive track**
