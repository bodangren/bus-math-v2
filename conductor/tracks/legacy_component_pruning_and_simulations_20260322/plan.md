# Implementation Plan: Legacy Component Pruning and Simulation Rebuilds

## Phase 1: Pruning
- [ ] **Task:** Delete obsolete drag-drop and simulation components (`AccountCategorization`, `FinancialStatementMatching`, `TrialBalanceSorting`, `GeneralDragAndDrop`, `LedgerHero`).
- [ ] **Task:** Remove all references to deleted components in the codebase.

## Phase 2: Refactor Display Components
- [ ] **Task:** Refactor the `charts/` directory components to be bug-free and visually aligned with the Accounting Pedagogy Visual Language Standard.

## Phase 3: Implement Families R-U
- [ ] **Task:** Implement Family R (CVP Analysis) and generator.
- [ ] **Task:** Implement Family S (Interest Schedules) and generator.
- [ ] **Task:** Implement Family T (Depreciation Schedules) and generator.
- [ ] **Task:** Implement Family U (Financial Statement Analysis) and generator.

## Phase 4: Rebuild 8 Core Simulations
- [ ] **Task:** Define the 8 core simulations for the curriculum.
- [ ] **Task:** Implement Simulation 1-4 with `practice.v1` wrapper and artifact generation.
- [ ] **Task:** Implement Simulation 5-8 with `practice.v1` wrapper and artifact generation.

## Phase 5: Cleanup and Archival
- [ ] **Task:** Delete legacy `calculations/` components now replaced by Families R-U.
- [ ] **Task:** Archive track.
