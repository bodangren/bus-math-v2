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

- [x] **Task: Define the 8 core simulations for the curriculum**
  - [x] Identified 8 simulations mapped to Unit 1-8 Lesson 1 (Discovery) slots
  - [x] Spec'd `practice.v1` envelope with `parts` (per-decision) and `artifact` (simulation summary report) for each

- [x] **Task: Implement Simulations 1-4 with `practice.v1` wrapper and artifact generation**
  - [x] LemonadeStand (Unit 1): added `onSubmit`, Submit Results button, `lemonade_stand` artifact
  - [x] StartupJourney (Unit 2): added `onSubmit`, auto-submits on won/lost, `startup_journey` artifact
  - [x] BudgetBalancer (Unit 3): added `onSubmit`, Submit Results button, `budget_balancer` artifact
  - [x] CashFlowChallenge (Unit 4): wrapped existing `onSubmit` with `practice.v1` envelope, `cash_flow_challenge` artifact

- [x] **Task: Implement Simulations 5-8 with `practice.v1` wrapper and artifact generation**
  - [x] AssetTimeMachine (Unit 5): added `onSubmit`, emits on completion, `asset_time_machine` artifact
  - [x] CafeSupplyChaos (Unit 6): added `onSubmit`, emits on completion, `cafe_supply_chaos` artifact
  - [x] CapitalNegotiation (Unit 7): added `onSubmit`, emits on finalize, `capital_negotiation` artifact
  - [x] BusinessStressTest (Unit 8): added `onSubmit`, emits on all-rounds-complete, `business_stress_test` artifact

## Phase 4: Cleanup and Archival

- [x] **Task: Delete legacy `calculations/` components now replaced by Families R-U**
  - Already deleted in Phase 1; verified no stale references remain.

- [x] **Task: Final verification**
  - [x] Run `npm run lint` — passed
  - [x] Run `npm test` — 243 files, 1298 tests passed (2 pre-existing Supabase credential failures)
  - [x] Run `npm run build` — passed after making `@cloudflare/vite-plugin` optional in vite.config.ts

- [x] **Task: Archive track**
